from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restaurants', '0007_restaurantpushtoken'),
    ]

    operations = [
        migrations.AddField(
            model_name='restaurant',
            name='telegram_notifications',
            field=models.BooleanField(
                default=True,
                help_text="O'chirilsa, yangi buyurtmalar Telegram guruhiga yuborilmaydi (faqat ilovaga). Test restoran uchun o'chiring.",
                verbose_name='Telegram guruhiga xabar yuborilsinmi',
            ),
        ),
    ]
