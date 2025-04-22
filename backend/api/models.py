from django.db import models
from django.contrib.auth.models import AbstractUser

from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

class CustomUser(AbstractUser):
    email = models.EmailField(max_length=100, unique=True)
    age = models.IntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    profile_picture = models.BinaryField(null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    

@receiver(reset_password_token_created)
def passwords_reset_token_created(reset_password_token, *args, **kwargs):
    try:
        sitelink = "http://localhost:5173/"
        token = f"{reset_password_token.key}"  # No ?AuthToken= here
        full_link = f"{sitelink}password-reset?AuthToken={token}"
        
        context = {
            'email_address': reset_password_token.user.email,
            'full_link': full_link
        }
        # Render both HTML and plain text versions
        html_message = render_to_string('backend/email.html', context)
        plain_message = strip_tags(html_message)
        
        msg = EmailMultiAlternatives(
            subject="Password Reset for FitLife",
            body=plain_message,
            from_email="noreply@fitlife.com",
            to=[reset_password_token.user.email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()
        
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        # Consider logging this error properly
        
# for challenges
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
    
    title        = models.CharField(max_length=200)
    description  = models.TextField()
    duration     = models.CharField(max_length=50)  # e.g. “30 days”
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
