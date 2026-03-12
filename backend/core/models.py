from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ("hr_manager", "HR Manager"),
        ("talent_acquisition_specialist", "Talent Acquisition Specialist"),
        ("talent_acquisition_manager", "Talent Acquisition Manager"),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, blank=True, default="")

    class Meta:
        db_table = "users"
