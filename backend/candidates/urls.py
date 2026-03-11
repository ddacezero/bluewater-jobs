from rest_framework.routers import DefaultRouter

from candidates.views import CandidateViewSet

app_name = "candidates"

router = DefaultRouter()
router.register("", CandidateViewSet, basename="candidate")

urlpatterns = router.urls
