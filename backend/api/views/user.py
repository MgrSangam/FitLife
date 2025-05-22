from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authentication import SessionAuthentication
from knox.auth import TokenAuthentication
from ..models import ChatMessage
from ..serializers import UserSerializer, CustomUserSerializer

User = get_user_model()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(
        is_superuser=False,
        is_staff=False,
        is_instructor=False
    )
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class InstructorViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_instructor=True)
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_dashboard(request):
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can access this dashboard"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.user.specialization == 'trainer':
        clients = User.objects.filter(subscription__trainer=request.user)
    elif request.user.specialization == 'nutritionist':
        clients = User.objects.filter(subscription__nutritionist=request.user)
    else:
        clients = User.objects.none()
    
    serializer = CustomUserSerializer(request.user, context={
        'clients': clients,
        'request': request
    })
    
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_details(request, client_id):
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can access client details"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
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
            
        serializer = CustomUserSerializer(client)
        return Response(serializer.data)
        
    except User.DoesNotExist:
        return Response(
            {"error": "Client not found or not assigned to you"},
            status=status.HTTP_404_NOT_FOUND
        )

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
        pass
    
    serializer = CustomUserSerializer(instructors, many=True)
    return Response(serializer.data)