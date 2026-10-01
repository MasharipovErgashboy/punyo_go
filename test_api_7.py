import requests

try:
    response = requests.get('https://punyogo.uz/api/users/me/?telegram_user_id=1418706342')
    print(response.status_code)
    print(response.text[:200])
except Exception as e:
    print(f"Error: {e}")
