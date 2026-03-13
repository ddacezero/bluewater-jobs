from rest_framework.permissions import BasePermission, SAFE_METHODS

FULL_ACCESS_ROLES = {"hr_manager", "talent_acquisition_manager"}


class JobPermission(BasePermission):
    """
    - GET (safe methods): any authenticated user.
    - PATCH / PUT (edit): any authenticated user.
    - POST (create): hr_manager and talent_acquisition_manager only.
    - DELETE: hr_manager and talent_acquisition_manager only.
    """

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or request.method in ("PUT", "PATCH"):
            return True
        return getattr(request.user, "role", "") in FULL_ACCESS_ROLES
