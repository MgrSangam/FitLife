from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.auth import RegisterView, LoginView
from api.views.challenge import ChallengeView, ChallengeParticipantViewSet
from api.views.content import EducationalContentViewSet
from api.views.goal import GoalViewSet
from api.views.subscription import SubscriptionViewSet
from api.views.fitness_plan import (
    FitnessPlanViewSet, 
    FitnessPlanExerciseViewSet,
    FitnessPlanUserViewSet
)
from api.views.meal_plan import (
    MealPlanViewSet,
    MealFoodViewSet,
    MealPlanUserViewSet
)
from api.views.exercise import ExerciseViewSet
from api.views.food import FoodViewSet
from api.views.user import (
    UserViewSet,
    InstructorViewSet,
    user_profile,
    instructor_dashboard,
    client_details,
    assigned_instructors
)
from api.views.chat import chat_messages

router = DefaultRouter()

# Authentication routes
router.register('register', RegisterView, basename='register')
router.register('login', LoginView, basename='login')

# Challenge routes
router.register(r'api/challenges', ChallengeView, basename='challenges')
router.register(r'api/challenge-participants', ChallengeParticipantViewSet, 
               basename='challenge-participants')

# Educational content routes
router.register('education', EducationalContentViewSet, basename='education')

# Goal routes
router.register(r'api/goals', GoalViewSet, basename='goals')

# Subscription routes
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

# Fitness plan routes
router.register(r'api/fitness-plans', FitnessPlanViewSet, basename='fitness-plans')
router.register(r'api/fitness-plan-exercises', FitnessPlanExerciseViewSet, 
               basename='fitness-plan-exercises')
router.register(r'api/fitness-plan-users', FitnessPlanUserViewSet, 
               basename='fitness-plan-users')

# Meal plan routes
router.register(r'api/meal-plans', MealPlanViewSet, basename='meal-plans')
router.register(r'api/meal-foods', MealFoodViewSet, basename='meal-foods')
router.register(r'api/meal-plan-users', MealPlanUserViewSet, basename='meal-plan-users')

# Exercise and food routes
router.register(r'api/exercises', ExerciseViewSet, basename='exercises')
router.register(r'api/foods', FoodViewSet, basename='foods')

# User management routes
router.register(r'api/users', UserViewSet, basename='users')
router.register(r'instructors', InstructorViewSet, basename='instructor')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # User profile routes
    path('api/user/profile/', user_profile, name='user-profile'),
    
    # Instructor routes
    path('api/instructor/dashboard/', instructor_dashboard, name='instructor-dashboard'),
    path('api/clients/<int:client_id>/', client_details, name='client-details'),
    
    # Chat routes
    path('api/chat/<int:user_id>/', chat_messages, name='chat-messages'),
    path('api/chat/', chat_messages, name='chat-list'),
    
    # Instructor assignment routes
    path('api/user/assigned-instructors/', assigned_instructors, name='assigned-instructors'),
]