from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_name_ru = serializers.CharField(source='product.name_ru', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_name_ru', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    restaurant_phone = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'status', 'total_amount', 'delivery_address', 
                  'latitude', 'longitude', 'phone_number', 'notes', 'created_at', 'items', 'restaurant_phone']
        read_only_fields = ['id', 'created_at']

    def get_restaurant_phone(self, obj):
        if obj.restaurant:
            return obj.restaurant.phone
        return None
