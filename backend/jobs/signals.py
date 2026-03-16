from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Candidate, JobApplication


@receiver(post_save, sender=JobApplication)
def create_candidate_from_application(sender, instance, created, **kwargs):
    """Auto-create a Candidate at stage 'Applied' whenever a new JobApplication is saved."""
    if created:
        Candidate.objects.create(
            application=instance,
            job=instance.job,
            stage_timestamps={"Applied": timezone.now().isoformat()},
        )
