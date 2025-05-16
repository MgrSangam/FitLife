from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, AbstractBaseUser, PermissionsMixin, UserManager
from django.core.exceptions import ValidationError
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.utils import timezone
from django.contrib.auth.models import Group, Permission

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    email = models.EmailField(max_length=100, unique=True)
    age = models.IntegerField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    profile_picture = models.BinaryField(null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)

    # Instructor-specific fields
    is_instructor = models.BooleanField(default=False)
    contact = models.CharField(max_length=10, unique=True, null=True, blank=True)
    experience = models.CharField(max_length=50, null=True, blank=True)
    bio = models.CharField(max_length=500, null=True, blank=True)
    
    SPECIALIZATION_CHOICES = [
        ('trainer', 'Trainer'),
        ('nutritionist', 'Nutritionist'),
    ]
    specialization = models.CharField(max_length=30, choices=SPECIALIZATION_CHOICES, null=True, blank=True)

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
    
    
    
    
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class SubscriptionPlan(models.Model):
    PLAN_CHOICES = (
        ('basic', 'Basic'),
        ('premium', 'Premium'),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='subscription'
    )
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES)
    is_active = models.BooleanField(default=False)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'is_instructor': True, 'specialization': 'trainer'},
        related_name='trainer_subscriptions'
    )
    nutritionist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'is_instructor': True, 'specialization': 'nutritionist'},
        related_name='nutritionist_subscriptions'
    )

    class Meta:
        verbose_name = "Subscription Plan"
        verbose_name_plural = "Subscription Plans"

    def save(self, *args, **kwargs):
        if not self.start_date:
            self.start_date = timezone.now()
        if not self.end_date and self.start_date:
            self.end_date = self.start_date + timedelta(days=30)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.plan}"

    def get_assigned_clients(self):
        """Get all clients assigned to this instructor through subscriptions"""
        if self.trainer:
            return User.objects.filter(subscription__trainer=self.trainer)
        elif self.nutritionist:
            return User.objects.filter(subscription__nutritionist=self.nutritionist)
        return User.objects.none()

    @property
    def is_expired(self):
        """Check if the subscription has expired"""
        return timezone.now() > self.end_date if self.end_date else False

    def renew(self):
        """Renew the subscription for another period"""
        if self.is_expired or not self.is_active:
            self.start_date = timezone.now()
            self.end_date = self.start_date + timedelta(days=30)
            self.is_active = True
            self.save()
            return True
        return False

    def assign_instructors(self):
        """Automatically assign instructors for premium plans"""
        if self.plan == 'premium' and not (self.trainer and self.nutritionist):
            trainers = User.objects.filter(
                is_instructor=True, 
                specialization='trainer'
            )
            nutritionists = User.objects.filter(
                is_instructor=True, 
                specialization='nutritionist'
            )
            
            if trainers.exists():
                self.trainer = trainers.order_by('?').first()
            
            if nutritionists.exists():
                self.nutritionist = nutritionists.order_by('?').first()
            
            self.save()
    


from django.db import models
from django.core.validators import MinValueValidator
from django.core.validators import MinValueValidator
from django.db import models

class FitnessPlan(models.Model):
    PLAN_TYPE = [
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('endurance', 'Endurance Training'),
        ('maintain', 'Maintain Weight'),
    ]

    DIFFICULTY_LEVELS = [
        ("sedentary", "Very Easy (Sedentary: little to no exercise)"),
        ("light", "Easy (Light: 1-3 times/week)"),
        ("moderate", "Normal (Moderate: 3-5 times/week)"),
        ("active", "Hard (Active: 6-7 times/week)"),
        ("very_active", "Very Hard (Very Active: 2x/day)"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500, null=True, blank=True)
    plan_type = models.CharField(
        max_length=20,
        choices=PLAN_TYPE,
        default='weight_loss'
    )
    duration_weeks = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in weeks"
    )
    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_LEVELS,
        default='moderate'
    )
    picture = models.ImageField(
        upload_to='fitness_plans/',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


from django.db import models
from django.contrib.auth import get_user_model
from .models import FitnessPlan

User = get_user_model()

class FitnessPlanUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fitness_plan_users')
    fitness_plan = models.ForeignKey(FitnessPlan, on_delete=models.CASCADE, related_name='users')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'fitness_plan')  # Prevent duplicate joins
        verbose_name = 'Fitness Plan User'
        verbose_name_plural = 'Fitness Plan Users'

    def __str__(self):
        return f"{self.user.username} - {self.fitness_plan.name}"

