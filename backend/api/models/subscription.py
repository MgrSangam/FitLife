from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class SubscriptionPlan(models.Model):
    PLAN_CHOICES = (
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