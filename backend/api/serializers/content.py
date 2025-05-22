from rest_framework import serializers
from ..models import EducationalContent

class EducationalContentSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = EducationalContent
        fields = [
            'id', 'title', 'description', 'content_type', 'category',
            'upload_date', 'thumbnail_url', 'video_url', 'blog_content', 
            'views', 'rating'
        ]

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return self.context['request'].build_absolute_uri(obj.thumbnail.url)
        return None
    
    def validate(self, data):
        content_type = data.get('content_type', self.instance.content_type if self.instance else None)
        if content_type == 'video' and not data.get('video_url'):
            raise serializers.ValidationError("Video URL is required for video content")
        elif content_type == 'blog' and not data.get('blog_content'):
            raise serializers.ValidationError("Blog content is required for blog posts")
        return data