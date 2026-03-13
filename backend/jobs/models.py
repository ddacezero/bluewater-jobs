from django.db import models


class Job(models.Model):
    LOCATION_CHOICES = [
        ("Bluewater Maribago", "Bluewater Maribago"),
        ("Bluewater Sumilon", "Bluewater Sumilon"),
        ("Bluewater Panglao", "Bluewater Panglao"),
        ("Almont Inland", "Almont Inland"),
        ("Almont Beach Resort", "Almont Beach Resort"),
        ("Almont City Hotel", "Almont City Hotel"),
        ("Amuma Spa", "Amuma Spa"),
        ("Blue Bubble", "Blue Bubble"),
    ]

    TYPE_CHOICES = [
        ("Full-time", "Full-time"),
        ("Part-time", "Part-time"),
        ("Contract", "Contract"),
        ("Internship", "Internship"),
    ]

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Closed", "Closed"),
    ]

    title = models.CharField(max_length=200)
    dept = models.CharField(max_length=100, blank=True, default="")
    location = models.CharField(max_length=100, choices=LOCATION_CHOICES)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    # Stored as a formatted string matching frontend format, e.g. "Mar 13, 2026"
    posted = models.CharField(max_length=50)
    closed = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, default="")
    qualifications = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "jobs"
        ordering = ["-id"]

    def __str__(self) -> str:
        return self.title
