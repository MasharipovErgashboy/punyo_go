import base64
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile
import uuid
from django.db import models
from django.conf import settings

from users.constants import DISTRICT_CHOICES

class Restaurant(models.Model):
    """Restaurant model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name="Unique ID")
    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='managed_restaurants',
        verbose_name="Restoran Admini (User)"
    )
    telegram_chat_id = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name="Telegram Guruh/Kanal ID",
        help_text="Yangi buyurtmalar keladigan guruh yoki kanal ID-si (masalan: -100123456789)"
    )
    name = models.CharField(max_length=200, verbose_name="Restoran nomi")
    image = models.ImageField(upload_to='restaurants/', verbose_name="Restoran rasmi")
    image_base64 = models.TextField(blank=True, null=True, verbose_name="Rasm (Base64)")
    location = models.CharField(max_length=50, choices=DISTRICT_CHOICES, verbose_name="Joylashuvi")
    location_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Joylashuv Linki (Xarita)", help_text="Ixtiyoriy: Yandex/Google Maps linkini kiriting")
    phone = models.CharField(max_length=20, verbose_name="Telefon raqami")
    delivery_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Yetkazib berish narxi (UZS)")
    telegram_delivery_chat_id = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name="Dostavka uchun Telegram Kanal/Guruh ID",
        help_text="Tasdiqlangan buyurtmalar shu kanalga yuboriladi (masalan: -100123456789)"
    )
    is_active = models.BooleanField(default=True, verbose_name="Aktiv")
    telegram_notifications = models.BooleanField(
        default=True,
        verbose_name="Telegram guruhiga xabar yuborilsinmi",
        help_text="O'chirilsa, yangi buyurtmalar Telegram guruhiga yuborilmaydi (faqat ilovaga). Test restoran uchun o'chiring."
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqt")
    
    class Meta:
        verbose_name = "Restoran"
        verbose_name_plural = "Restoranlar"
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if self.image:
            try:
                img = Image.open(self.image)
                img.thumbnail((500, 500))
                buffer = BytesIO()
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(buffer, format="JPEG", quality=60)
                img_str = base64.b64encode(buffer.getvalue()).decode()
                self.image_base64 = f"data:image/jpeg;base64,{img_str}"
            except Exception as e:
                print(f"Error processing restaurant image: {e}")
        else:
            self.image_base64 = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class RestaurantPushToken(models.Model):
    """Expo push notification token for a restaurant device (planshet/telefon)"""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='push_tokens', verbose_name="Restoran")
    token = models.CharField(max_length=255, unique=True, verbose_name="Expo push token")
    device_name = models.CharField(max_length=120, blank=True, default='', verbose_name="Qurilma nomi")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Push token (qurilma)"
        verbose_name_plural = "Push tokenlar (qurilmalar)"

    def __str__(self):
        return f"{self.restaurant.name} — {self.token[:20]}…"


class RestaurantWorkingHour(models.Model):
    """Working hours for a restaurant"""
    restaurant = models.OneToOneField(Restaurant, on_delete=models.CASCADE, related_name='working_hours', verbose_name="Restoran")
    start_time = models.TimeField(verbose_name="Ish boshlanish vaqti")
    end_time = models.TimeField(verbose_name="Ish tugash vaqti")
    
    class Meta:
        verbose_name = "Ish vaqti"
        verbose_name_plural = "Ish vaqtlari"
        
    def __str__(self):
        return f"{self.restaurant.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"
