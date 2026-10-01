import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'punyo_go_backend.settings')
django.setup()

from restaurants.models import Restaurant
rests = Restaurant.objects.all()
for r in rests:
    print(f"ID: {r.id}, Name: {r.name}, Phone: '{r.phone}'")
