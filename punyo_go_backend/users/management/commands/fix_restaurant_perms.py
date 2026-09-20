from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from users.models import RestaurantAdminUser

class Command(BaseCommand):
    help = 'Fix permissions for RestaurantAdminUser'

    def handle(self, *args, **options):
        permissions_codenames = [
            'view_category',
            'add_product', 'change_product', 'delete_product', 'view_product',
            'add_productaddon', 'change_productaddon', 'delete_productaddon', 'view_productaddon',
            'change_order', 'view_order',
            'add_restaurantworkinghour', 'change_restaurantworkinghour', 'delete_restaurantworkinghour', 'view_restaurantworkinghour',
            'view_restaurant', 'change_restaurant',
        ]
        perms = Permission.objects.filter(codename__in=permissions_codenames)
        
        admins = RestaurantAdminUser.objects.filter(is_staff=True, is_superuser=False)
        for admin in admins:
            admin.user_permissions.add(*perms)
            self.stdout.write(self.style.SUCCESS(f'Successfully updated permissions for {admin.username}'))
        
        self.stdout.write(self.style.SUCCESS('Done!'))
