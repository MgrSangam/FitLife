from rest_framework import serializers
from ..models import SubscriptionPlan

class SubscriptionSerializer(serializers.ModelSerializer):
    plan = serializers.CharField(write_only=True)

    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'user', 'plan', 'is_active', 'start_date', 
            'end_date', 'trainer', 'nutritionist'
        ]
        read_only_fields = [
            'is_active', 'start_date', 'end_date', 
            'trainer', 'nutritionist', 'user'
        ]