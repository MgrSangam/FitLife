from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import SubscriptionPlan

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'is_instructor', 'age', 'height', 'weight']

class CustomUserSerializer(serializers.ModelSerializer):
    assigned_clients_count = serializers.SerializerMethodField()
    clients = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'weight', 'height',
            'is_instructor', 'specialization', 'experience', 'bio', 'contact', 'birthday', 'age',
            'assigned_clients_count', 'clients', 'profile_picture'
        ]

    def get_assigned_clients_count(self, obj):
        if 'clients' in self.context:
            return self.context['clients'].count()
        
        if obj.specialization == 'trainer':
            return SubscriptionPlan.objects.filter(trainer=obj).count()
        elif obj.specialization == 'nutritionist':
            return SubscriptionPlan.objects.filter(nutritionist=obj).count()
        return 0
    
    def get_clients(self, obj):
        if 'clients' in self.context:
            clients = self.context['clients']
        else:
            if obj.specialization == 'trainer':
                clients = User.objects.filter(subscription__trainer=obj)
            elif obj.specialization == 'nutritionist':
                clients = User.objects.filter(subscription__nutritionist=obj)
            else:
                return []
        
        return [
            {
                'id': client.id,
                'username': client.username,
                'email': client.email,
                'age': client.age
            }
            for client in clients
        ]