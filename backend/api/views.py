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

from rest_framework import viewsets, permissions
from rest_framework.authentication import SessionAuthentication
from knox.auth import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Challenge, ChallengeParticipant
from .serializers import ChallengeSerializer, ChallengeParticipantSerializer, TickDaySerializer

class ChallengeView(viewsets.ModelViewSet):
    queryset = Challenge.objects.all().order_by('-created_at')
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.AllowAny]

class ChallengeParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = ChallengeParticipantSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return ChallengeParticipant.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='tick-day')
    def tick_day(self, request, pk=None):
        participant = self.get_object()
        serializer = TickDaySerializer(data=request.data, context={'instance': participant})
        if serializer.is_valid():
            day = serializer.validated_data['day']
            participant.progress.append(day)
            participant.save()
            return Response({'progress': participant.progress})
        return Response(serializer.errors, status=400)


    

# Add to your views.py

class EducationalContentViewSet(viewsets.ModelViewSet):
    queryset = EducationalContent.objects.all().order_by('-upload_date')
    serializer_class = EducationalContentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    # def get_permissions(self):
    #     if self.action in ['create', 'update', 'partial_update', 'destroy']:
    #         return [IsAdminUser()]
    #     return super().get_permissions()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})  # <--- Add this line
        return context
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        content = self.get_object()
        content.views += 1
        content.save()
        return Response({'status': 'views incremented'})
    
    @action(detail=True, methods=['post'])
    def rate_content(self, request, pk=None):
        content = self.get_object()
        rating = request.data.get('rating')
        # Add your rating logic here
        return Response({'status': 'rating updated'})
    

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]  # Keep admin-only for update/delete
        return [IsAuthenticated()]  # Allow authenticated users to create

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
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
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        plan = self.request.data.get('plan')

        if not plan:
            raise ValidationError("Plan is required.")

        # Initialize variables
        trainer = None
        nutritionist = None
        
        # Get available instructors if premium plan
        if plan == 'premium':
            trainers = User.objects.filter(
                is_instructor=True, 
                specialization='trainer'
            )
            nutritionists = User.objects.filter(
                is_instructor=True, 
                specialization='nutritionist'
            )

            if trainers.exists():
                trainer = choice(trainers)
            if nutritionists.exists():
                nutritionist = choice(nutritionists)

        try:
            # Update existing subscription
            subscription = SubscriptionPlan.objects.get(user=user)
            subscription.plan = plan
            subscription.is_active = True
            subscription.start_date = timezone.now()
            subscription.end_date = timezone.now() + timedelta(days=30)
            
            if plan == 'premium':
                subscription.trainer = trainer
                subscription.nutritionist = nutritionist
            else:
                subscription.trainer = None
                subscription.nutritionist = None

            subscription.save()

        except SubscriptionPlan.DoesNotExist:
            # Create new subscription
            subscription = serializer.save(
                user=user, 
                is_active=True
            )

            if plan == 'premium':
                subscription.trainer = trainer
                subscription.nutritionist = nutritionist
                subscription.save()

        return subscription


import json
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import FitnessPlan, FitnessPlanExercise
from .serializers import FitnessPlanSerializer, FitnessPlanExerciseSerializer

