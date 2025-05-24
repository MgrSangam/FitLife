from django.db.models import Q
from rest_framework import generics
from ..models import ChatMessage
from ..serializers.chat import ChatMessageSerializer
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ..serializers.user import UserSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import status
from rest_framework.response import Response

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('other_user')
        
        if other_user_id:
            return ChatMessage.objects.filter(
                (Q(sender=user) & Q(recipient_id=other_user_id)) |
                (Q(sender_id=other_user_id) & Q(recipient=user))
            ).select_related('sender', 'recipient').order_by('timestamp')
        
        return ChatMessage.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).select_related('sender', 'recipient').order_by('timestamp')

    def create(self, request, *args, **kwargs):
        # Get recipient_id from request data
        recipient_id = request.data.get('recipient_id')
        if not recipient_id:
            return Response(
                {"error": "recipient_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Recipient not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if recipient == request.user:
            return Response(
                {"error": "Cannot send message to yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data={
            'recipient': recipient.id,
            'message': request.data.get('message', '')
        })
        serializer.is_valid(raise_exception=True)
        serializer.save(sender=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MessageMarkAsReadView(generics.UpdateAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save(is_read=True)

class ConversationListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get all users this user has chatted with
        senders = ChatMessage.objects.filter(
            recipient=user
        ).values_list('sender', flat=True).distinct()
        
        recipients = ChatMessage.objects.filter(
            sender=user
        ).values_list('recipient', flat=True).distinct()
        
        user_ids = set(list(senders) + list(recipients))
        return User.objects.filter(id__in=user_ids)