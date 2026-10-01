from rest_framework import serializers
from .models import Category, Product, ProductAddon


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'name_ru', 'image', 'image_base64', 'order', 'products_count']
    
    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductAddonSerializer(serializers.ModelSerializer):
    """Product addon serializer"""
    class Meta:
        model = ProductAddon
        fields = ['id', 'name', 'price']


class ProductSerializer(serializers.ModelSerializer):
    """Product serializer"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_name_ru = serializers.CharField(source='category.name_ru', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True, allow_null=True)
    restaurant_phone = serializers.CharField(source='restaurant.phone', read_only=True, allow_null=True)
    delivery_price = serializers.DecimalField(source='restaurant.delivery_price', max_digits=10, decimal_places=2, read_only=True, allow_null=True)
    addons = serializers.SerializerMethodField()
    working_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'restaurant', 'restaurant_name', 'restaurant_phone', 'delivery_price',
            'category', 'category_name', 'category_name_ru', 
            'name', 'name_ru', 'image', 'image_base64', 'price', 
            'description', 'description_ru', 'order', 'addons', 'working_hours'
        ]
        
    def get_addons(self, obj):
        addons = obj.addons.filter(is_active=True)
        return ProductAddonSerializer(addons, many=True).data

    def get_working_hours(self, obj):
        if obj.restaurant and hasattr(obj.restaurant, 'working_hours'):
            return {
                'start_time': obj.restaurant.working_hours.start_time.strftime('%H:%M'),
                'end_time': obj.restaurant.working_hours.end_time.strftime('%H:%M')
            }
        return None
