import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.contrib.auth import get_user_model
from ..models import ChatMessage
from ..serializers import ChatMessageSerializer, UserSerializer

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, user_id=None):
    try:
        if request.method == 'GET':
            if user_id:
                other_user = User.objects.get(id=user_id)
                
                if not can_users_chat(request.user, other_user):
                    return Response(
                        {"error": "You can only message your assigned instructors/clients"},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                messages = ChatMessage.objects.filter(
                    models.Q(sender=request.user, recipient=other_user) |
                    models.Q(sender=other_user, recipient=request.user)
                ).order_by('timestamp')
                
                serializer = ChatMessageSerializer(messages, many=True)
                return Response(serializer.data)
            else:
                if request.user.is_instructor:
                    if request.user.specialization == 'trainer':
                        users = User.objects.filter(subscription__trainer=request.user)
                    elif request.user.specialization == 'nutritionist':
                        users = User.objects.filter(subscription__nutritionist=request.user)
                    else:
                        users = User.objects.none()
                else:
                    try:
                        subscription = request.user.subscription
                        users = User.objects.none()
                        if subscription.trainer:
                            users = users | User.objects.filter(id=subscription.trainer.id)
                        if subscription.nutritionist:
                            users = users | User.objects.filter(id=subscription.nutritionist.id)
                    except AttributeError:
                        users = User.objects.none()
                
                serializer = UserSerializer(users, many=True)
                return Response(serializer.data)
        
        elif request.method == 'POST':
            if not user_id:
                return Response({"error": "Recipient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            recipient = User.objects.get(id=user_id)
            
            if not can_users_chat(request.user, recipient):
                return Response(
                    {"error": "You can only message your assigned instructors/clients"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            message_text = request.data.get('message', '').strip()
            if not message_text:
                return Response({"error": "Message cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
            
            message = ChatMessage.objects.create(
                sender=request.user,
                recipient=recipient,
                message=message_text
            )
            
            serializer = ChatMessageSerializer(message, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in chat_messages: {str(e)}")
        return Response({"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def can_users_chat(user1, user2):
    """Check if two users are allowed to chat with each other"""
    if user1.is_instructor:
        if user1.specialization == 'trainer':
            return user2.subscription.trainer == user1
        elif user1.specialization == 'nutritionist':
            return user2.subscription.nutritionist == user1
    else:
        try:
            subscription = user1.subscription
            return (subscription.trainer == user2) or (subscription.nutritionist == user2)
        except AttributeError:
            return False
    return False