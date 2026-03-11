from django.db import models


class Application(models.Model):
    class Stage(models.TextChoices):
        APPLIED = "applied", "Applied"
        SCREENING = "screening", "Screening"
        INITIAL_INTERVIEW = "initial_interview", "Initial Interview"
        EXAM = "exam", "Exam"
        DEPARTMENTAL_INTERVIEW = "departmental_interview", "Departmental Interview"
        FINAL_INTERVIEW = "final_interview", "Final Interview"
        JOB_OFFER = "job_offer", "Job Offer"
        HIRED = "hired", "Hired"
        REJECTED = "rejected", "Rejected"

    class DerivedStatus:
        ACTIVE = "active"
        HIRED = "hired"
        REJECTED = "rejected"

    candidate = models.ForeignKey("candidates.Candidate", on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey("jobs.Job", on_delete=models.CASCADE, related_name="applications")
    stage = models.CharField(max_length=32, choices=Stage.choices, default=Stage.APPLIED)
    source = models.CharField(max_length=64, blank=True)
    rating = models.PositiveSmallIntegerField(default=0)
    recruiter_name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    resume_file = models.FileField(upload_to="resumes/", blank=True, null=True)
    exam_result_file = models.FileField(upload_to="exam-results/", blank=True, null=True)
    applied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.candidate} -> {self.job} ({self.stage})"

# Create your models here.
