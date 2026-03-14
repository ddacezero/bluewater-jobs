"""
Bluewater Jobs — Database Seeder
Run from the backend directory: python seeders.py

Seeds: TA users, jobs, job applications + candidates with varied stages/ratings.
Safe to re-run: uses get_or_create to avoid duplicates.
"""

import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from core.models import User
from jobs.models import Job, JobApplication, Candidate

# ── 1. TA Users ──────────────────────────────────────────────────────────────

ta_users = [
    {"first_name": "Maria", "last_name": "Santos", "email": "maria.santos@bluewater.com", "role": "talent_acquisition_manager"},
    {"first_name": "Jose", "last_name": "Reyes", "email": "jose.reyes@bluewater.com", "role": "talent_acquisition_specialist"},
    {"first_name": "Ana", "last_name": "Cruz", "email": "ana.cruz@bluewater.com", "role": "talent_acquisition_specialist"},
]

created_users = []
for u in ta_users:
    user, created = User.objects.get_or_create(
        email=u["email"],
        defaults={
            "username": u["email"],
            "first_name": u["first_name"],
            "last_name": u["last_name"],
            "role": u["role"],
        },
    )
    if created:
        user.set_password("Bluewater2026!")
        user.save()
    created_users.append(user)
    print(f"{'Created' if created else 'Exists'}: {user.get_full_name()} ({user.role})")

recruiter = created_users[1]  # Jose Reyes — TA Specialist

# ── 2. Jobs ───────────────────────────────────────────────────────────────────

jobs_data = [
    {"title": "Front Office Supervisor", "dept": "Front Office", "location": "Bluewater Maribago", "type": "Full-time", "status": "Active", "posted": "Jan 15, 2026"},
    {"title": "Executive Chef", "dept": "Kitchen", "location": "Bluewater Sumilon", "type": "Full-time", "status": "Active", "posted": "Feb 1, 2026"},
    {"title": "Housekeeping Supervisor", "dept": "Housekeeping", "location": "Almont Beach Resort", "type": "Full-time", "status": "Active", "posted": "Feb 10, 2026"},
    {"title": "Spa Therapist", "dept": "Wellness", "location": "Amuma Spa", "type": "Full-time", "status": "Active", "posted": "Feb 20, 2026"},
    {"title": "Demi Chef de Partie", "dept": "Kitchen", "location": "Bluewater Panglao", "type": "Full-time", "status": "Active", "posted": "Mar 1, 2026"},
    {"title": "Maintenance Technician", "dept": "Engineering", "location": "Almont Inland", "type": "Full-time", "status": "Closed", "posted": "Nov 10, 2025", "closed": "Jan 30, 2026"},
    {"title": "Guest Relations Officer", "dept": "Front Office", "location": "Blue Bubble", "type": "Full-time", "status": "Active", "posted": "Mar 5, 2026"},
]

seeded_jobs = []
for jd in jobs_data:
    job, created = Job.objects.get_or_create(
        title=jd["title"],
        location=jd["location"],
        defaults={k: v for k, v in jd.items() if k not in ("title", "location")},
    )
    seeded_jobs.append(job)
    print(f"{'Created' if created else 'Exists'} job: {job.title} @ {job.location}")

# ── 3. Candidates ─────────────────────────────────────────────────────────────

