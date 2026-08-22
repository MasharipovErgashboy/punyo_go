import json
import threading
import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product

def send_telegram_notification(product):
    bot_token = settings.BOT_TOKEN
    chat_id = product.restaurant.telegram_chat_id if product.restaurant else None
    
    if not bot_token or not chat_id:
        return

    text = (
        f"🌟 <b>Yangi mahsulot!</b>\n\n"
        f"🍔 <b>Nomi:</b> {product.name}\n"
        f"💰 <b>Narxi:</b> {product.price:,.0f} UZS\n"
    )
    if product.description:
        text += f"📝 <b>Tarkibi:</b> {product.description}\n"
        
    text += f"\n🏢 <b>Restoran:</b> {product.restaurant.name}"
    
    url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
    
    reply_markup = {
        "inline_keyboard": [
            [{"text": "🚀 Buyurtma berish", "url": settings.WEBAPP_URL}]
        ]
    }
    
    data = {
        "chat_id": chat_id,
        "caption": text,
        "parse_mode": "HTML",
        "reply_markup": json.dumps(reply_markup)
    }
    
    try:
        if product.image:
            with open(product.image.path, 'rb') as f:
                requests.post(url, data=data, files={'photo': f}, timeout=10)
        else:
            requests.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage", 
                data={"chat_id": chat_id, "text": text, "parse_mode": "HTML", "reply_markup": json.dumps(reply_markup)}, 
                timeout=10
            )
    except Exception as e:
        print(f"Error sending Telegram notification: {e}")

@receiver(post_save, sender=Product)
def product_post_save(sender, instance, created, **kwargs):
    if created:
        # Run in a separate thread so it doesn't block the admin panel UI
        threading.Thread(target=send_telegram_notification, args=(instance,)).start()
