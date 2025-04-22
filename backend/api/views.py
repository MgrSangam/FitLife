from django.shortcuts import render
from rest_framework import viewsets,permissions,status
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth import get_user_model,authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from knox.models import AuthToken


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
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, email= email, password= password)
            
            if user:
                _, token = AuthToken.objects.create(user)
                return Response(
                    {
                "user": self.serializer_class(user).data,
                "token": token
                    }
                )
            else:
                return Response({"error": "Invalid credentials"}, status=400)
        else:
            return Response(serializer.errors,status = 400)
        
        

class ChallengeView(viewsets.ReadOnlyModelViewSet):
    queryset = Challenge.objects.all().order_by('-created_at')
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.AllowAny]