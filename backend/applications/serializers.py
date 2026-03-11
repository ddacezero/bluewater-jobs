from rest_framework import serializers

from applications.models import Application
from candidates.serializers import CandidateSerializer
from jobs.serializers import JobSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    candidate = CandidateSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    candidate_id = serializers.PrimaryKeyRelatedField(
        source="candidate",
        queryset=Application._meta.get_field("candidate").remote_field.model.objects.all(),
        write_only=True,
    )
    job_id = serializers.PrimaryKeyRelatedField(
        source="job",
        queryset=Application._meta.get_field("job").remote_field.model.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Application
        fields = [
            "id",
            "candidate",
            "candidate_id",
            "job",
            "job_id",
            "stage",
            "source",
            "rating",
            "recruiter_name",
            "notes",
            "resume_file",
            "exam_result_file",
            "applied_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
