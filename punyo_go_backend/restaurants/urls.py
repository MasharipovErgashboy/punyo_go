from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantViewSet
from . import partner_views

router = DefaultRouter()
router.register(r'', RestaurantViewSet, basename='restaurant')

urlpatterns = [
    # Restaurant partner app (restoran ilovasi) — must come before the router
    path('partner/login/', partner_views.partner_login, name='partner-login'),
    path('partner/orders/', partner_views.partner_orders, name='partner-orders'),
    path('partner/orders/<int:order_id>/accept/', partner_views.partner_accept, name='partner-accept'),
    path('partner/orders/<int:order_id>/reject/', partner_views.partner_reject, name='partner-reject'),
    path('partner/orders/<int:order_id>/complete/', partner_views.partner_complete, name='partner-complete'),
    path('partner/push-token/', partner_views.register_push_token, name='partner-push-token'),

    path('', include(router.urls)),
]
