from rest_framework import serializers
from ..models import Goal, CustomUser

class SetupGoalSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(write_only=True)
    height = serializers.FloatField(write_only=True)
    current_weight = serializers.FloatField(write_only=True)

    class Meta:
        model = Goal
        fields = [
            'goal_type', 'start_date', 'target_date', 'target_weight',
            'activity_level', 'age', 'height', 'current_weight'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        age = validated_data.pop('age')
        height = validated_data.pop('height')
        weight = validated_data.pop('current_weight')

        if user:
            user.age = age
            user.height = height
            user.weight = weight
            user.save()

        validated_data.pop('user', None)
        goal = Goal.objects.create(user=user, **validated_data)
        return goal

    def update(self, instance, validated_data):
        user = instance.user
        updates = {}
        if 'age' in validated_data:
            updates['age'] = validated_data.pop('age')
        if 'height' in validated_data:
            updates['height'] = validated_data.pop('height')
        if 'current_weight' in validated_data:
            updates['weight'] = validated_data.pop('current_weight')

        if updates:
            CustomUser.objects.filter(id=user.id).update(**updates)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance