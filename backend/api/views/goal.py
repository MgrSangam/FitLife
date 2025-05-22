from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from knox.auth import TokenAuthentication
from ..models import Goal
from ..serializers import SetupGoalSerializer

class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = SetupGoalSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        existing_goal = Goal.objects.filter(user=user).first()

        if existing_goal:
            existing_goal.goal_type = serializer.validated_data.get('goal_type', existing_goal.goal_type)
            existing_goal.start_date = serializer.validated_data.get('start_date', existing_goal.start_date)
            existing_goal.target_date = serializer.validated_data.get('target_date', existing_goal.target_date)
            existing_goal.target_weight = serializer.validated_data.get('target_weight', existing_goal.target_weight)
            existing_goal.activity_level = serializer.validated_data.get('activity_level', existing_goal.activity_level)
            existing_goal.save()
            return Response(
                {'detail': 'Goal updated successfully.'},
                status=status.HTTP_200_OK
            )

        serializer.save(user=user)