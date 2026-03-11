from rest_framework.permissions import BasePermission


class UsersSetupPermission(BasePermission):
    def has_permission(self, request, view) -> bool:
        return True
