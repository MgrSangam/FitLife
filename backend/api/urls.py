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
    MealFoodViewSet
)

router = DefaultRouter()

# Existing routes
router.register('register', RegisterView, basename='register')
router.register('login', LoginView, basename='login')
router.register(r'api/challenges', ChallengeView, basename='challenges')
router.register(r'api/challenge-participants', ChallengeParticipantViewSet, basename='challenge-participants')
router.register('education', EducationalContentViewSet, basename='education')
router.register(r'api/goals', GoalViewSet, basename='goals')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

# New fitness plan routes
router.register(r'api/fitness-plans', FitnessPlanViewSet, basename='fitness-plans')
router.register(r'api/fitness-plan-exercises', FitnessPlanExerciseViewSet, basename='fitness-plan-exercises')
router.register(r'api/meal-plans', MealPlanViewSet, basename='meal-plans')
router.register(r'api/meal-foods', MealFoodViewSet, basename='meal-foods')
urlpatterns = [
    path('', include(router.urls)),
    
    # You can add additional non-viewset URLs here if needed
    # path('some-path/', some_view, name='some-view'),
]