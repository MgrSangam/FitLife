from rest_framework import serializers
from django.contrib.auth import get_user_model
from .fitness_plan import FitnessPlanUser
from .meal_plan import MealPlanUser
from .challenge import Challenge
from .content import EducationalContent

User = get_user_model()

class DashboardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    active_plans = serializers.IntegerField()
    ongoing_challenges = serializers.IntegerField()
    recent_content = serializers.IntegerField()
    recent_activities = serializers.ListField(child=serializers.DictField())