class FitnessPlanExercise(models.Model):
    DAYS_OF_WEEK = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    fitness_plan = models.ForeignKey(
        FitnessPlan, 
        on_delete=models.CASCADE,
        related_name='exercises'
    )
    exercise = models.ForeignKey(
        Exercise, 
        on_delete=models.CASCADE
    )
    day = models.CharField(
        max_length=10,
        choices=DAYS_OF_WEEK
    )
    sets = models.PositiveIntegerField(
        default=3
    )
    reps = models.PositiveIntegerField(
        default=10
    )
    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Duration in minutes (for cardio exercises)"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of exercise in the workout"
    )
    
    class Meta:
        ordering = ['day', 'order']
        unique_together = ['fitness_plan', 'exercise', 'day']
    
    def __str__(self):
        return f"{self.fitness_plan.name} - {self.day} - {self.exercise.name}"
    
    
    
    
from django.db import models
from django.core.validators import MinValueValidator

from django.db import models
from django.core.validators import MinValueValidator

class MealPlan(models.Model):
    MEAL_PLAN_TYPE = [
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('maintenance', 'Weight Maintenance'),
        ('diabetic', 'Diabetic Diet'),
        ('keto', 'Keto Diet'),
        ('vegetarian', 'Vegetarian'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500, null=True, blank=True)
    plan_type = models.CharField(
        max_length=20,
        choices=MEAL_PLAN_TYPE,
        default='maintenance'
    )
    daily_calorie_target = models.PositiveIntegerField(
        help_text="Target calories per day"
    )
    duration_weeks = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in weeks"
    )
    image = models.ImageField(
        upload_to='meal_plans/',
        null=True,
        blank=True,
        help_text="Image representing the meal plan"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class MealPlanUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_plan_users')
    meal_plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name='users')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'meal_plan')
        verbose_name = 'Meal Plan User'
        verbose_name_plural = 'Meal Plan Users'

    def __str__(self):
        return f"{self.user.username} - {self.meal_plan.name}"

class MealFood(models.Model):
    MEAL_TIME_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('morning_snack', 'Morning Snack'),
        ('lunch', 'Lunch'),
        ('afternoon_snack', 'Afternoon Snack'),
        ('dinner', 'Dinner'),
        ('evening_snack', 'Evening Snack'),
    ]
    
    meal_plan = models.ForeignKey(
        MealPlan, 
        on_delete=models.CASCADE,
        related_name='meal_foods'
    )
    food = models.ForeignKey(
        Food, 
        on_delete=models.CASCADE
    )
    meal_time = models.CharField(
        max_length=20,
        choices=MEAL_TIME_CHOICES
    )
    quantity_grams = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Quantity in grams"
    )
    day = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Day number in the plan (1-7 for weekly plans)"
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text="Order of food in the meal"
    )
    
    class Meta:
        ordering = ['day', 'meal_time', 'order']
        unique_together = ['meal_plan', 'food', 'day', 'meal_time']
    
    @property
    def total_calories(self):
        return (self.food.calories / 100) * self.quantity_grams
    
    @property
    def total_carbs(self):
        return (self.food.carbs / 100) * self.quantity_grams if self.food.carbs else 0
    
    @property
    def total_protein(self):
        return (self.food.protein / 100) * self.quantity_grams if self.food.protein else 0
    
    @property
    def total_fat(self):
        return (self.food.fat / 100) * self.quantity_grams if self.food.fat else 0
    
    def __str__(self):
        return f"{self.meal_plan.name} - Day {self.day} - {self.get_meal_time_display()} - {self.food.name}"
    
    
    
# models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']