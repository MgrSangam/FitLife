from rest_framework import serializers
from ..models import MealPlan, MealFood, MealPlanUser
from django.contrib.auth import get_user_model
from .food import FoodSerializer
from .food import Food

User = get_user_model()

class MealFoodSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)
    food_id = serializers.PrimaryKeyRelatedField(
        queryset=Food.objects.all(),
        source='food',
        write_only=True
    )
    total_calories = serializers.SerializerMethodField()
    total_carbs = serializers.SerializerMethodField()
    total_protein = serializers.SerializerMethodField()
    total_fat = serializers.SerializerMethodField()
    
    class Meta:
        model = MealFood
        fields = [
            'id',
            'food',
            'food_id',
            'meal_time',
            'quantity_grams',
            'day',
            'order',
            'total_calories',
            'total_carbs',
            'total_protein',
            'total_fat'
        ]
    
    def get_total_calories(self, obj):
        return round(obj.total_calories, 2)
    
    def get_total_carbs(self, obj):
        return round(obj.total_carbs, 2)
    
    def get_total_protein(self, obj):
        return round(obj.total_protein, 2)
    
    def get_total_fat(self, obj):
        return round(obj.total_fat, 2)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['meal_time'] = dict(MealFood.MEAL_TIME_CHOICES).get(instance.meal_time)
        return representation

class MealPlanSerializer(serializers.ModelSerializer):
    meal_foods = MealFoodSerializer(many=True, read_only=True)
    plan_type_display = serializers.CharField(source='get_plan_type_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MealPlan
        fields = [
            'id',
            'name',
            'description',
            'plan_type',
            'plan_type_display',
            'daily_calorie_target',
            'duration_weeks',
            'image',
            'image_url',
            'created_at',
            'updated_at',
            'meal_foods'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class MealPlanUserSerializer(serializers.ModelSerializer):
    meal_plan = serializers.PrimaryKeyRelatedField(queryset=MealPlan.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), default=serializers.CurrentUserDefault())

    class Meta:
        model = MealPlanUser
        fields = ['id', 'user', 'meal_plan', 'joined_at']
        read_only_fields = ['joined_at']

    def validate(self, data):
        if MealPlanUser.objects.filter(
            user=data['user'],
            meal_plan=data['meal_plan']
        ).exists():
            raise serializers.ValidationError("You have already joined this meal plan.")
        return data