from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from api.models.user import CustomUser
from api.models.fitness import FitnessPlan, FitnessPlanUser
from api.models.meal import MealPlan, MealPlanUser
from api.models.challenge import Challenge, ChallengeParticipant
from api.models.content import EducationalContent
from api.serializers import DashboardSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard(request):
    # Basic metrics
    total_users = CustomUser.objects.count()
    total_meal_plans = MealPlan.objects.count()
    total_fitness_plans = FitnessPlan.objects.count()
    total_challenges = Challenge.objects.count()
    total_contents = EducationalContent.objects.count()

    # Most joined plans and challenges
    most_joined_fitness_plans = FitnessPlan.objects.annotate(
        user_count=Count('users')
    ).order_by('-user_count')[:3].values('name', 'user_count')

    most_joined_meal_plans = MealPlan.objects.annotate(
        user_count=Count('users')
    ).order_by('-user_count')[:3].values('name', 'user_count')

    most_joined_challenges = Challenge.objects.annotate(
        participant_count=Count('challengeparticipant')
    ).order_by('-participant_count')[:3].values('title', 'participant_count')

    # Most viewed content
    most_viewed_contents = EducationalContent.objects.order_by('-views')[:3].values(
        'title', 'views'
    )

    # Recent activities
    recent_activities = []
    new_users = CustomUser.objects.filter(
        date_joined__gte=timezone.now() - timedelta(days=7)
    ).order_by('-date_joined')[:5]
    for user in new_users:
        recent_activities.append({
            'description': f"New user registered: {user.email}",
            'timestamp': user.date_joined.isoformat(),
            'icon': 'FaUserPlus'
        })

    new_plans = FitnessPlanUser.objects.filter(
        joined_at__gte=timezone.now() - timedelta(days=7)
    ).order_by('-joined_at')[:5]
    for plan in new_plans:
        recent_activities.append({
            'description': f"{plan.user.email} joined fitness plan: {plan.fitness_plan.name}",
            'timestamp': plan.joined_at.isoformat(),
            'icon': 'FaCalendarAlt'
        })

    recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
    recent_activities = recent_activities[:10]

    data = {
        'total_users': total_users,
        'total_meal_plans': total_meal_plans,
        'total_fitness_plans': total_fitness_plans,
        'total_challenges': total_challenges,
        'total_contents': total_contents,
        'most_joined_fitness_plans': list(most_joined_fitness_plans),
        'most_joined_meal_plans': list(most_joined_meal_plans),
        'most_joined_challenges': list(most_joined_challenges),
        'most_viewed_contents': list(most_viewed_contents),
        'recent_activities': recent_activities
    }

    serializer = DashboardSerializer(data)
    return Response(serializer.data)