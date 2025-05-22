from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly
from ..models import EducationalContent
from ..serializers import EducationalContentSerializer
from rest_framework.decorators import action
from rest_framework.authentication import SessionAuthentication


class EducationalContentViewSet(viewsets.ModelViewSet):
    queryset = EducationalContent.objects.all().order_by('-upload_date')
    serializer_class = EducationalContentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        content = self.get_object()
        content.views += 1
        content.save()
        return Response({'status': 'views incremented'})
    
    @action(detail=True, methods=['post'])
    def rate_content(self, request, pk=None):
        content = self.get_object()
        rating = request.data.get('rating')
        return Response({'status': 'rating updated'})

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]