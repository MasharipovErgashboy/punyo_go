from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from users.models import UserProfile
from .models import Order, OrderItem
from .serializers import OrderSerializer



    if code:
        code = str(code).strip()
    else:
        code = ''
        
    if not code:
        return Response({'error': 'Promokod kiritilmagan'}, status=status.HTTP_400_BAD_REQUEST)
        
    promo = PromoCode.objects.filter(code=code, is_active=True).first()
    
    if not promo:
        return Response({'error': 'Promokod eskirgan yoki xato'}, status=status.HTTP_400_BAD_REQUEST)
        
    if promo.times_used >= promo.usage_limit:
     
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
            
        # Validate promo code if provided
        promo_code = data.get('promo_code')
        if promo_code:
            promo_code = str(promo_code).strip()
        else:
            promo_code = ''
            
        valid_promo = None
        if promo_code:
            valid_promo = PromoCode.objects.filter(code=promo_code, is_active=True).first()
            if valid_promo and valid_promo.times_used < valid_promo.usage_limit:
                pass # valid
            else:
                valid_promo = None

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
                
            delivery_price = Decimal('0')
            if order.restaurant and order.restaurant.delivery_price:
                delivery_price = order.restaurant.delivery_price
                
            sub_total = total_amount + delivery_price
            discount_amount = Decimal('0')
            
            if valid_promo:
                discount_amount = sub_total * (Decimal(valid_promo.discount_percent) / Decimal('100'))
                order.promo_code = valid_promo
                order.discount_amount = discount_amount
                
            order.total_amount = sub_total - discount_amount
            order.save()
            created_orders.append(order)
            
            # Calculate if delayed
            is_delayed = False
            from django.utils import timezone
            import datetime
            from zoneinfo import ZoneInfo

            if hasattr(order.restaurant, 'working_hours'):
                wh = order.restaurant.working_hours
                tz = ZoneInfo('Asia/Tashkent')
                now_tz = timezone.localtime(timezone.now(), tz)
                current_time = now_tz.time()
                
                end_t = wh.end_time
                if end_t.hour == 0 and end_t.minute == 0:
                    end_t = datetime.time(23, 59, 59)
                
                if wh.start_time < end_t:
                    if not (wh.start_time <= current_time <= end_t):
                        is_delayed = True
                else:
                    if not (current_time >= wh.start_time or current_time <= end_t):
                        is_delayed = True
                
                if is_delayed:
                    send_time = now_tz.replace(hour=wh.start_time.hour, minute=wh.start_time.minute, second=0, microsecond=0)
                    if send_time <= now_tz:
                        send_time += datetime.timedelta(days=1)
                    order.send_at = send_time
                    order.is_telegram_sent = False
                    order.save()

            if not is_delayed:
                # Send notification to Telegram group
                try:
                    from config.telegram_utils import send_telegram_notification
                    
                    scheme = request.scheme
                    host = request.get_host()
                    admin_link = f"{scheme}://{host}/admin/orders/order/{order.id}/change/"
                    
                    cust_name = html.escape(f"{user.first_name} {user.last_name}")
                    addr = html.escape(order.delivery_address or 'Ko\'rsatilmagan')
                    notes = html.escape(order.notes or 'Yo\'q')

                    delivery_text = ""
                    if delivery_price > 0:
                        delivery_text = f"🛵 <b>Yetkazib berish:</b> {delivery_price:,.0f} UZS\n"
                        
                    promo_text = ""
                    if valid_promo:
                        promo_text = f"🎟 <b>Promokod:</b> {valid_promo.code} (-{valid_promo.discount_percent}%)\n"
                        promo_text += f"📉 <b>Chegirma:</b> -{discount_amount:,.0f} UZS\n"

                    msg = (
                        "<b>🔔 Yangi buyurtma kelib tushdi!</b>\n\n"
                        f"🆔 <b>Buyurtma ID:</b> #{order.id}\n"
                        f"👤 <b>Mijoz:</b> {cust_name}\n"
                        f"📞 <b>Telefon:</b> <code>{order.phone_number}</code>\n"
                        f"📍 <b>Manzil:</b> {addr}\n"
                        f"💬 <b>Izoh:</b> {notes}\n\n"
                        "📦 <b>Mahsulotlar:</b>\n"
                        f"{items_list_str}\n"
                        f"💵 <b>Mahsulotlar summasi:</b> {total_amount:,.0f} UZS\n"
                        f"{delivery_text}"
                        f"{promo_text}"
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
                            ]
                        ]
                    })
                    
                    # Send to specific restaurant chat if available
                    chat_id = order.restaurant.telegram_chat_id if order.restaurant and order.restaurant.telegram_chat_id else None
                    send_telegram_notification(msg, chat_id=chat_id, reply_markup=reply_markup_json)
                except Exception as e:
                    print(f"DEBUG: Failed to send TG notification: {e}")

        if valid_promo:
            valid_promo.times_used += 1
            if valid_promo.times_used >= valid_promo.usage_limit:
                valid_promo.is_active = False
            valid_promo.save()

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
    orders = Order.objects.filter(user=user, status__in=['active', 'ready', 'delivering'])
    
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
        old_status = order.status
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = new_status
        order.save()
        
        # If the order is newly marked as ready for delivery
        if new_status == 'ready' and old_status != 'ready':
            if order.restaurant and order.restaurant.telegram_delivery_chat_id:
                try:
                    import urllib.parse
                    import json
                    from config.telegram_utils import send_telegram_notification
                    
                    delivery_chat_id = order.restaurant.telegram_delivery_chat_id
                    
                    # Formatting data
                    cust_phone = order.phone_number or "Kiritilmagan"
                    rest_phone = order.restaurant.phone or "Kiritilmagan"
                    
                    # Yandex Maps link for Restaurant
                    if order.restaurant.location_url:
                        rest_map_link = order.restaurant.location_url
                    else:
                        encoded_rest_location = urllib.parse.quote(order.restaurant.location or "")
                        rest_map_link = f"https://yandex.com/maps/?text={encoded_rest_location}"
                    
                    # Yandex Maps link for Customer
                    if order.latitude and order.longitude:
                        cust_map_link = f"https://yandex.com/maps/?pt={order.longitude},{order.latitude}&z=16&l=map"
                    else:
                        encoded_cust_address = urllib.parse.quote(order.delivery_address or "")
                        cust_map_link = f"https://yandex.com/maps/?text={encoded_cust_address}"
                    
                    items_list_str = ""
                    for idx, item in enumerate(order.items.all(), 1):
                        p_name = html.escape(item.product.name)
                        items_list_str += f"{idx}. <b>{p_name}</b> — {item.quantity} dona\n"
                    
                    msg = (
                        "<b>🚀 YETKAZIB BERISH UCHUN YANGI BUYURTMA</b>\n\n"
                        f"🆔 <b>Buyurtma ID:</b> #{order.id}\n"
                        f"💰 <b>Jami summa:</b> {order.total_amount:,.0f} UZS\n\n"
                        "📦 <b>Mahsulotlar:</b>\n"
                        f"{items_list_str}\n"
                        "🏪 <b>Restoran:</b>\n"
                        f"Nomi: {html.escape(order.restaurant.name)}\n"
                        f"Tel: <code>{rest_phone}</code>\n"
                        f"📍 <a href='{rest_map_link}'>Restoran manzilini xaritada ochish</a>\n\n"
                        "👤 <b>Mijoz:</b>\n"
                        f"Mijoz tel: <code>{cust_phone}</code>\n"
                        f"Manzil: {html.escape(order.delivery_address or 'Ko\'rsatilmagan')}\n"
                        f"📍 <a href='{cust_map_link}'>Mijoz manzilini xaritada ochish</a>\n"
                    )
                    
                    reply_markup_json = json.dumps({
                        "inline_keyboard": [
                            [{"text": "✅ Tasdiqlash", "callback_data": f"accept_delivery_{order.id}"}]
                        ]
                    })
                    
                    send_telegram_notification(msg, chat_id=delivery_chat_id, reply_markup=reply_markup_json)
                except Exception as e:
                    print(f"DEBUG: Failed to send delivery notification: {e}")
        
        return Response({'status': 'success', 'order_id': order.id, 'new_status': new_status})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
