from django.contrib import admin
from django.utils.html import format_html
from .models import Restaurant, RestaurantWorkingHour

@admin.register(RestaurantWorkingHour)
class RestaurantWorkingHourAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'start_time', 'end_time')
    search_fields = ('restaurant__name',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(restaurant__admin_user=request.user)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "restaurant" and not request.user.is_superuser:
            kwargs["queryset"] = Restaurant.objects.filter(admin_user=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def has_module_permission(self, request):
        return True

    def has_view_permission(self, request, obj=None):
        return True

    def has_add_permission(self, request):
        return True

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj and obj.restaurant.admin_user != request.user:
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj and obj.restaurant.admin_user != request.user:
            return False
        return True

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
            'fields': ('location', 'location_url', 'phone')
        }),
        ('Yetkazib berish', {
            'fields': ('delivery_price', 'telegram_delivery_chat_id')
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
