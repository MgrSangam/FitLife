from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from ..models import MealPlan, MealFood, MealPlanUser
from ..serializers import MealPlanSerializer, MealFoodSerializer, MealPlanUserSerializer
from rest_framework import serializers


class MealPlanViewSet(viewsets.ModelViewSet):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_type = self.request.query_params.get('type')
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        return queryset.prefetch_related('meal_foods')

class MealPlanUserViewSet(viewsets.ModelViewSet):
    queryset = MealPlanUser.objects.all()
    serializer_class = MealPlanUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if MealPlanUser.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError("You can only join one meal plan at a time.")
        serializer.save(user=self.request.user)

class MealFoodViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    queryset = MealFood.objects.all()
    serializer_class = MealFoodSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_id = self.request.query_params.get('plan_id')
        day = self.request.query_params.get('day')
        meal_time = self.request.query_params.get('meal_time')
        
        if plan_id:
            queryset = queryset.filter(meal_plan_id=plan_id)
        if day:
            queryset = queryset.filter(day=day)
        if meal_time:
            queryset = queryset.filter(meal_time=meal_time)
        return queryset