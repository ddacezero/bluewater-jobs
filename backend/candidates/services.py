from candidates.models import Candidate


def list_candidates():
    return Candidate.objects.all().order_by("-created_at", "-id")
