from rest_framework import serializers

from core.models import User
from .models import Candidate, Job, JobApplication


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "dept",
            "location",
            "type",
            "status",
            "posted",
            "closed",
            "description",
            "qualifications",
        )


class PublicJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "dept",
            "location",
            "type",
            "posted",
            "description",
            "qualifications",
        )


class JobApplicationSerializer(serializers.ModelSerializer):
    agreement = serializers.BooleanField()

    class Meta:
        model = JobApplication
        fields = (
            "id",
            "job",
            "name",
            "email",
            "phone_number",
            "resume",
            "expected_salary",
            "cover_letter",
            "agreement",
            "source",
            "created_at",
        )
        read_only_fields = ("id", "job", "source", "created_at")

    def validate_agreement(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("You must agree before submitting your application.")
        return value


class RecruiterSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name")

    def get_name(self, obj) -> str:
        return obj.get_full_name()


class JobTrimmedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ("id", "title", "location")


class ApplicationNestedSerializer(serializers.ModelSerializer):
    """Trimmed read-only view of a JobApplication — excludes cover_letter and agreement."""

    class Meta:
        model = JobApplication
        fields = (
            "id",
            "name",
            "email",
            "phone_number",
            "resume",
            "expected_salary",
            "source",
            "created_at",
        )
        read_only_fields = fields


class CandidateSerializer(serializers.ModelSerializer):
    application = ApplicationNestedSerializer(read_only=True)
    job = JobTrimmedSerializer(read_only=True)
    recruiter = RecruiterSerializer(read_only=True)

    class Meta:
        model = Candidate
        fields = (
            "id",
            "stage",
            "rating",
            "recruiter",
            "notes",
            "exam_result",
            "endorsed_from",
            "is_pooled",
            "pooled_at",
            "created_at",
            "application",
            "job",
        )
        read_only_fields = ("id", "pooled_at", "created_at", "application", "job")


class CandidateCreateSerializer(serializers.Serializer):
    """Validates the payload for HR-initiated manual candidate creation."""

    # Application fields
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=50)
    resume = serializers.FileField()
    expected_salary = serializers.DecimalField(max_digits=12, decimal_places=2)
    cover_letter = serializers.CharField(required=False, allow_blank=True, default="")
    source = serializers.ChoiceField(choices=JobApplication.SOURCE_CHOICES)

    # Candidate / HR fields
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(status="Active"), source="job"
    )
    recruiter_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="recruiter", required=False, allow_null=True
    )
