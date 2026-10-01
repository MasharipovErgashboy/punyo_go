import requests

try:
    # use a real or fake telegram user ID
    response = requests.get('https://punyogo.uz/api/products/categories/?telegram_user_id=999999')
    print(response.status_code)
    print(response.text[:200])
except Exception as e:
    print(f"Error: {e}")
