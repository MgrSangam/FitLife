from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    ChallengeView,
    ChallengeParticipantViewSet,
    EducationalContentViewSet,
    GoalViewSet,
    SubscriptionViewSet,
    FitnessPlanViewSet,
    FitnessPlanExerciseViewSet,
    MealPlanViewSet,
    MealFoodViewSet,
    ExerciseViewSet,
    FoodViewSet,
    UserViewSet,
    InstructorViewSet,
    user_profile,
    instructor_dashboard,
    client_details,
    assigned_instructors,
    chat_messages,
    FitnessPlanUserViewSet,
    MealPlanUserViewSet
)

router = DefaultRouter()

# Authentication routes
router.register('register', RegisterView, basename='register')
router.register('login', LoginView, basename='login')

# Application routes
router.register(r'api/challenges', ChallengeView, basename='challenges')
router.register(r'api/challenge-participants', ChallengeParticipantViewSet, basename='challenge-participants')
router.register('education', EducationalContentViewSet, basename='education')
router.register(r'api/goals', GoalViewSet, basename='goals')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

# Fitness and nutrition routes
router.register(r'api/fitness-plans', FitnessPlanViewSet, basename='fitness-plans')
router.register(r'api/fitness-plan-exercises', FitnessPlanExerciseViewSet, basename='fitness-plan-exercises')
router.register(r'api/meal-plans', MealPlanViewSet, basename='meal-plans')
router.register(r'api/meal-foods', MealFoodViewSet, basename='meal-foods')
router.register(r'api/exercises', ExerciseViewSet, basename='exercises')
router.register(r'api/foods', FoodViewSet, basename='foods')

# User management routes
router.register(r'api/users', UserViewSet, basename='users')
router.register(r'instructors', InstructorViewSet, basename='instructor')


router.register(r'api/fitness-plan-users', FitnessPlanUserViewSet, basename='fitness-plan-users')
router.register(r'api/meal-plan-users', MealPlanUserViewSet, basename='meal-plan-users')

urlpatterns = [
    path('', include(router.urls)),
    path('api/user/profile/', user_profile, name='user-profile'),
    path('api/instructor/dashboard/', instructor_dashboard, name='instructor-dashboard'),
    path('api/clients/<int:client_id>/', client_details, name='client-details'),
    path('api/chat/<int:instructor_id>/', chat_messages, name='chat-messages'),
    path('api/chat/<int:other_user_id>/', chat_messages, name='chat-messages'),
    path('api/chat/', chat_messages, name='chat-list'),
    path('api/user/assigned-instructors/', assigned_instructors, name='assigned-instructors'),  # Moved to path
]