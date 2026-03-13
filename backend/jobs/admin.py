from django.contrib import admin
from .models import Job, JobApplication, Candidate


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "dept", "location", "type", "status", "posted")
    list_filter = ("status", "location", "type")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "job", "source", "created_at")
    list_filter = ("source", "job")


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    @admin.display(description="Candidate")
    def candidate_name(self, obj):
        return str(obj)

    list_display = ("candidate_name", "stage", "rating", "recruiter", "is_pooled", "created_at")
    list_filter = ("stage", "is_pooled", "job")
    raw_id_fields = ("application", "job", "recruiter")
