from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from knox.auth import TokenAuthentication
from django.utils import timezone
from datetime import timedelta
from random import choice
from django.contrib.auth import get_user_model
from ..models import SubscriptionPlan
from ..serializers import SubscriptionSerializer

User = get_user_model()

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        plan = self.request.data.get('plan')

        if not plan:
            raise ValidationError("Plan is required.")

        trainer = None
        nutritionist = None
        
        if plan == 'premium':
            trainers = User.objects.filter(
                is_instructor=True, 
                specialization='trainer'
            )
            nutritionists = User.objects.filter(
                is_instructor=True, 
                specialization='nutritionist'
            )

            if trainers.exists():
                trainer = choice(trainers)
            if nutritionists.exists():
                nutritionist = choice(nutritionists)

        try:
            subscription = SubscriptionPlan.objects.get(user=user)
            subscription.plan = plan
            subscription.is_active = True
            subscription.start_date = timezone.now()
            subscription.end_date = timezone.now() + timedelta(days=30)
            
            if plan == 'premium':
                subscription.trainer = trainer
                subscription.nutritionist = nutritionist
            else:
                subscription.trainer = None
                subscription.nutritionist = None

            subscription.save()

        except SubscriptionPlan.DoesNotExist:
            subscription = serializer.save(
                user=user, 
                is_active=True
            )

            if plan == 'premium':
                subscription.trainer = trainer
                subscription.nutritionist = nutritionist
                subscription.save()

        return subscription