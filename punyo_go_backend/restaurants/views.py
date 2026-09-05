from rest_framework import viewsets
from .models import Restaurant
from .serializers import RestaurantSerializer
from users.models import UserProfile

class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows active restaurants to be viewed.
    Filtered by the user's district.
    """
    serializer_class = RestaurantSerializer

    def get_queryset(self):
        queryset = Restaurant.objects.filter(is_active=True).order_by('-created_at')
        
        telegram_user_id = self.request.query_params.get('telegram_user_id')
        if telegram_user_id:
            user = UserProfile.objects.filter(telegram_user_id=telegram_user_id).first()
            if user and user.district:
                queryset = queryset.filter(location=user.district)
                
        return queryset
