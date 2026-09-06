from django.urls import path
from . import views

urlpatterns = [
    path('active/', views.get_active_orders, name='active-orders'),
    path('confirmed/', views.get_confirmed_orders, name='confirmed-orders'),
    path('all/', views.get_all_orders, name='all-orders'),
    path('canceled/', views.get_canceled_orders, name='canceled-orders'),
    path('<int:order_id>/status/', views.update_order_status, name='update-order-status'),
    path('create/', views.create_order, name='create-order'),
    path('validate-promo/', views.validate_promo, name='validate-promo'),
    path('test-notification/', views.test_notification, name='test-notification'),
]
