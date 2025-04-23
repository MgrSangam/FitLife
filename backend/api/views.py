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

class RegisterView(viewsets.ViewSet):
  permission_classes = [permissions.AllowAny]
  queryset = User.objects.all()
  serializer_class = RegisterSerializer
  @transaction.atomic
  def create(self, request):
        print("Incoming data:", request.data)  # Debug what's being received
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            print("Valid data:", serializer.validated_data)  # Debug validated data
            user = serializer.save()
            print("User created:", user.id, user.email)  # Confirm creation
            
            # Verify the user exists in DB
            try:
                db_user = User.objects.get(id=user.id)
                print("User in DB:", db_user.email)
            except User.DoesNotExist:
                print("ERROR: User not found in database!")
            
            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'message': 'User registered successfully'
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        print("Validation errors:", serializer.errors)  # Debug errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def create(self, request):
        # Step 1: Validate input data
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid input", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Step 2: Extract validated data
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        
        # Step 3: Authenticate user
        user = authenticate(request, email=email, password=password)
        
        if not user:
            return Response(
                {"error": "Invalid credentials - email or password incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Step 4: Only create token for authenticated users
        try:
            _, token = AuthToken.objects.create(user)
            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username
                },
                "token": token
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": "Could not create authentication token"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        

class ChallengeView(viewsets.ReadOnlyModelViewSet):
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
        # Only admins can create/update/delete content
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # You could add filtering here if needed (e.g., by content_type)
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rate_content(self, request, pk=None):
        content = self.get_object()
        rating = request.data.get('rating')
        
        if not rating or not 1 <= float(rating) <= 5:
            return Response(
                {"error": "Please provide a valid rating between 1 and 5"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real implementation, you'd want to:
        # 1. Track which user submitted the rating
        # 2. Store individual ratings in a separate model
        # 3. Calculate average rating from all user ratings
        
        content.rating = (content.rating + float(rating)) / 2
        content.save()
        
        return Response(
            {"message": "Rating submitted successfully", "new_rating": content.rating},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        content = self.get_object()
        content.views += 1
        content.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    


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
