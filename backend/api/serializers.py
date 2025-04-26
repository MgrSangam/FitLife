from rest_framework import serializers
from django.contrib.auth import authenticate  # Add this import
from rest_framework.authtoken.models import Token  
from . models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser  # assuming the model is CustomUser and imported properly


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = (
            'id',
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name',
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user



from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user is None:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        data['user'] = user
        return data

    def to_representation(self, instance):
        user = self.validated_data.get('user')
        return {
            "email": user.email,
            "username": user.username,
            "is_instructor": user.is_instructor
        }


    
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



# goals/serializers.py
from rest_framework import serializers
from .models import CustomUser, Goal

class SetupGoalSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(write_only=True)
    height = serializers.FloatField(write_only=True)
    current_weight = serializers.FloatField(write_only=True)

    class Meta:
        model = Goal
        fields = [
            'goal_type', 'start_date', 'target_date', 'target_weight',
            'activity_level', 'age', 'height', 'current_weight'
        ]

    def create(self, validated_data):
        user = self.context['request'].user

        # Extract age, height, and current_weight from validated_data
        age = validated_data.pop('age')
        height = validated_data.pop('height')
        weight = validated_data.pop('current_weight')

        # Optionally update the user profile with the provided data
        if user:
            user.age = age
            user.height = height
            user.weight = weight
            user.save()

        # Ensure that 'user' is not passed in validated_data, since it will be passed separately
        validated_data.pop('user', None)  # Remove 'user' if it exists

        # Create the goal using the remaining validated data
        goal = Goal.objects.create(user=user, **validated_data)
        return goal

    def update(self, instance, validated_data):
        user = instance.user

        # Extract age, height, and current_weight from validated data
        age = validated_data.pop('age', None)
        height = validated_data.pop('height', None)
        weight = validated_data.pop('current_weight', None)

        # Update user data if present
        updates = {}
        if age is not None:
            updates['age'] = age
        if height is not None:
            updates['height'] = height
        if weight is not None:
            updates['weight'] = weight

        if updates:
            # Update user fields in the CustomUser table
            CustomUser.objects.filter(id=user.id).update(**updates)

        # Update goal fields in the Goal table
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


from rest_framework import serializers
from .models import Exercise

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = [
            'id',
            'name',
            'description',
            'image',
            'calories_burned',
            'muscle_group',
            'difficulty',
            'equipment',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def to_representation(self, instance):
        """
        Custom representation to show human-readable choice labels
        """
        representation = super().to_representation(instance)
        
        # Get human-readable labels for choice fields
        representation['muscle_group'] = dict(Exercise.MUSCLE_GROUP).get(instance.muscle_group)
        representation['difficulty'] = dict(Exercise.DIFFICULTY_LEVEL).get(instance.difficulty)
        representation['equipment'] = dict(Exercise.EQUIPMENT_REQUIRED).get(instance.equipment)
        
        return representation
    
class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields= [
            'id',
            'name',
            'description',
            'image',
            'carbs',
            'protein',
            'food_type',
            'fat',
            'calories',
            'created_at'
        ]
        
        read_only_fields = ['id', 'created_at']
        
    def get_calories(self, obj):
        return round(obj.calories, 2)
    
    def to_representation(self, instance):
        """
        Custom representation to show human-readable choice labels
        """
        representation = super().to_representation(instance)

        # Get human-readable labels for choice fields
        representation['food_type'] = dict(Food.FOOD_TYPE_CHOICES).get(instance.food_type)
        
        return representation