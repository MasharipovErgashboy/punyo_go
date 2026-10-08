import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from orders.models import Order
from restaurants.models import Restaurant
from django.utils import timezone
try:
    from zoneinfo import ZoneInfo
    now_tz = timezone.localtime(timezone.now(), ZoneInfo('Asia/Tashkent'))
except Exception:
    now_tz = timezone.localtime(timezone.now())
print('DIAGC_NOW:', now_tz.isoformat())
z = Restaurant.objects.filter(name__icontains='ziyo').first()
if z:
    wh = getattr(z, 'working_hours', None)
    print('DIAGC_ZIYO_HOURS:', (str(wh.start_time)+'-'+str(wh.end_time)) if wh else 'NO_HOURS')
    print('DIAGC_ZIYO_CHAT:', repr(z.telegram_chat_id))
for o in Order.objects.order_by('-id')[:8]:
    r = o.restaurant
    print(f'DIAGC_ORDER id={o.id} status={o.status} rest={r.name if r else "NONE"} chat={repr(r.telegram_chat_id) if r else None} tg_sent={o.is_telegram_sent} send_at={o.send_at} created={o.created_at.isoformat()}')
