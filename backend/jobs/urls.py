from rest_framework.routers import DefaultRouter

from jobs.views import JobViewSet

app_name = "jobs"

router = DefaultRouter()
router.register("", JobViewSet, basename="job")

urlpatterns = router.urls
