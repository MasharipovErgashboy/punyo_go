from django.core.management.base import BaseCommand
from products.models import Category, Product
from restaurants.models import Restaurant
from about_us.models import Advertisement


class Command(BaseCommand):
    help = "Re-save all objects to regenerate optimized (smaller) image_base64."

    def handle(self, *args, **options):
        total = 0
        for Model in (Category, Product, Restaurant, Advertisement):
            for obj in Model.objects.all():
                try:
                    obj.save()
                    total += 1
                except Exception as e:
                    self.stdout.write(f"  skip {Model.__name__} {obj.pk}: {e}")
            self.stdout.write(f"{Model.__name__}: done")
        self.stdout.write(f"REPROCESS_DONE total={total}")
