from rest_framework import serializers
from .models import Restaurant

class RestaurantSerializer(serializers.ModelSerializer):
    working_hours = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'image', 'image_base64', 'location', 'phone', 'delivery_price', 'is_active', 'working_hours']

    def get_working_hours(self, obj):
        if hasattr(obj, 'working_hours'):
            return {
                'start_time': obj.working_hours.start_time.strftime('%H:%M'),
                'end_time': obj.working_hours.end_time.strftime('%H:%M')
            }
        return None
