from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/jobs/", include(("jobs.urls", "jobs"), namespace="jobs")),
    path("api/candidates/", include(("candidates.urls", "candidates"), namespace="candidates")),
    path("api/applications/", include(("applications.urls", "applications"), namespace="applications")),
    path("api/users/", include(("users.urls", "users"), namespace="users")),
]
