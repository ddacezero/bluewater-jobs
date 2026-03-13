from django.db.models import Q
from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Job
from .permissions import JobPermission
from .serializers import JobApplicationSerializer, JobSerializer, PublicJobSerializer


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


class PublicJobsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = None


class PublicJobListView(generics.ListAPIView):
    serializer_class = PublicJobSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = PublicJobsPagination

    def get_queryset(self):
        queryset = Job.objects.filter(status="Active").order_by("-id")
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(dept__icontains=search)
                | Q(location__icontains=search)
                | Q(description__icontains=search)
            )
        return queryset


class PublicJobDetailView(generics.RetrieveAPIView):
    serializer_class = PublicJobSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Job.objects.filter(status="Active").order_by("-id")


class PublicJobApplyView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Job.objects.filter(status="Active")

    def perform_create(self, serializer):
        serializer.save(job=self.get_object(), source="Website")

    def create(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)
