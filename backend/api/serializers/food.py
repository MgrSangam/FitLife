from rest_framework import serializers
from ..models import Food

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields= [
            'id',
            'name',
            'description',
            'image',
            'carbs',
            'protein',
            'food_type',
            'fat',
            'calories',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        
    def get_calories(self, obj):
        return round(obj.calories, 2)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['food_type'] = dict(Food.FOOD_TYPE_CHOICES).get(instance.food_type)
        return representation