from rest_framework import generics

from .models import Job
from .permissions import JobPermission
from .serializers import JobSerializer


class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [JobPermission]


class JobRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [JobPermission]
    # Disallow full PUT — only partial PATCH edits are needed
    http_method_names = ["get", "patch", "delete", "head", "options"]
