import json
import threading
import requests
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product

def send_telegram_notification(product):
    import datetime
    log_msg = f"[{datetime.datetime.now()}] Starting send_telegram_notification for product {product.id}\n"
    
    bot_token = settings.BOT_TOKEN
    chat_id = product.restaurant.telegram_chat_id if product.restaurant else None
    
    log_msg += f"Token: {'Set' if bot_token else 'Missing'}, Chat ID: {chat_id}\n"
    
    if not bot_token or not chat_id:
        with open('/tmp/telegram_debug.log', 'a') as log_f:
            log_f.write(log_msg + "Aborting: Missing token or chat_id\n")
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
            log_msg += f"Sending with image: {product.image.path}\n"
            with open(product.image.path, 'rb') as f:
                res = requests.post(url, data=data, files={'photo': f}, timeout=15)
        else:
            log_msg += "Sending without image\n"
            res = requests.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage", 
                data={"chat_id": chat_id, "text": text, "parse_mode": "HTML", "reply_markup": json.dumps(reply_markup)}, 
                timeout=15
            )
        log_msg += f"Response: {res.text}\n"
    except Exception as e:
        log_msg += f"Exception: {e}\n"
        
    with open('/tmp/telegram_debug.log', 'a') as log_f:
        log_f.write(log_msg)

@receiver(post_save, sender=Product)
def product_post_save(sender, instance, created, **kwargs):
    if created:
        threading.Thread(target=send_telegram_notification, args=(instance,)).start()
