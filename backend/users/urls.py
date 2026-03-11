from django.urls import path

from users.views import UsersPingView

app_name = "users"

urlpatterns = [
    path("ping/", UsersPingView.as_view(), name="ping"),
]
