from django.urls import path
from .views import CandidateListCreateView, CandidateNoteListCreateView, CandidateRetrieveUpdateDestroyView

urlpatterns = [
    path("", CandidateListCreateView.as_view(), name="candidate-list-create"),
    path("<int:pk>/", CandidateRetrieveUpdateDestroyView.as_view(), name="candidate-detail"),
    path("<int:candidate_pk>/notes/", CandidateNoteListCreateView.as_view(), name="candidate-notes"),
]
