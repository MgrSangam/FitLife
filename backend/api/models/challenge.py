from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, AbstractBaseUser, PermissionsMixin, UserManager
from django.core.exceptions import ValidationError
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.utils import timezone
from django.contrib.auth.models import Group, Permission

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from ..models.user import CustomUser



class Challenge(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advance', 'Advance'),
    ]
    
    MUSCLE_GROUP_CHOICES = [
        ('chest', 'Chest'),
        ('core', 'Core'),
        ('full-body', 'Full Body'),
    ]
    
    WORKOUT_TYPE_CHOICES = [
        ('strength', 'Strength'),
        ('cardio', 'Cardio'),
    ]
    
    # DURATION = [
    #     ('monthly', '30 days'),
    #     ('weekly', '7days')
    # ]
    
    title        = models.CharField(max_length=200)
    description  = models.TextField()
    duration     = models.CharField(max_length=50)  
    start_date   = models.DateField()
    end_date     = models.DateField()
    difficulty   = models.CharField(max_length=12, choices=DIFFICULTY_CHOICES)
    muscle_group = models.CharField(max_length=12, choices=MUSCLE_GROUP_CHOICES)
    workout_type = models.CharField(max_length=12, choices=WORKOUT_TYPE_CHOICES)
    image        = models.ImageField(
                      upload_to='challenge_images/',
                      null=True,
                      blank=True,
                      help_text="Upload a header image for this challenge"
                   )
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# models.py (No changes needed here for the model itself, except removing progress-related fields)

class ChallengeParticipant(models.Model):
    participate_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    date_joined = models.DateField(auto_now_add=True)
    progress = models.JSONField(default=list, blank=True)  # Stores ticked days, e.g., [1, 3, 5]

    class Meta:
        unique_together = ('user', 'challenge')  # Ensures a user can only join a challenge once

    def __str__(self):
        return f"{self.user.username} - {self.challenge.title}"