candidates_data = [
    # Front Office Supervisor
    {"job": seeded_jobs[0], "name": "Isabella Torres", "email": "isabella.t@email.com", "phone": "09171234501", "salary": "28000", "source": "LinkedIn", "stage": "Final Interview", "rating": 5},
    {"job": seeded_jobs[0], "name": "Mark Villanueva", "email": "mark.v@email.com", "phone": "09171234502", "salary": "26000", "source": "Website", "stage": "Departmental Interview", "rating": 4},
    {"job": seeded_jobs[0], "name": "Claire Mendoza", "email": "claire.m@email.com", "phone": "09171234503", "salary": "25000", "source": "Referral", "stage": "Rejected", "rating": 2},
    # Executive Chef
    {"job": seeded_jobs[1], "name": "Roberto Lim", "email": "roberto.l@email.com", "phone": "09171234504", "salary": "55000", "source": "LinkedIn", "stage": "Job Offer", "rating": 5},
    {"job": seeded_jobs[1], "name": "Carla Aquino", "email": "carla.a@email.com", "phone": "09171234505", "salary": "50000", "source": "Indeed", "stage": "Exam", "rating": 4},
    {"job": seeded_jobs[1], "name": "Dennis Bautista", "email": "dennis.b@email.com", "phone": "09171234506", "salary": "48000", "source": "Website", "stage": "Screening", "rating": 3},
    # Housekeeping Supervisor
    {"job": seeded_jobs[2], "name": "Liza Fernandez", "email": "liza.f@email.com", "phone": "09171234507", "salary": "22000", "source": "Website", "stage": "Hired", "rating": 5},
    {"job": seeded_jobs[2], "name": "Angelo Ramos", "email": "angelo.r@email.com", "phone": "09171234508", "salary": "21000", "source": "Referral", "stage": "Rejected", "rating": 2},
    # Spa Therapist
    {"job": seeded_jobs[3], "name": "Grace Soriano", "email": "grace.s@email.com", "phone": "09171234509", "salary": "20000", "source": "Website", "stage": "Initial Interview", "rating": 3},
    {"job": seeded_jobs[3], "name": "Patrick Uy", "email": "patrick.u@email.com", "phone": "09171234510", "salary": "19500", "source": "Indeed", "stage": "Applied", "rating": 0},
    # Demi Chef de Partie
    {"job": seeded_jobs[4], "name": "Maricel Gomez", "email": "maricel.g@email.com", "phone": "09171234511", "salary": "18000", "source": "Website", "stage": "Screening", "rating": 3},
    {"job": seeded_jobs[4], "name": "Bryan Castillo", "email": "bryan.c@email.com", "phone": "09171234512", "salary": "17500", "source": "LinkedIn", "stage": "Applied", "rating": 0},
    # Maintenance Technician (closed)
    {"job": seeded_jobs[5], "name": "Victor Dela Cruz", "email": "victor.dc@email.com", "phone": "09171234513", "salary": "23000", "source": "Website", "stage": "Hired", "rating": 4},
    {"job": seeded_jobs[5], "name": "Noel Pascual", "email": "noel.p@email.com", "phone": "09171234514", "salary": "22000", "source": "Referral", "stage": "Rejected", "rating": 2},
    # Guest Relations Officer
    {"job": seeded_jobs[6], "name": "Sophia Navarro", "email": "sophia.n@email.com", "phone": "09171234515", "salary": "24000", "source": "Website", "stage": "Applied", "rating": 0},
    {"job": seeded_jobs[6], "name": "Joshua Reyes", "email": "joshua.r@email.com", "phone": "09171234516", "salary": "23500", "source": "LinkedIn", "stage": "Screening", "rating": 3},
]

for cd in candidates_data:
    if JobApplication.objects.filter(email=cd["email"], job=cd["job"]).exists():
        print(f"Exists candidate: {cd['name']}")
        continue

    app = JobApplication.objects.create(
        job=cd["job"],
        name=cd["name"],
        email=cd["email"],
        phone_number=cd["phone"],
        resume="applications/seeded/placeholder.pdf",
        expected_salary=cd["salary"],
        source=cd["source"],
        agreement=True,
    )

    # Signal auto-creates Candidate at stage "Applied"
    candidate = app.candidate
    candidate.stage = cd["stage"]
    candidate.rating = cd["rating"]
    candidate.recruiter = recruiter
    candidate.save(update_fields=["stage", "rating", "recruiter"])
    print(f"Created candidate: {cd['name']} → {cd['stage']}")

print("\nSeeding complete.")
