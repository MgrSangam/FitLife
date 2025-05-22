from django.db import models
from django.core.validators import MinValueValidator
from ..models.user import CustomUser
from ..models.food import Food
from django.contrib.auth import get_user_model
# ... keep your MealPlan, MealPlanUser, MealFood models ...


from django.db import models
from django.core.validators import MinValueValidator

from django.db import models
from django.core.validators import MinValueValidator


User = get_user_model()

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


from django.db import models
from django.contrib.auth import get_user_model



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