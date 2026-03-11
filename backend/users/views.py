from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import UsersSetupPermission
from users.serializers import UsersPingSerializer
from users.services import get_users_app_status


class UsersPingView(APIView):
    permission_classes = [UsersSetupPermission]

    def get(self, request):
        payload = UsersPingSerializer(get_users_app_status())
        return Response(payload.data)
