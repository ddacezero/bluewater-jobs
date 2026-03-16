from django.conf import settings
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
    description = models.TextField()
    qualifications = models.TextField()

    class Meta:
        db_table = "jobs"
        ordering = ["-id"]

    def __str__(self) -> str:
        return self.title


def applicant_resume_upload_to(instance, filename: str) -> str:
    return f"applications/job-{instance.job_id}/{filename}"


class JobApplication(models.Model):
    SOURCE_CHOICES = [
        ("Website", "Website"),
        ("LinkedIn", "LinkedIn"),
        ("Indeed", "Indeed"),
        ("Referral", "Referral"),
        ("Endorsed", "Endorsed"),
        ("Other", "Other"),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone_number = models.CharField(max_length=50)
    resume = models.FileField(upload_to=applicant_resume_upload_to)
    expected_salary = models.DecimalField(max_digits=12, decimal_places=2)
    cover_letter = models.TextField(blank=True, default="")
    agreement = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "job_applications"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} - {self.job.title}"


class Candidate(models.Model):
    STAGE_CHOICES = [
        ("Applied", "Applied"),
        ("Screening", "Screening"),
        ("Initial Interview", "Initial Interview"),
        ("Exam", "Exam"),
        ("Departmental Interview", "Departmental Interview"),
        ("Final Interview", "Final Interview"),
        ("Job Offer", "Job Offer"),
        ("Hired", "Hired"),
        ("Rejected", "Rejected"),
    ]

    application = models.OneToOneField(
        JobApplication, on_delete=models.CASCADE, related_name="candidate"
    )
    # Deliberate denormalization of application.job for direct filtering
    # without joining through application.
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="candidates")
    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="assigned_candidates"
    )
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default="Applied")
    rating = models.IntegerField(default=0)
    notes = models.TextField(blank=True, default="")
    exam_result = models.FileField(upload_to="exam-results/", null=True, blank=True)
    endorsed_from = models.CharField(max_length=200, blank=True, default="")
    is_pooled = models.BooleanField(default=False)
    pooled_at = models.DateTimeField(null=True, blank=True)
    stage_timestamps = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "candidates"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.application.name} — {self.job.title}"


class CandidateNote(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name="notes_list")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="candidate_notes"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "candidate_notes"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Note by {self.author} on {self.candidate}"
