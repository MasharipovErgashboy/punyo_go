"""Create (or update) a login for a restaurant's partner app.

Usage:
    python manage.py create_restaurant_login --restaurant "Oq Saroy" --username oqsaroy --password 123456

Links a UserProfile (admin_user) to the restaurant so they can log in from
the restaurant app and see that restaurant's orders.
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from restaurants.models import Restaurant

User = get_user_model()


class Command(BaseCommand):
    help = "Create or update a restaurant partner login"

    def add_arguments(self, parser):
        parser.add_argument('--restaurant', required=True, help="Restaurant name (or part of it)")
        parser.add_argument('--username', required=True)
        parser.add_argument('--password', required=True)

    def handle(self, *args, **opts):
        name = opts['restaurant']
        username = opts['username']
        password = opts['password']

        rests = Restaurant.objects.filter(name__icontains=name)
        if not rests.exists():
            raise CommandError(f"'{name}' nomli restoran topilmadi")
        if rests.count() > 1:
            names = ', '.join(rests.values_list('name', flat=True))
            raise CommandError(f"Bir nechta restoran topildi: {names}. Aniqroq nom bering.")
        rest = rests.first()

        user, created = User.objects.get_or_create(
            username=username,
            defaults={'first_name': rest.name, 'is_staff': True},
        )
        user.is_staff = True
        user.set_password(password)
        user.save()

        rest.admin_user = user
        rest.save(update_fields=['admin_user'])

        action = "yaratildi" if created else "yangilandi"
        self.stdout.write(self.style.SUCCESS(
            f"✅ Login {action}: '{username}' -> '{rest.name}' restoraniga biriktirildi."
        ))