class FitnessPlanViewSet(viewsets.ModelViewSet):
    queryset = FitnessPlan.objects.all().prefetch_related('exercises__exercise')
    serializer_class = FitnessPlanSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        # Handle JSON string for exercises if needed
        if 'exercises' in request.data and isinstance(request.data['exercises'], str):
            try:
                request.data._mutable = True
                request.data['exercises'] = json.loads(request.data['exercises'])
                request.data._mutable = False
            except json.JSONDecodeError:
                return Response(
                    {'exercises': 'Invalid JSON format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().create(request, *args, **kwargs)
    
    
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .models import FitnessPlanUser
from .serializers import FitnessPlanUserSerializer

class FitnessPlanUserViewSet(viewsets.ModelViewSet):
    queryset = FitnessPlanUser.objects.all()
    serializer_class = FitnessPlanUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return plans for the authenticated user
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if the user has already joined a plan
        if FitnessPlanUser.objects.filter(user=self.request.user).exists():
            raise ValidationError("You can only join one fitness plan at a time.")
        # Automatically set the user to the authenticated user
        serializer.save(user=self.request.user)

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


from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .models import MealPlanUser
from .serializers import MealPlanUserSerializer

class MealPlanUserViewSet(viewsets.ModelViewSet):
    queryset = MealPlanUser.objects.all()
    serializer_class = MealPlanUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if MealPlanUser.objects.filter(user=self.request.user).exists():
            raise ValidationError("You can only join one meal plan at a time.")
        serializer.save(user=self.request.user)
        
        
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
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import CustomUser
from .serializers import CustomUserSerializer

# views.py
from rest_framework.permissions import IsAuthenticated  # or AllowAny

class InstructorViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(is_instructor=True)
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]  # Less restrictive than IsAdminUser
    
    
    

# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer

User = get_user_model()

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    if request.method == 'GET':
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    

# views.py
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_dashboard(request):
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can access this dashboard"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all clients assigned to this instructor
    if request.user.specialization == 'trainer':
        clients = User.objects.filter(subscription__trainer=request.user)
    elif request.user.specialization == 'nutritionist':
        clients = User.objects.filter(subscription__nutritionist=request.user)
    else:
        clients = User.objects.none()
    
    # Serialize the instructor data with clients
    serializer = CustomUserSerializer(request.user, context={
        'clients': clients,
        'request': request
    })
    
    return Response(serializer.data)


# views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_details(request, client_id):
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can access client details"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Verify the client is assigned to this instructor
        if request.user.specialization == 'trainer':
            client = User.objects.get(
                id=client_id,
                subscription__trainer=request.user
            )
        elif request.user.specialization == 'nutritionist':
            client = User.objects.get(
                id=client_id,
                subscription__nutritionist=request.user
            )
        else:
            return Response(
                {"error": "Invalid instructor specialization"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Serialize client data
        serializer = UserSerializer(client)
        return Response(serializer.data)
        
    except User.DoesNotExist:
        return Response(
            {"error": "Client not found or not assigned to you"},
            status=status.HTTP_404_NOT_FOUND
        )
        
        

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import models
from .models import ChatMessage
from .serializers import ChatMessageSerializer

User = get_user_model()

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, other_user_id=None):
    if request.method == 'GET':
        if other_user_id:
            # Verify the conversation is allowed
            try:
                other_user = User.objects.get(id=other_user_id)
                
                # Check if the users can chat
                can_chat = False
                
                if request.user.is_instructor:
                    # Instructor can chat with their assigned clients
                    if request.user.specialization == 'trainer':
                        can_chat = other_user.subscription.trainer == request.user
                    elif request.user.specialization == 'nutritionist':
                        can_chat = other_user.subscription.nutritionist == request.user
                else:
                    # User can chat with their assigned instructors
                    try:
                        subscription = request.user.subscription
                        can_chat = (subscription.trainer and subscription.trainer.id == other_user.id) or \
                                   (subscription.nutritionist and subscription.nutritionist.id == other_user.id)
                    except AttributeError:
                        pass
                
                if not can_chat:
                    return Response(
                        {"error": "You can only message your assigned instructors/clients"},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Fetch messages between the current user and the other user
                messages = ChatMessage.objects.filter(
                    models.Q(sender=request.user, recipient=other_user) |
                    models.Q(sender=other_user, recipient=request.user)
                ).order_by('timestamp')
                
                serializer = ChatMessageSerializer(messages, many=True)
                return Response(serializer.data)
                
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Get all users the current user can chat with
            if request.user.is_instructor:
                # For instructors: get all their assigned clients
                if request.user.specialization == 'trainer':
                    users = User.objects.filter(subscription__trainer=request.user)
                elif request.user.specialization == 'nutritionist':
                    users = User.objects.filter(subscription__nutritionist=request.user)
                else:
                    users = User.objects.none()
            else:
                # For regular users: get their assigned instructors
                try:
                    subscription = request.user.subscription
                    users = User.objects.none()
                    if subscription.trainer:
                        users = users | User.objects.filter(id=subscription.trainer.id)
                    if subscription.nutritionist:
                        users = users | User.objects.filter(id=subscription.nutritionist.id)
                except AttributeError:
                    users = User.objects.none()
            
            serializer = CustomUserSerializer(users, many=True)
            return Response(serializer.data)
    
    elif request.method == 'POST':
        if not other_user_id:
            return Response({"error": "Recipient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            recipient = User.objects.get(id=other_user_id)
            
            # Verify the conversation is allowed
            can_chat = False
            if request.user.is_instructor:
                if request.user.specialization == 'trainer':
                    can_chat = recipient.subscription.trainer == request.user
                elif request.user.specialization == 'nutritionist':
                    can_chat = recipient.subscription.nutritionist == request.user
            else:
                try:
                    subscription = request.user.subscription
                    can_chat = (subscription.trainer and subscription.trainer.id == recipient.id) or \
                               (subscription.nutritionist and subscription.nutritionist.id == recipient.id)
                except AttributeError:
                    pass
            
            if not can_chat:
                return Response(
                    {"error": "You can only message your assigned instructors/clients"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            message = ChatMessage.objects.create(
                sender=request.user,
                recipient=recipient,
                message=request.data.get('message')
            )
            serializer = ChatMessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({"error": "Recipient not found"}, status=status.HTTP_404_NOT_FOUND)







# views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assigned_instructors(request):
    user = request.user
    instructors = []
    
    try:
        subscription = user.subscription
        if subscription.trainer:
            instructors.append(subscription.trainer)
        if subscription.nutritionist:
            instructors.append(subscription.nutritionist)
    except AttributeError:
        # Handle case where user has no subscription
        pass
    
    serializer = CustomUserSerializer(instructors, many=True)
    return Response(serializer.data)