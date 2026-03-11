from jobs.models import Job


def list_jobs():
    return Job.objects.all().order_by("-created_at", "-id")
