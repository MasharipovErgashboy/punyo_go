import requests

data = {
    "telegram_user_id": 999999,
    "items": [{"product_id": 1, "quantity": 1}],
    "latitude": 40.0,
    "longitude": 68.0,
    "delivery_address": "Test",
    "phone_number": "+998901234567"
}

try:
    response = requests.post('https://punyogo.uz/api/orders/create/', json=data)
    print(response.status_code)
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
