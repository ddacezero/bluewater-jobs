from rest_framework.permissions import BasePermission, SAFE_METHODS

FULL_ACCESS_ROLES = {"hr_manager", "talent_acquisition_manager"}


class JobPermission(BasePermission):
    """
    Any authenticated user can perform all job operations.
    """

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)


class CandidatePermission(BasePermission):
    """
    - GET (safe methods): any authenticated user.
    - PATCH: any authenticated user.
    - POST: hr_manager and talent_acquisition_manager only.
    - DELETE: hr_manager and talent_acquisition_manager only.
    """

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or request.method == "PATCH":
            return True
        return getattr(request.user, "role", "") in FULL_ACCESS_ROLES
