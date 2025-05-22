from django.db import models
from django.core.validators import MinValueValidator
from ..models.user import CustomUser
from ..models.exercise import Exercise
from django.contrib.auth import get_user_model
# ... keep your FitnessPlan, FitnessPlanUser, FitnessPlanExercise models ...

User = get_user_model()

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