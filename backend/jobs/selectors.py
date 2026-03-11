from jobs.services import list_jobs


def get_jobs_queryset():
    return list_jobs()
