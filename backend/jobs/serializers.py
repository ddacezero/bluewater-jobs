from rest_framework import serializers

from .models import Job


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
