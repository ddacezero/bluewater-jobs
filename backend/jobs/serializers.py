from rest_framework import serializers

from .models import Job, JobApplication


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
