from ..models import ChatMessage
from rest_framework import serializers
from ..serializers.user import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'recipient', 'message', 'timestamp', 'is_read']
        extra_kwargs = {
            'sender': {'read_only': True},
            'timestamp': {'read_only': True},
            'is_read': {'read_only': True},
        }

    def validate(self, data):
        if data.get('recipient') == self.context['request'].user:
            raise serializers.ValidationError("Cannot message yourself")
        return data