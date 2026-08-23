from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from users.models import UserProfile
from .models import Order, OrderItem
from .serializers import OrderSerializer


from django.db import transaction
from products.models import Product
from decimal import Decimal
import traceback
import html
import json
from django.conf import settings

@api_view(['POST'])
@transaction.atomic
def create_order(request):
    """Create a new order with items and location"""
    try:
        data = request.data
        telegram_user_id = data.get('telegram_user_id')
        items_data = data.get('items', [])
        
        print(f"DEBUG: Creating order for user {telegram_user_id}. Data: {data}")
        
        if not telegram_user_id:
            return Response({'error': 'telegram_user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not items_data:
            return Response({'error': 'items required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(UserProfile, telegram_user_id=telegram_user_id)
        
        # Group items by restaurant to split orders if necessary
        restaurant_items = {}
        for item in items_data:
            product_id = item.get('product_id')
            product = get_object_or_404(Product, id=product_id)
            restaurant_id = product.restaurant_id if product.restaurant else None
            
            if restaurant_id not in restaurant_items:
                restaurant_items[restaurant_id] = []
            restaurant_items[restaurant_id].append({
                'product': product,
                'quantity': int(item.get('quantity', 1))
            })
            
        created_orders = []
        for restaurant_id, items in restaurant_items.items():
            order = Order.objects.create(
                user=user,
                restaurant_id=restaurant_id,
                phone_number=data.get('phone_number', user.phone_number),
                delivery_address=data.get('delivery_address', ''),
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                notes=data.get('notes', ''),
                status='pending'
            )
            
            total_amount = Decimal('0')
            items_list_str = ""
            for idx, item in enumerate(items, 1):
                product = item['product']
                quantity = item['quantity']
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=product.price
                )
                total_amount += product.price * quantity
                
                p_name = html.escape(product.name)
                items_list_str += f"{idx}. <b>{p_name}</b> — {quantity} dona\n"
                
            order.total_amount = total_amount
            order.save()
            created_orders.append(order)
            
            # Send notification to Telegram group
            try:
                from config.telegram_utils import send_telegram_notification
                
                scheme = request.scheme
                host = request.get_host()
                admin_link = f"{scheme}://{host}/admin/orders/order/{order.id}/change/"
                
                cust_name = html.escape(f"{user.first_name} {user.last_name}")
                addr = html.escape(order.delivery_address or 'Ko\'rsatilmagan')
                notes = html.escape(order.notes or 'Yo\'q')

                msg = (
                    "<b>🔔 Yangi buyurtma kelib tushdi!</b>\n\n"
                    f"🆔 <b>Buyurtma ID:</b> #{order.id}\n"
                    f"👤 <b>Mijoz:</b> {cust_name}\n"
                    f"📞 <b>Telefon:</b> <code>{order.phone_number}</code>\n"
                    f"📍 <b>Manzil:</b> {addr}\n"
                    f"💬 <b>Izoh:</b> {notes}\n\n"
                    "📦 <b>Mahsulotlar:</b>\n"
                    f"{items_list_str}\n"
                    f"💰 <b>Jami summa:</b> {order.total_amount:,.0f} UZS\n\n"
                    "🚀 Buyurtmani boshqarish uchun admin panelga o'ting:\n"
                    f"🔗 <a href='{admin_link}'>Admin panelga o'tish</a>"
                )
                
                # Build reply markup with Accept and Reject buttons
                reply_markup_json = json.dumps({
                    "inline_keyboard": [
                        [
                            {"text": "✅ Tasdiqlash", "callback_data": f"accept_order_{order.id}"},
                            {"text": "❌ Rad etish", "callback_data": f"reject_order_{order.id}"}
                        ],
                        [
                            {"text": "🚀 Mini App", "url": settings.WEBAPP_URL} if hasattr(settings, 'WEBAPP_URL') else {"text": "🚀 Mini App", "url": "https://punyogo.uz"}
                        ]
                    ]
                })
                
                # Send to specific restaurant chat if available
                chat_id = order.restaurant.telegram_chat_id if order.restaurant and order.restaurant.telegram_chat_id else None
                send_telegram_notification(msg, chat_id=chat_id, reply_markup=reply_markup_json)
            except Exception as e:
                print(f"DEBUG: Failed to send TG notification: {e}")

        # Return the first created order to satisfy frontend
        if created_orders:
            serializer = OrderSerializer(created_orders[0])
            print(f"DEBUG: {len(created_orders)} Orders created successfully.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'No orders created'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"ERROR in create_order: {str(e)}")
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_active_orders(request):
    """Get user's pending (Faol) orders"""
    telegram_user_id = request.query_params.get('telegram_user_id')
    
    if not telegram_user_id:
        return Response({'error': 'telegram_user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = get_object_or_404(UserProfile, telegram_user_id=telegram_user_id)
    orders = Order.objects.filter(user=user, status='pending')
    
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})


@api_view(['GET'])
def get_confirmed_orders(request):
    """Get user's confirmed (active) orders"""
    telegram_user_id = request.query_params.get('telegram_user_id')
    
    if not telegram_user_id:
        return Response({'error': 'telegram_user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = get_object_or_404(UserProfile, telegram_user_id=telegram_user_id)
    orders = Order.objects.filter(user=user, status='active')
    
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})


@api_view(['GET'])
def get_all_orders(request):
    """Get all user orders"""
    telegram_user_id = request.query_params.get('telegram_user_id')
    
    if not telegram_user_id:
        return Response({'error': 'telegram_user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = get_object_or_404(UserProfile, telegram_user_id=telegram_user_id)
    orders = Order.objects.filter(user=user)
    
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})


@api_view(['GET'])
def test_notification(request):
    """Test Telegram notification from the backend environment"""
    try:
        from config.telegram_utils import send_telegram_notification
        msg = "🔍 <b>Backend Test:</b> Telegram xabarnoma tekshiruvi (Test endpoint)."
        success = send_telegram_notification(msg)
        if success:
            return Response({'status': 'Message sent successfully!'})
        else:
            return Response({'error': 'Failed to send message.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_canceled_orders(request):
    """Get user's canceled (Rad etilgan) orders"""
    telegram_user_id = request.query_params.get('telegram_user_id')
    
    if not telegram_user_id:
        return Response({'error': 'telegram_user_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = get_object_or_404(UserProfile, telegram_user_id=telegram_user_id)
    orders = Order.objects.filter(user=user, status='canceled')
    
    serializer = OrderSerializer(orders, many=True)
    return Response({'orders': serializer.data})


@api_view(['PATCH'])
def update_order_status(request, order_id):
    """Update order status via Bot API"""
    try:
        order = get_object_or_404(Order, id=order_id)
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = new_status
        order.save()
        
        return Response({'status': 'success', 'order_id': order.id, 'new_status': new_status})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
