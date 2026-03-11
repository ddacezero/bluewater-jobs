from applications.models import Application


def list_applications():
    return (
        Application.objects.select_related("candidate", "job")
        .all()
        .order_by("-created_at", "-id")
    )
