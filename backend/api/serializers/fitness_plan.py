from rest_framework import serializers
from ..models import FitnessPlan, FitnessPlanExercise, FitnessPlanUser
from django.contrib.auth import get_user_model
from .exercise import ExerciseSerializer
from .exercise import Exercise
from datetime import datetime, timedelta

User = get_user_model()

class FitnessPlanExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all(),
        source='exercise',
        write_only=True
    )
    
    class Meta:
        model = FitnessPlanExercise
        fields = [
            'id',
            'exercise',
            'exercise_id',
            'day',
            'sets',
            'reps',
            'duration_minutes',
            'order'
        ]
        extra_kwargs = {
            'day': {'help_text': "Day of the week for this exercise"}
        }
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['day'] = dict(FitnessPlanExercise.DAYS_OF_WEEK).get(instance.day)
        return representation

class FitnessPlanSerializer(serializers.ModelSerializer):
    exercises = FitnessPlanExerciseSerializer(many=True, required=False)
    picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FitnessPlan
        fields = '__all__'
    
    def get_picture_url(self, obj):
        if obj.picture:
            return self.context['request'].build_absolute_uri(obj.picture.url)
        return None

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        fitness_plan = FitnessPlan.objects.create(**validated_data)
        for exercise_data in exercises_data:
            FitnessPlanExercise.objects.create(
                fitness_plan=fitness_plan,
                exercise_id=exercise_data['exercise'],
                day=exercise_data['day'],
                sets=exercise_data['sets'],
                reps=exercise_data['reps'],
                duration_minutes=exercise_data.get('duration_minutes'),
                order=exercise_data.get('order', 0)
            )
        return fitness_plan

class FitnessPlanUserSerializer(serializers.ModelSerializer):
    fitness_plan = serializers.PrimaryKeyRelatedField(queryset=FitnessPlan.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), default=serializers.CurrentUserDefault())
    progress = serializers.ListField(child=serializers.IntegerField(), read_only=True)

    class Meta:
        model = FitnessPlanUser
        fields = ['id', 'user', 'fitness_plan', 'joined_at', 'progress']
        read_only_fields = ['joined_at', 'progress']

    def validate(self, data):
        if FitnessPlanUser.objects.filter(
            user=data['user'],
            fitness_plan=data['fitness_plan']
        ).exists():
            raise serializers.ValidationError("You have already joined this fitness plan.")
        return data

class FitnessPlanTickDaySerializer(serializers.Serializer):
    day = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        day = attrs.get('day')
        instance = self.context['instance']
        fitness_plan = instance.fitness_plan
        joined_at = instance.joined_at.date()
        today = datetime.now().date()
        max_days = fitness_plan.duration_weeks * 7

        if day > max_days:
            raise serializers.ValidationError(f"Day exceeds plan duration ({max_days} days).")

        target_date = joined_at + timedelta(days=day - 1)
        if target_date > today:
            raise serializers.ValidationError("Cannot tick future days.")
        if target_date < joined_at:
            raise serializers.ValidationError("Day is before plan start.")

        if day in instance.progress:
            raise serializers.ValidationError("Day is already ticked.")

        return attrs