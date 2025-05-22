from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from ..serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import authenticate

User = get_user_model()

class RegisterView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'message': 'User registered successfully'
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            _, token = AuthToken.objects.create(user)
            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "is_instructor": bool(user.is_instructor),
                    "is_superuser": bool(user.is_superuser)
                },
                "token": token
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Could not create authentication token"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )