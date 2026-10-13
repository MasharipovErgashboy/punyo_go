"""Restaurant partner API — used by the native restaurant app (restoran ilovasi).

Flow: restaurant staff log in -> receive a token -> see incoming orders ->
accept / reject / mark delivered. Push tokens are registered so the device
"rings" on a new order. Telegram stays as a parallel fallback for now.
"""
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes,
)
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

from orders.models import Order
from orders.serializers import OrderSerializer
from .models import Restaurant, RestaurantPushToken


# ---- helpers ---------------------------------------------------------------

def _user_restaurants(user):
    """Restaurants this logged-in user manages."""
    return Restaurant.objects.filter(admin_user=user)


def _get_order_for_user(user, order_id):
    return Order.objects.filter(id=order_id, restaurant__in=_user_restaurants(user)).first()


def _notify_customer(order, accepted, reason=''):
    """DM the customer via the customer bot about accept/reject."""
    try:
        from config.telegram_utils import send_telegram_notification
        uid = getattr(order.user, 'telegram_user_id', None)
        if not uid:
            return
        rname = order.restaurant.name if order.restaurant else 'Restoran'
        if accepted:
            msg = (
                f"✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n"
                f"🍴 {rname} buyurtmangizni (#{order.id}) tayyorlamoqda.\n"
                f"Tez orada yetkazib beramiz."
            )
        else:
            msg = f"❌ <b>Buyurtmangiz rad etildi.</b>\n\n🍴 {rname} (#{order.id})"
            if reason:
                msg += f"\n📝 Sabab: {reason}"
        send_telegram_notification(msg, chat_id=str(uid))
    except Exception as e:
        print(f"[partner] notify customer error: {e}")


# ---- auth ------------------------------------------------------------------

@api_view(['POST'])
def partner_login(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''
    if not username or not password:
        return Response({'error': "Login va parolni kiriting"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': "Login yoki parol xato"}, status=status.HTTP_401_UNAUTHORIZED)

    rests = _user_restaurants(user)
    if not rests.exists():
        return Response({'error': "Bu foydalanuvchiga restoran biriktirilmagan"},
                        status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'name': user.first_name or user.username,
        'restaurants': [{'id': str(r.id), 'name': r.name} for r in rests],
    })


# ---- orders ----------------------------------------------------------------

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def partner_orders(request):
    """List this restaurant's orders. ?status=new|active|open|all (default open)."""
    rests = _user_restaurants(request.user)
    qs = Order.objects.filter(restaurant__in=rests)

    status_param = (request.query_params.get('status') or 'open').lower()
    if status_param == 'new':
        qs = qs.filter(status='pending')
    elif status_param == 'active':
        qs = qs.filter(status__in=['active', 'ready', 'delivering'])
    elif status_param == 'open':
        qs = qs.filter(status__in=['pending', 'active', 'ready', 'delivering'])
    # 'all' => no status filter

    qs = qs.order_by('-created_at')[:100]
    return Response({
        'orders': OrderSerializer(qs, many=True).data,
        'new_count': Order.objects.filter(restaurant__in=rests, status='pending').count(),
    })


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def partner_accept(request, order_id):
    order = _get_order_for_user(request.user, order_id)
    if not order:
        return Response({'error': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)
    order.status = 'active'
    order.save()
    _notify_customer(order, accepted=True)
    return Response({'status': 'ok', 'order': OrderSerializer(order).data})


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def partner_reject(request, order_id):
    order = _get_order_for_user(request.user, order_id)
    if not order:
        return Response({'error': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)
    reason = (request.data.get('reason') or '').strip()
    order.status = 'canceled'
    if reason:
        order.notes = (f"{order.notes}\n[Rad etildi: {reason}]").strip()
    order.save()
    _notify_customer(order, accepted=False, reason=reason)
    return Response({'status': 'ok', 'order': OrderSerializer(order).data})


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def partner_complete(request, order_id):
    """Mark as delivered (restaurant delivers themselves)."""
    order = _get_order_for_user(request.user, order_id)
    if not order:
        return Response({'error': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)
    order.status = 'completed'
    order.save()
    return Response({'status': 'ok', 'order': OrderSerializer(order).data})


# ---- push token ------------------------------------------------------------

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def register_push_token(request):
    token = (request.data.get('token') or '').strip()
    restaurant_id = request.data.get('restaurant_id')
    device_name = (request.data.get('device_name') or '').strip()
    if not token:
        return Response({'error': 'token required'}, status=status.HTTP_400_BAD_REQUEST)

    rests = _user_restaurants(request.user)
    rest = rests.filter(id=restaurant_id).first() if restaurant_id else rests.first()
    if not rest:
        return Response({'error': 'Restoran topilmadi'}, status=status.HTTP_403_FORBIDDEN)

    _, created = RestaurantPushToken.objects.update_or_create(
        token=token,
        defaults={'restaurant': rest, 'device_name': device_name},
    )
    return Response({'status': 'ok', 'created': created})
