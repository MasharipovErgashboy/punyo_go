from django.contrib import admin
from django.utils.html import format_html
from .models import Restaurant

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin_user', 'image_preview', 'location', 'phone', 'is_active', 'id')
    list_filter = ('is_active',)
    search_fields = ('name', 'location', 'phone', 'id')
    readonly_fields = ('id', 'image_preview_large', 'created_at')
    
    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('id', 'name', 'is_active')
        }),
        ('Boshqaruv (Multi-vendor)', {
            'fields': ('admin_user', 'telegram_chat_id'),
            'description': 'Ushbu restoran uchun javobgar foydalanuvchini (Admin) tanlang. U faqat shu restoranni ko\'ra oladi.'
        }),
        ('Rasm', {
            'fields': ('image', 'image_preview_large')
        }),
        ('Aloqa va Manzil', {
            'fields': ('location', 'phone')
        }),
        ('Moliyaviy', {
            'fields': ('delivery_price',)
        }),
        ('Tizim', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(admin_user=request.user)

    def has_change_permission(self, request, obj=None):
        if not request.user.is_superuser and obj and obj.admin_user != request.user:
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_superuser:
            return False
        return True

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height: 40px; border-radius: 5px;"/>', obj.image.url)
        return "Rasm yo'q"
    image_preview.short_description = 'Rasm'

    def image_preview_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 200px; border-radius: 10px;"/>', obj.image.url)
        return "Rasm yuklanmagan"
    image_preview_large.short_description = 'Joriy rasm'

    def delivery_price_formatted(self, obj):
        return f"{int(obj.delivery_price):,} so'm".replace(',', ' ')
    delivery_price_formatted.short_description = 'Yetkazib berish'
