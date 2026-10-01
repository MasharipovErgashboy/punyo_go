from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_name_ru = serializers.CharField(source='product.name_ru', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_name_ru', 'quantity', 'price']



    def get_restaurant_phone(self, obj):
        if obj.restaurant:
            return obj.restaurant.phone
        return None
