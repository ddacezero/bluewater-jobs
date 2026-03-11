from rest_framework import serializers


class UsersPingSerializer(serializers.Serializer):
    detail = serializers.CharField()
