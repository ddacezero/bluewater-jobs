from django.urls import path
from .views import CandidateListCreateView, CandidateRetrieveUpdateDestroyView

urlpatterns = [
    path("", CandidateListCreateView.as_view(), name="candidate-list-create"),
    path("<int:pk>/", CandidateRetrieveUpdateDestroyView.as_view(), name="candidate-detail"),
]
