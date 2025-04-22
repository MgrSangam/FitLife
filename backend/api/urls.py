from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterView, basename='register')
router.register('login', LoginView, basename='login')
router.register(r'api/challenges', ChallengeView, basename='challenges')
urlpatterns = router.urls
