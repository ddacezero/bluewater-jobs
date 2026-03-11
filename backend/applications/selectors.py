from django.db.models import Q

from applications.models import Application
from applications.services import list_applications


def get_applications_queryset(params):
    queryset = list_applications()

    job_id = params.get("job")
    if job_id:
        queryset = queryset.filter(job_id=job_id)

    stage = params.get("stage")
    if stage:
        queryset = queryset.filter(stage=stage)

    candidate_search = params.get("candidate_search")
    if candidate_search:
        queryset = queryset.filter(
            Q(candidate__full_name__icontains=candidate_search)
            | Q(candidate__email__icontains=candidate_search)
        )

    status_filter = params.get("status")
    if status_filter == Application.DerivedStatus.ACTIVE:
        queryset = queryset.exclude(stage__in=[Application.Stage.HIRED, Application.Stage.REJECTED])
    elif status_filter == Application.DerivedStatus.HIRED:
        queryset = queryset.filter(stage=Application.Stage.HIRED)
    elif status_filter == Application.DerivedStatus.REJECTED:
        queryset = queryset.filter(stage=Application.Stage.REJECTED)

    return queryset
