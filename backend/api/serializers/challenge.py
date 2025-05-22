from rest_framework import serializers
from rest_framework.fields import CurrentUserDefault
from datetime import datetime, timedelta
from ..models import Challenge, ChallengeParticipant

class ChallengeSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'description',
            'duration', 'start_date', 'end_date',
            'difficulty', 'muscle_group', 'workout_type','image',
            'image_url', 'created_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

class ChallengeParticipantSerializer(serializers.ModelSerializer):
    challenge_id = serializers.IntegerField(write_only=True)
    challenge = ChallengeSerializer(read_only=True)
    user = serializers.HiddenField(default=CurrentUserDefault())
    date_joined = serializers.DateField(read_only=True)
    progress = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    participate_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ChallengeParticipant
        fields = ['participate_id', 'user', 'challenge', 'challenge_id', 'date_joined', 'progress']

    def validate(self, attrs):
        user = self.context['request'].user
        if ChallengeParticipant.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                "You are already enrolled in a challenge. You can only join one challenge at a time."
            )
        
        challenge_id = attrs.get('challenge_id')
        try:
            Challenge.objects.get(id=challenge_id)
        except Challenge.DoesNotExist:
            raise serializers.ValidationError("Challenge does not exist")
        
        return attrs

    def create(self, validated_data):
        challenge_id = validated_data.pop('challenge_id')
        challenge = Challenge.objects.get(id=challenge_id)
        return ChallengeParticipant.objects.create(
            user=validated_data['user'],
            challenge=challenge
        )

class TickDaySerializer(serializers.Serializer):
    day = serializers.IntegerField(min_value=1, max_value=30)

    def validate(self, attrs):
        day = attrs.get('day')
        instance = self.context['instance']
        challenge = instance.challenge
        start_date = challenge.start_date
        end_date = challenge.end_date
        today = datetime.now().date()

        challenge_start = start_date
        target_date = challenge_start + timedelta(days=day - 1)

        if target_date < start_date or target_date > end_date:
            raise serializers.ValidationError("Day is outside the challenge duration.")

        if today < start_date or today > end_date:
            raise serializers.ValidationError("Challenge is not active.")

        if day in instance.progress:
            raise serializers.ValidationError("Day is already ticked.")

        return attrs