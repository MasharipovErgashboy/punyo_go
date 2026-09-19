from django.core.management.base import BaseCommand
from django.utils import timezone
from orders.models import Order
from decimal import Decimal
import html
import json

class Command(BaseCommand):
    help = 'Send delayed orders to telegram channels'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        # Find orders that are pending, not sent, and whose send_at time has passed
        orders = Order.objects.filter(
            status='pending', 
            is_telegram_sent=False, 
            send_at__lte=now
        )
        
        count = 0
        for order in orders:
            self.send_telegram(order)
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f'Successfully processed {count} delayed orders.'))

    def send_telegram(self, order):
        try:
            from config.telegram_utils import send_telegram_notification
            
            # Since request is not available here, we need settings or hardcode domain.
            # In a real app we'd use settings.DOMAIN or Site.objects.get_current()
            # For this simple implementation, we'll assume standard admin url
            from django.conf import settings
            domain = getattr(settings, 'DOMAIN', 'humo-tezkor.uz')
            admin_link = f"https://{domain}/admin/orders/order/{order.id}/change/"
            
            user = order.user
            cust_name = html.escape(f"{user.first_name} {user.last_name}")
            addr = html.escape(order.delivery_address or 'Ko\'rsatilmagan')
            notes = html.escape(order.notes or 'Yo\'q')

            delivery_price = Decimal('0')
            if order.restaurant and order.restaurant.delivery_price:
                delivery_price = order.restaurant.delivery_price

            delivery_text = ""
            if delivery_price > 0:
                delivery_text = f"🛵 <b>Yetkazib berish:</b> {delivery_price:,.0f} UZS\n"
                
            promo_text = ""
            if order.promo_code:
                promo_text = f"🎟 <b>Promokod:</b> {order.promo_code.code} (-{order.promo_code.discount_percent}%)\n"
                promo_text += f"📉 <b>Chegirma:</b> -{order.discount_amount:,.0f} UZS\n"

            # reconstruct items list
            items_list_str = ""
            total_amount = Decimal('0')
            for idx, item in enumerate(order.items.all(), 1):
                quantity = item.quantity
                product = item.product
                total_amount += product.price * quantity
                p_name = html.escape(product.name)
                items_list_str += f"{idx}. <b>{p_name}</b> — {quantity} dona\n"

            msg = (
                "<b>🔔 Yangi buyurtma kelib tushdi! (Kechiktirilgan)</b>\n\n"
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
            
            # mark as sent
            order.is_telegram_sent = True
            order.save(update_fields=['is_telegram_sent'])
            
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"DEBUG: Failed to send TG notification for order {order.id}: {e}"))
