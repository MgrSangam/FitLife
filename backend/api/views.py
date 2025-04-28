from django.shortcuts import render
from rest_framework import viewsets,permissions,status
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth import get_user_model,authenticate
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from knox.models import AuthToken
from knox.auth import TokenAuthentication



User = get_user_model()
# Create your views here.

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from .serializers import RegisterSerializer

User = get_user_model()

class RegisterView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def create(self, request):
        print("Incoming data:", request.data)
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            print("Valid data:", serializer.validated_data)
            user = serializer.save()
            print("User created:", user.id, user.email)

            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'message': 'User registered successfully'
            }
            return Response(response_data, status=status.HTTP_201_CREATED)

        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from knox.models import AuthToken
from django.contrib.auth import authenticate
from .serializers import LoginSerializer

class LoginView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid input", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')

        user = authenticate(request, email=email, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials - email or password incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Create the token
            _, token = AuthToken.objects.create(user)
            
            # Include 'is_instructor' in the response
            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "is_instructor": bool(user.is_instructor),  # Add is_instructor
                    "is_superuser":bool(user.is_superuser)
                },
                "token": token
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": "Could not create authentication token"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


        
 # admin.py    

class ChallengeView(viewsets.ModelViewSet):
    queryset = Challenge.objects.all().order_by('-created_at')
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.AllowAny]
    



# views.py
# views.py

# views.py
from rest_framework import viewsets, permissions
from rest_framework.authentication import SessionAuthentication
from knox.auth import TokenAuthentication
from .models import ChallengeParticipant
from .serializers import ChallengeParticipantSerializer

class ChallengeParticipantViewSet(viewsets.ModelViewSet):
    """
    list/retrieve/create ChallengeParticipant.
    - GET    → list only the current user's participations
    - POST   → join a new challenge (authenticated users only)
    """
    serializer_class = ChallengeParticipantSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_permissions(self):
        # Allow any (authenticated or session-auth) to GET, but require auth to POST
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]  # you could swap to IsAuthenticatedOrReadOnly
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Show only the current user's challenge participations
        return ChallengeParticipant.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set `user` to the logged-in user
        serializer.save(user=self.request.user)


    

# Add to your views.py

class EducationalContentViewSet(viewsets.ModelViewSet):
    queryset = EducationalContent.objects.all().order_by('-upload_date')
    serializer_class = EducationalContentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})  # <--- Add this line
        return context

    


#

# goals/views.py
# api/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from knox.auth import TokenAuthentication  # Knox’s TokenAuthentication

from .models import Goal
from .serializers import SetupGoalSerializer

class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = SetupGoalSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show goals belonging to the logged-in user
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # <— note the 8-space indent here under def
        user = self.request.user
        existing_goal = Goal.objects.filter(user=user).first()

        if existing_goal:
            # Update existing goal instead of creating duplicate
            existing_goal.goal_type     = serializer.validated_data.get('goal_type', existing_goal.goal_type)
            existing_goal.start_date    = serializer.validated_data.get('start_date', existing_goal.start_date)
            existing_goal.target_date   = serializer.validated_data.get('target_date', existing_goal.target_date)
            existing_goal.target_weight = serializer.validated_data.get('target_weight', existing_goal.target_weight)
            existing_goal.activity_level= serializer.validated_data.get('activity_level', existing_goal.activity_level)
            existing_goal.save()
            return Response(
                {'detail': 'Goal updated successfully.'},
                status=status.HTTP_200_OK
            )

        # No existing goal: create a new one
        serializer.save(user=user)


from rest_framework import serializers, viewsets, permissions
from .models import SubscriptionPlan
from rest_framework.exceptions import ValidationError
from random import choice
from django.contrib.auth import get_user_model

User = get_user_model()

