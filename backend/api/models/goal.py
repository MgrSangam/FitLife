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