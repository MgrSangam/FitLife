# Generated by Django 5.2 on 2025-04-22 12:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Challenge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('duration', models.CharField(max_length=50)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('difficulty', models.CharField(choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advance', 'Advance')], max_length=12)),
                ('muscle_group', models.CharField(choices=[('chest', 'Chest'), ('core', 'Core'), ('full-body', 'Full Body')], max_length=12)),
                ('workout_type', models.CharField(choices=[('strength', 'Strength'), ('cardio', 'Cardio')], max_length=12)),
                ('image', models.ImageField(blank=True, help_text='Upload a header image for this challenge', null=True, upload_to='challenge_images/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
