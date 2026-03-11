from rest_framework.viewsets import ModelViewSet

from jobs.models import Job
from jobs.permissions import JobsPermission
from jobs.selectors import get_jobs_queryset
from jobs.serializers import JobSerializer


class JobViewSet(ModelViewSet):
    queryset = Job.objects.none()
    serializer_class = JobSerializer
    permission_classes = [JobsPermission]

    def get_queryset(self):
        return get_jobs_queryset()

# Create your views here.
