# Generated by Django 5.2 on 2025-04-23 08:34

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_challenge'),
    ]

    operations = [
        migrations.CreateModel(
            name='EducationalContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('content_type', models.CharField(choices=[('video', 'Video'), ('blog', 'Blog')], max_length=10)),
                ('category', models.CharField(choices=[('workouts', 'Workouts'), ('nutrition', 'Nutrition')], default='workouts', max_length=20)),
                ('upload_date', models.DateTimeField(auto_now_add=True)),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='content_thumbnails/')),
                ('video_url', models.URLField(blank=True, null=True)),
                ('blog_content', models.TextField(blank=True, null=True)),
                ('views', models.IntegerField(default=0)),
                ('rating', models.FloatField(default=0.0)),
            ],
            options={
                'verbose_name_plural': 'Educational Content',
                'ordering': ['-upload_date'],
            },
        ),
        migrations.CreateModel(
            name='ChallengeParticipant',
            fields=[
                ('participate_id', models.AutoField(primary_key=True, serialize=False)),
                ('date_joined', models.DateField(auto_now_add=True)),
                ('challenge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.challenge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'challenge')},
            },
        ),
    ]
