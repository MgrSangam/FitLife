from rest_framework import serializers
from ..models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    recipient = serializers.StringRelatedField()
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'recipient', 'message', 'timestamp', 'read']