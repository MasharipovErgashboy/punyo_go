import uuid
from django.db import models
from django.conf import settings

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
    location = models.CharField(max_length=255, verbose_name="Joylashuvi")
    phone = models.CharField(max_length=20, verbose_name="Telefon raqami")
    delivery_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Yetkazib berish narxi (UZS)")
    is_active = models.BooleanField(default=True, verbose_name="Aktiv")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan vaqt")
    
    class Meta:
        verbose_name = "Restoran"
        verbose_name_plural = "Restoranlar"
        ordering = ['name']
    
    def __str__(self):
        return self.name
