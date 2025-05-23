# Generated by Django 5.2 on 2025-05-09 03:48

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_fitnessplanuser'),
    ]

    operations = [
        migrations.CreateModel(
            name='MealPlanUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('meal_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users', to='api.mealplan')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meal_plan_users', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Meal Plan User',
                'verbose_name_plural': 'Meal Plan Users',
                'unique_together': {('user', 'meal_plan')},
            },
        ),
    ]
