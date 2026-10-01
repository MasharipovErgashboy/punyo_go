from django.db import models
from products.models import Product
from users.models import UserProfile



    """Promo code model for discounts"""
    code = models.CharField(max_length=50, unique=True, verbose_name="Promokod")

    times_used = models.PositiveIntegerField(default=0, verbose_name="Ishlatilgan soni")
    is_active = models.BooleanField(default=True, verbose_name="Faol")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Promo Code"
        verbose_name_plural = "Promo Codes"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.discount_percent}%"



    """Order model for user purchases"""
    STATUS_CHOICES = [
        ('pending', 'Kutilmoqda'),
        ('active', 'Faol'),
        ('ready', 'Yetkazishga tayyor'),
        ('delivering', 'Yetkazib berilmoqda'),
        ('completed', 'Yakunlandi'),
        ('canceled', 'Bekor qilindi'),
    ]
    
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name="Restoran"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ishlatilgan Promokod")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Chegirma summasi")
    delivery_address = models.TextField(blank=True, default='')
  k=True)
    phone_number = models.CharField(max_length=20, default='')
    notes = models.TextField(blank=True, default='')
    
    # Delayed order processing
    send_at = models.DateTimeField(null=True, blank=True, verbose_name="Kechiktirilgan yuborish vaqti")
    is_telegram_sent = models.BooleanField(default=True, verbose_name="Telegramga yuborildi")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ['-created_at']
    
    def __str__(self):
        user_name = "Unknown"
        if self.user:
            user_name = f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        return f"Order #{self.id or 'New'} - {user_name} ({self.status})"


class OrderItem(models.Model):
    """Order item model for products in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Snapshot of product price
    
    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
    
    def __str__(self):
        return f"{self.product.name if self.product else 'Item'} x{self.quantity}"
    
    def get_total(self):
        return self.price * self.quantity
