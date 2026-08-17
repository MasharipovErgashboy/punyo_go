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

    class Media:
        js = ('products/admin_translate.js',)