class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    Subscription Viewset for handling user subscriptions.
    - GET    → list the user's subscription
    - POST   → subscribe to a new plan (authenticated users only)
    """
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        plan = self.request.data.get('plan')

        if not plan:
            raise ValidationError("Plan is required.")

        payment_successful = True
        if not payment_successful:
            raise ValidationError("Payment not successful.")

        try:
            subscription = SubscriptionPlan.objects.get(user=user)
            subscription.plan = plan
            subscription.is_active = True
            subscription.start_date = timezone.now()
            subscription.end_date = timezone.now() + timedelta(days=30)

            if plan == 'premium':
                trainers = User.objects.filter(is_instructor=True, specialization='trainer')
                nutritionists = User.objects.filter(is_instructor=True, specialization='nutritionist')

            if trainers.exists():
                trainer = choice(trainers)
                subscription.trainer = trainer

            if nutritionists.exists():
                nutritionist = choice(nutritionists)
                subscription.nutritionist = nutritionist
            else:
                subscription.trainer = None
                subscription.nutritionist = None

            subscription.save()

        except SubscriptionPlan.DoesNotExist:
            subscription = serializer.save(user=user, is_active=True)

            if plan == 'premium':
                trainers = User.objects.filter(is_instructor=True, specialization='trainer')
                nutritionists = User.objects.filter(is_instructor=True, specialization='nutritionist')

            if trainers.exists():
                trainer = choice(trainers)
                subscription.trainer = trainer

            if nutritionists.exists():
                nutritionist = choice(nutritionists)
                subscription.nutritionist = nutritionist
            else:
                subscription.trainer = None
                subscription.nutritionist = None

            subscription.save()

        return subscription



from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import FitnessPlan, FitnessPlanExercise
from .serializers import FitnessPlanSerializer, FitnessPlanExerciseSerializer

class FitnessPlanViewSet(viewsets.ModelViewSet):
    serializer_class = FitnessPlanSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = FitnessPlan.objects.all().prefetch_related('exercises__exercise')
        
        plan_type = self.request.query_params.get('type')
        difficulty = self.request.query_params.get('difficulty')

        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}


class FitnessPlanExerciseViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    queryset = FitnessPlanExercise.objects.all()
    serializer_class = FitnessPlanExerciseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_id = self.request.query_params.get('plan_id')
        day = self.request.query_params.get('day')
        
        if plan_id:
            queryset = queryset.filter(fitness_plan_id=plan_id)
        if day:
            queryset = queryset.filter(day=day)
        return queryset

        
        


from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import MealPlan, MealFood
from .serializers import MealPlanSerializer, MealFoodSerializer

class MealPlanViewSet(viewsets.ModelViewSet):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_type = self.request.query_params.get('type')
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        return queryset.prefetch_related('meal_foods')

class MealFoodViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    queryset = MealFood.objects.all()
    serializer_class = MealFoodSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_id = self.request.query_params.get('plan_id')
        day = self.request.query_params.get('day')
        meal_time = self.request.query_params.get('meal_time')
        
        if plan_id:
            queryset = queryset.filter(meal_plan_id=plan_id)
        if day:
            queryset = queryset.filter(day=day)
        if meal_time:
            queryset = queryset.filter(meal_time=meal_time)
        return queryset
    
from rest_framework import viewsets
from .models import Exercise
from .serializers import ExerciseSerializer

class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer    


# views.py
from rest_framework import viewsets
from .models import Food
from .serializers import FoodSerializer

class FoodViewSet(viewsets.ModelViewSet):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer

# serializers.py

    
    
    
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    # Filter out superusers, staff, and instructors here
    queryset = User.objects.filter(
        is_superuser=False,
        is_staff=False,
        is_instructor=False  # Assuming the field is named 'is_instructor'
    )
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can view this data



# views.py
from rest_framework import viewsets, permissions
from .models import CustomUser
from .serializers import CustomUserSerializer

class InstructorViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(is_instructor=True)
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        # Ensure the user is marked as an instructor when created
        serializer.save(is_instructor=True)
