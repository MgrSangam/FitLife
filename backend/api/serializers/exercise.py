from rest_framework import serializers
from ..models import Exercise

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = [
            'id',
            'name',
            'description',
            'image',
            'calories_burned',
            'muscle_group',
            'difficulty',
            'equipment',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['muscle_group'] = dict(Exercise.MUSCLE_GROUP).get(instance.muscle_group)
        representation['difficulty'] = dict(Exercise.DIFFICULTY_LEVEL).get(instance.difficulty)
        representation['equipment'] = dict(Exercise.EQUIPMENT_REQUIRED).get(instance.equipment)
        return representation