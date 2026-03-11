from rest_framework.viewsets import ModelViewSet

from candidates.models import Candidate
from candidates.permissions import CandidatesPermission
from candidates.selectors import get_candidates_queryset
from candidates.serializers import CandidateSerializer


class CandidateViewSet(ModelViewSet):
    queryset = Candidate.objects.none()
    serializer_class = CandidateSerializer
    permission_classes = [CandidatesPermission]

    def get_queryset(self):
        return get_candidates_queryset()

# Create your views here.
