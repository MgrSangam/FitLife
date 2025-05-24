from rest_framework import serializers

class DashboardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_meal_plans = serializers.IntegerField()
    total_fitness_plans = serializers.IntegerField()
    total_challenges = serializers.IntegerField()
    total_contents = serializers.IntegerField()
    most_joined_fitness_plans = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(allow_blank=True)
        )
    )
    most_joined_meal_plans = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(allow_blank=True)
        )
    )
    most_joined_challenges = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(allow_blank=True)
        )
    )
    most_viewed_contents = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(allow_blank=True)
        )
    )
    recent_activities = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(allow_blank=True)
        )
    )