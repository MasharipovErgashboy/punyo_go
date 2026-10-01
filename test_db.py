import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from restaurants.models import Restaurant
for r in Restaurant.objects.all():
    print(f"ID: {r.id}, Phone: '{r.phone}'")
