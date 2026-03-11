from rest_framework.viewsets import ModelViewSet

from applications.models import Application
from applications.permissions import ApplicationsPermission
from applications.selectors import get_applications_queryset
from applications.serializers import ApplicationSerializer


class ApplicationViewSet(ModelViewSet):
    queryset = Application.objects.none()
    serializer_class = ApplicationSerializer
    permission_classes = [ApplicationsPermission]

    def get_queryset(self):
        return get_applications_queryset(self.request.query_params)

# Create your views here.
