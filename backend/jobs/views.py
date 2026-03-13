from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Candidate, Job, JobApplication
from .permissions import CandidatePermission, JobPermission
from .serializers import (
    CandidateCreateSerializer,
    CandidateSerializer,
    JobApplicationSerializer,
    JobSerializer,
    PublicJobSerializer,
)


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


class CandidateListCreateView(generics.ListCreateAPIView):
    permission_classes = [CandidatePermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CandidateCreateSerializer
        return CandidateSerializer

    def get_queryset(self):
        qs = Candidate.objects.select_related(
            "application", "job", "recruiter"
        ).all()
        job_id = self.request.query_params.get("job")
        is_pooled = self.request.query_params.get("is_pooled")
        if job_id:
            qs = qs.filter(job_id=job_id)
        if is_pooled == "true":
            qs = qs.filter(is_pooled=True)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Create the JobApplication — signal fires and creates Candidate
        app = JobApplication.objects.create(
            job=data["job"],
            name=data["name"],
            email=data["email"],
            phone_number=data["phone_number"],
            resume=data["resume"],
            expected_salary=data["expected_salary"],
            cover_letter=data.get("cover_letter", ""),
            source=data["source"],
            agreement=True,  # HR is submitting on behalf of the applicant
        )

        # Fetch the auto-created Candidate (created by post_save signal)
        try:
            candidate = app.candidate
        except Candidate.DoesNotExist:
            return Response(
                {"detail": "Candidate record could not be created."},
                status=500,
            )
        recruiter = data.get("recruiter")
        if recruiter:
            candidate.recruiter = recruiter
            candidate.save(update_fields=["recruiter"])

        out = CandidateSerializer(candidate, context={"request": request})
        return Response(out.data, status=201)


class CandidateRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Candidate.objects.select_related("application", "job", "recruiter").all()
    serializer_class = CandidateSerializer
    permission_classes = [CandidatePermission]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def perform_update(self, serializer):
        instance = serializer.instance
        is_pooled = serializer.validated_data.get("is_pooled", instance.is_pooled)
        pooled_at = instance.pooled_at

        if is_pooled and not instance.is_pooled:
            pooled_at = timezone.now()
        elif not is_pooled:
            pooled_at = None

        serializer.save(pooled_at=pooled_at)
