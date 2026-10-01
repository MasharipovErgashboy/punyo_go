import requests

try:
    response = requests.get('https://punyogo.uz/api/products/categories/')
    print(response.status_code)
    print(response.text[:200])
except Exception as e:
    print(f"Error: {e}")
