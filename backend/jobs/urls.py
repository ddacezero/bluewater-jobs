from django.urls import path

from .views import (
    JobListCreateView,
    JobRetrieveUpdateDestroyView,
    PublicJobApplyView,
    PublicJobDetailView,
    PublicJobListView,
)

urlpatterns = [
    path("", JobListCreateView.as_view(), name="job-list-create"),
    path("<int:pk>/", JobRetrieveUpdateDestroyView.as_view(), name="job-detail"),
    path("public/", PublicJobListView.as_view(), name="public-job-list"),
    path("public/<int:pk>/", PublicJobDetailView.as_view(), name="public-job-detail"),
    path("public/<int:pk>/apply/", PublicJobApplyView.as_view(), name="public-job-apply"),
]
