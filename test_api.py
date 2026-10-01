import requests

try:
    response = requests.get('https://punyogo.uz/api/products/all/')
    print(response.json()[0])
except Exception as e:
    print(f"Error: {e}")
