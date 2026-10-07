import base64
from io import BytesIO
from PIL import Image
from django.db import models
from django.utils import timezone
from users.models import UserProfile

class Notification(models.Model):
    """System notification model"""
    title = models.CharField(max_length=200, help_text="Deprecated: use title_uz/ru")
    description = models.TextField(help_text="Deprecated: use description_uz/ru")
    
    title_uz = models.CharField(max_length=200, verbose_name="Sarlavha (UZ)", null=True, blank=True)
    title_ru = models.CharField(max_length=200, verbose_name="Заголовок (RU)", null=True, blank=True)
    
    description_uz = models.TextField(verbose_name="Tavsif (UZ)", null=True, blank=True)
    description_ru = models.TextField(verbose_name="Описание (RU)", null=True, blank=True)
    
    is_broadcast = models.BooleanField(default=False, help_text="If checked, all users will see this notification")
    recipients = models.ManyToManyField(UserProfile, blank=True, related_name='notifications', help_text="Select specific users if not a broadcast")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_notification'
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

    def __str__(self):
        return self.title_uz or self.title or "Untitled Notification"


class NotificationRead(models.Model):
    """Tracks which users have read which notifications"""
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_notificationread'
        unique_together = ('user', 'notification')


class About(models.Model):
    """Shop information model"""
    phone_number = models.CharField(max_length=20, help_text="Store contact phone number")
    email = models.EmailField(help_text="Store contact email")
    
    address = models.TextField(help_text="Deprecated: use address_uz/ru", null=True, blank=True)
    address_uz = models.TextField(verbose_name="Manzil (UZ)", null=True, blank=True)
    address_ru = models.TextField(verbose_name="Адрес (RU)", null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users_about'
        verbose_name = "About Us"
        verbose_name_plural = "About Us"

    def __str__(self):
        return "Shop Information"


from django.core.exceptions import ValidationError

class Advertisement(models.Model):
    """Swiper advertisements for Mini App"""
    image = models.ImageField(upload_to='advertisements/', blank=True, null=True, help_text="Upload the banner image here (16:9 or similar ratio)")
    video = models.FileField(upload_to='advertisements/videos/', blank=True, null=True, help_text="Upload a video banner (mp4, webm). You must provide EITHER an image OR a video.")
    image_base64 = models.TextField(blank=True, null=True, verbose_name="Rasm (Base64)")
    is_active = models.BooleanField(default=True, help_text="Uncheck to hide this banner")
    order = models.IntegerField(default=0, help_text="Order in the slider (lower comes first)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'about_us_advertisement'
        verbose_name = "Reklama (swiper)"
        verbose_name_plural = "Reklamalar (swiper)"
        ordering = ['order', '-created_at']

    def save(self, *args, **kwargs):
        if self.image:
            try:
                img = Image.open(self.image)
                img.thumbnail((1000, 1000))
                buffer = BytesIO()
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(buffer, format="JPEG", quality=65)
                img_str = base64.b64encode(buffer.getvalue()).decode()
                self.image_base64 = f"data:image/jpeg;base64,{img_str}"
            except Exception as e:
                print(f"Error processing ad image: {e}")
        else:
            self.image_base64 = None
        super().save(*args, **kwargs)

    def clean(self):
        if self.image and self.video:
            raise ValidationError("Siz faqat rasm yoki faqat video yuklashingiz kerak, ikkalasini birdaniga emas.")
        if not self.image and not self.video:
            raise ValidationError("Iltimos, rasm yoki video yuklang.")

    def __str__(self):
        return f"Banner #{self.id} (Order: {self.order})"
