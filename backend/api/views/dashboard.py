from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from api.models.user import CustomUser
from api.models.fitness import FitnessPlanUser
from api.models.meal import MealPlanUser
from api.models.challenge import Challenge
from api.models.content import EducationalContent
from api.serializers import DashboardSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard(request):
    # Calculate metrics
    total_users = CustomUser.objects.count()
    active_plans = (FitnessPlanUser.objects.count() + MealPlanUser.objects.count())
    ongoing_challenges = Challenge.objects.filter(
        start_date__lte=timezone.now(),
        end_date__gte=timezone.now()
    ).count()
    recent_content = EducationalContent.objects.filter(
        upload_date__gte=timezone.now() - timedelta(days=30)
    ).count()

    # Fetch recent activities (e.g., last 10 user actions)
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

    # Sort activities by timestamp
    recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
    recent_activities = recent_activities[:10]

    data = {
        'total_users': total_users,
        'active_plans': active_plans,
        'ongoing_challenges': ongoing_challenges,
        'recent_content': recent_content,
        'recent_activities': recent_activities
    }

    serializer = DashboardSerializer(data)
    return Response(serializer.data)