from rest_framework import viewsets
from .models import Restaurant
from .serializers import RestaurantSerializer

class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows active restaurants to be viewed.
    """
    queryset = Restaurant.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = RestaurantSerializer
