import os, django, urllib.request, json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from restaurants.models import Restaurant
from config.telegram_utils import send_telegram_notification

tok = os.getenv('BOT_TOKEN', '')
print('DIAG_TOKEN_SET:', bool(tok), '| tail:', (tok[-6:] if tok else 'EMPTY'))
try:
    with urllib.request.urlopen(f'https://api.telegram.org/bot{tok}/getMe', timeout=10) as resp:
        me = json.load(resp)
    print('DIAG_BOT:', me['result']['username'] if me.get('ok') else me.get('description'))
except Exception as e:
    print('DIAG_BOT_ERR:', repr(e))

r = Restaurant.objects.filter(name__icontains='ziyo').first()
print('DIAG_ZIYO_CHATID:', repr(r.telegram_chat_id) if r else 'NO_RESTAURANT')
try:
    ok = send_telegram_notification('DIAG: server notification test', chat_id=(r.telegram_chat_id if r else None))
    print('DIAG_SEND_OK:', ok)
except Exception as e:
    print('DIAG_SEND_ERR:', repr(e))
