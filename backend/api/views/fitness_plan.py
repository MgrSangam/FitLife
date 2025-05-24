import json
from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from ..models import FitnessPlan, FitnessPlanExercise, FitnessPlanUser
from ..serializers import FitnessPlanSerializer, FitnessPlanExerciseSerializer, FitnessPlanUserSerializer, FitnessPlanTickDaySerializer
from rest_framework import serializers

class FitnessPlanViewSet(viewsets.ModelViewSet):
    queryset = FitnessPlan.objects.all().prefetch_related('exercises__exercise')
    serializer_class = FitnessPlanSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        if 'exercises' in request.data and isinstance(request.data['exercises'], str):
            try:
                request.data._mutable = True
                request.data['exercises'] = json.loads(request.data['exercises'])
                request.data._mutable = False
            except json.JSONDecodeError:
                return Response(
                    {'exercises': 'Invalid JSON format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return super().create(request, *args, **kwargs)

class FitnessPlanUserViewSet(viewsets.ModelViewSet):
    queryset = FitnessPlanUser.objects.all()
    serializer_class = FitnessPlanUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if FitnessPlanUser.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError("You can only join one fitness plan at a time.")
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='tick-day')
    def tick_day(self, request, pk=None):
        participant = self.get_object()
        serializer = FitnessPlanTickDaySerializer(data=request.data, context={'instance': participant})
        if serializer.is_valid():
            day = serializer.validated_data['day']
            participant.progress.append(day)
            participant.save()
            return Response({'progress': participant.progress})
        return Response(serializer.errors, status=400)

class FitnessPlanExerciseViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    queryset = FitnessPlanExercise.objects.all()
    serializer_class = FitnessPlanExerciseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_id = self.request.query_params.get('plan_id')
        day = self.request.query_params.get('day')
        
        if plan_id:
            queryset = queryset.filter(fitness_plan_id=plan_id)
        if day:
            queryset = queryset.filter(day=day)
        return queryset