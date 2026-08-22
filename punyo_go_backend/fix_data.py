import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from products.models import Product
from orders.models import Order
from restaurants.models import Restaurant

rest = Restaurant.objects.first()
if rest:
    # Fix products
    products = Product.objects.filter(restaurant__isnull=True)
    count = products.count()
    products.update(restaurant=rest)
    print(f"Fixed {count} products.")
    
    # Fix orders
    orders = Order.objects.filter(restaurant__isnull=True)
    count2 = orders.count()
    orders.update(restaurant=rest)
    print(f"Fixed {count2} orders.")
else:
    print("No restaurants found.")
