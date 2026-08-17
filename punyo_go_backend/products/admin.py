# Admin panel synchronization marker: 2026-03-01 20:40
from django.contrib import admin
from .models import Category, Product, ProductAddon

class ProductAddonInline(admin.TabularInline):
    model = ProductAddon
    extra = 1
    fields = ('name', 'price', 'is_active')

class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    fields = ('id', 'name', 'price', 'order', 'is_active')
    readonly_fields = ('id',)
    show_change_link = True

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'name_ru', 'order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'name_ru')
    ordering = ('order', 'name')
    inlines = [ProductInline]
    
    fieldsets = (
        ('General', {
            'fields': ('name', 'name_ru', 'image', 'image_base64')
        }),
        ('Settings', {
            'fields': ('order', 'is_active')
        }),
    )
    readonly_fields = ('image_base64',)

    def has_add_permission(self, request):
        if not request.user.is_superuser:
            return False
        return super().has_add_permission(request)

    def has_change_permission(self, request, obj=None):
        if not request.user.is_superuser:
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_superuser:
            return False
        return super().has_delete_permission(request, obj)

    class Media:
        js = ('products/admin_translate.js',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'restaurant', 'category', 'price', 'order', 'is_active')
    list_filter = ('restaurant', 'category', 'is_active')
    search_fields = ('name', 'name_ru', 'restaurant__name')
    list_select_related = ('category', 'restaurant')
    ordering = ('restaurant', 'category', 'order', 'name')
    inlines = [ProductAddonInline]
    
    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('restaurant', 'category', 'name', 'name_ru')
        }),
        ('Rasm', {
            'fields': ('image', 'image_base64')
        }),
        ('Narx va Tartib', {
            'fields': ('price', 'order', 'is_active')
        }),
        ('Tavsif', {
            'fields': ('description', 'description_ru')
        }),
    )
    readonly_fields = ('image_base64',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(restaurant__admin_user=request.user)

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if not request.user.is_superuser:
            # Create a new fieldsets tuple without 'restaurant'
            new_fieldsets = []
            for name, opts in fieldsets:
                if 'fields' in opts:
                    fields = list(opts['fields'])
                    if 'restaurant' in fields:
                        fields.remove('restaurant')
                    opts['fields'] = tuple(fields)
                new_fieldsets.append((name, opts))
            return tuple(new_fieldsets)
        return fieldsets

    def save_model(self, request, obj, form, change):
        if not request.user.is_superuser and not obj.restaurant_id:
            rest = request.user.managed_restaurants.first()
            if rest:
                obj.restaurant = rest
        super().save_model(request, obj, form, change)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "restaurant" and not request.user.is_superuser:
            from restaurants.models import Restaurant
            kwargs["queryset"] = Restaurant.objects.filter(admin_user=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    class Media:
        js = ('products/admin_translate.js',)
