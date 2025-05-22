from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from knox.auth import TokenAuthentication
from rest_framework.decorators import action
from ..models import Challenge, ChallengeParticipant
from ..serializers import ChallengeSerializer, ChallengeParticipantSerializer, TickDaySerializer

class ChallengeView(viewsets.ModelViewSet):
    queryset = Challenge.objects.all().order_by('-created_at')
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ChallengeParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = ChallengeParticipantSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChallengeParticipant.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='tick-day')
    def tick_day(self, request, pk=None):
        participant = self.get_object()
        serializer = TickDaySerializer(data=request.data, context={'instance': participant})
        if serializer.is_valid():
            day = serializer.validated_data['day']
            participant.progress.append(day)
            participant.save()
            return Response({'progress': participant.progress})
        return Response(serializer.errors, status=400)