from rest_framework import serializers
from django.contrib.auth import authenticate  # Add this import
from rest_framework.authtoken.models import Token  
from . models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required':False },
            'last_name': {'required':False}
            
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        # Remove password2 from validated_data
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name']
        )
        return user
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret
    
class ChallengeSerializer(serializers.ModelSerializer):
    image_url = serializers.ImageField(source='image', read_only=True)

    class Meta:
        model  = Challenge
        # include image_url so frontend gets the absolute URL
        fields = [
            'id','title','description',
            'duration','start_date','end_date',
            'difficulty','muscle_group','workout_type',
            'image_url','created_at'
        ]


    
        


# serializers.py

from rest_framework import serializers
from rest_framework.fields import CurrentUserDefault
from .models import ChallengeParticipant

class ChallengeParticipantSerializer(serializers.ModelSerializer):
    # 1) Hide the `user` field—auto-populate it from request.user
    user = serializers.HiddenField(default=CurrentUserDefault())
    # 2) Make the join date read-only
    date_joined = serializers.DateField(read_only=True)

    class Meta:
        model = ChallengeParticipant
        fields = ['user', 'challenge', 'date_joined']

        

# Add to your existing serializers.py

# Add to your serializers.py

class EducationalContentSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = EducationalContent
        fields = [
            'id', 'title', 'description', 'content_type', 'category',
            'upload_date', 'thumbnail_url', 'video_url', 
            'blog_content', 'views', 'rating',
        ]

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.thumbnail.url) if obj.thumbnail and request else None

    def validate(self, data):
        content_type = data.get('content_type', self.instance.content_type if self.instance else None)
        if content_type == 'video' and not data.get('video_url'):
            raise serializers.ValidationError("Video URL is required for video content")
        elif content_type == 'blog' and not data.get('blog_content'):
            raise serializers.ValidationError("Blog content is required for blog posts")
        return data
