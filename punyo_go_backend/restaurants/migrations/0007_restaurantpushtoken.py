from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('restaurants', '0006_restaurant_image_base64'),
    ]

    operations = [
        migrations.CreateModel(
            name='RestaurantPushToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=255, unique=True, verbose_name='Expo push token')),
                ('device_name', models.CharField(blank=True, default='', max_length=120, verbose_name='Qurilma nomi')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='push_tokens', to='restaurants.restaurant', verbose_name='Restoran')),
            ],
            options={
                'verbose_name': 'Push token (qurilma)',
                'verbose_name_plural': 'Push tokenlar (qurilmalar)',
            },
        ),
    ]
