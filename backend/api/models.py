from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Keep your existing fields exactly as they are
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

# models.py (No changes needed here for the model itself, except removing progress-related fields)

class ChallengeParticipant(models.Model):
    participate_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    date_joined = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'challenge')  # Ensures a user can only join a challenge once

    def __str__(self):
        return f"{self.user.username} - {self.challenge.title}"



# Add to your existing models.py

# Add to your models.py

class EducationalContent(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('video', 'Video'),
        ('blog', 'Blog'),
    ]
    CATEGORY_CHOICES = [
        ('workouts', 'Workouts'),
        ('nutrition', 'Nutrition'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='workouts')
    upload_date = models.DateTimeField(auto_now_add=True)

    thumbnail = models.ImageField(upload_to='content_thumbnails/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    blog_content = models.TextField(blank=True, null=True)

    views = models.IntegerField(default=0)
    rating = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.get_content_type_display()}: {self.title}"

    class Meta:
        ordering = ['-upload_date']
        verbose_name_plural = "Educational Content"
        



# goals/models.py

from django.conf import settings
from django.db import models

class Goal(models.Model):
    GOAL_TYPES = [
        ("lose", "Losing Weight"),
        ("gain", "Gaining Muscle"),
        ("maintain", "Maintaining Weight"),
    ]
    
    ACTIVITY_LEVELS = [
        ("sedentary", "Sedentary (little to no exercise)"),
        ("light", "Light (exercise 1-3 times/week)"),
        ("moderate", "Moderate (exercise 3-5 times/week)"),
        ("active", "Active (exercise 6-7 times/week)"),
        ("very_active", "Very Active (exercise 2x/day)"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='goal'
    )
    goal_type = models.CharField(
        max_length=10, 
        choices=GOAL_TYPES
    )
    start_date = models.DateField()
    target_date = models.DateField()
    target_weight = models.FloatField()
    activity_level = models.CharField(
        max_length=20,
        default='moderate',
        choices=ACTIVITY_LEVELS
        
    )
    
    def __str__(self):
        return f"{self.user.email} - {self.get_goal_type_display()}"
    
    class Meta:
        verbose_name = "User Goal"
        verbose_name_plural = "User Goals"

    @property
    def current_weight(self):
        """Get current weight from user profile"""
        return self.user.weight

    @property
    def height(self):
        """Get height from user profile"""
        return self.user.height

    @property
    def age(self):
        """Get age directly from user profile"""
        return self.user.age
   


class Exercise(models.Model):
    MUSCLE_GROUP = [
        ('fullbody', 'Full Body Exercise'),
        ('chest', 'Chest Exercise'),
        ('back', 'Back Exercise'),
        ('legs', 'Leg Exercise'),
        ('shoulders', 'Deltoids Exercise'),
        ('arms', 'Arm Exercise'),  
        ('core', 'Core Exercise'), 
    ]
    
    DIFFICULTY_LEVEL = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advance', 'Advance'),
    ]
    
    EQUIPMENT_REQUIRED = [
        ('none', 'No Equppment Needed'),
        ('dumbells', 'Dumbells'),
        ('pull_up', 'Pull Up Bar'),
        ('others', 'Others'),
    ]
    name = models.CharField(max_length=40, unique=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    image = models.ImageField(upload_to='exercise_thumbnails/', blank=True, null=True)
    calories_burned = models.FloatField(help_text="Estimated calories burned per minute",null=True,blank=True)
    
    muscle_group= models.CharField(
        max_length=20,
        default='fullbody',
        choices= MUSCLE_GROUP
        
    )
    
    difficulty= models.CharField(
        max_length=20,
        default='intermediate',
        choices= DIFFICULTY_LEVEL
        
    )
    
    equipment= models.CharField(
        max_length=20,
        default='none',
        choices= EQUIPMENT_REQUIRED
        
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Food(models.Model):
    FOOD_TYPE_CHOICES = [
    ('fruit', 'Fruit'),
    ('vegetable', 'Vegetable'),
    ('grain', 'Grain / Cereal'),
    ('protein', 'Protein (Meat, Fish, Eggs)'),
    ('dairy', 'Dairy'),
    ('fat', 'Fats & Oils'),
    ('snack', 'Snacks'),
    ('beverage', 'Beverages'),
    ('other', 'Other'),
]

    name = models.CharField(max_length=40, unique=True)
    image = models.ImageField(upload_to='exercise_thumbnails/', blank=True, null=True)
    description = models.TextField(max_length=500, null= True, blank= True)
    carbs = models.FloatField(help_text="Grams of carbs per 100g ",null=True,blank=True)
    protein = models.FloatField(help_text="Grams of carbs per 100g")
    fat = models.FloatField(help_text="Grams of carbs per 100g")
    
    food_type = models.CharField(
    max_length=20,
    choices=FOOD_TYPE_CHOICES,
    default='other',
    help_text="Category of the food"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def calories(self):
        carbs = self.carbs or 0
        protein = self.protein or 0
        fat = self.fat or 0
        return (carbs * 4) + (protein * 4) + (fat * 9)
    
    def __str__(self):
        return self.name