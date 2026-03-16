"""
Bluewater Jobs — Database Seeder
Run from the backend directory: python seeders.py

Seeds: TA users, jobs, job applications, and candidates with realistic
application/candidate metadata.

Safe to re-run:
- users are upserted
- jobs are always inserted as a fresh batch
- applications are upserted by (job, email)
- candidates are upserted by application
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import django
from django.conf import settings
from django.db import transaction

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from core.models import User
from jobs.models import Job, JobApplication, Candidate


def ensure_placeholder_resume() -> str:
    """Create a tiny placeholder PDF if the seeded file does not exist yet."""
    rel_path = Path("applications/seeded/placeholder.pdf")
    abs_path = Path(settings.MEDIA_ROOT) / rel_path
    if not abs_path.exists():
        abs_path.parent.mkdir(parents=True, exist_ok=True)
        abs_path.write_bytes(
            b"%PDF-1.1\n"
            b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n"
            b"trailer<</Root 1 0 R>>\n%%EOF\n"
        )
    return str(rel_path)


PLACEHOLDER_RESUME = ensure_placeholder_resume()


# ── 1. TA Users ──────────────────────────────────────────────────────────────

ta_users = [
    {"first_name": "Maria", "last_name": "Santos", "email": "maria.santos@bluewater.com", "role": "talent_acquisition_manager"},
    {"first_name": "Jose", "last_name": "Reyes", "email": "jose.reyes@bluewater.com", "role": "talent_acquisition_specialist"},
    {"first_name": "Ana", "last_name": "Cruz", "email": "ana.cruz@bluewater.com", "role": "talent_acquisition_specialist"},
]

created_users = []
for u in ta_users:
    user, created = User.objects.update_or_create(
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
    print(f"{'Created' if created else 'Updated'}: {user.get_full_name()} ({user.role})")

recruiter = created_users[1]  # Jose Reyes — TA Specialist

# ── 2. Jobs ───────────────────────────────────────────────────────────────────

jobs_data = [
    {
        "title": "Front Office Supervisor",
        "dept": "Front Office",
        "location": "Bluewater Maribago",
        "type": "Full-time",
        "status": "Active",
        "posted": "Jan 15, 2026",
        "closed": None,
        "description": "Lead day-to-day front office operations, supervise guest arrival and departure workflows, manage shift coverage, and ensure service standards are consistently delivered across reception, concierge coordination, and guest concern handling. The role is expected to coach team members on service recovery, support room readiness communication with housekeeping, and maintain accurate reporting on occupancy, incidents, and guest satisfaction trends.",
        "qualifications": "At least 3 years of hotel front office experience with prior supervisory exposure, strong knowledge of reservations and guest handling procedures, and the ability to lead a team in a fast-paced hospitality environment. Candidates should demonstrate confident communication, problem-solving during guest escalations, scheduling or shift coordination capability, and a strong commitment to service quality, accuracy, and professionalism.",
    },
    {
        "title": "Executive Chef",
        "dept": "Kitchen",
        "location": "Bluewater Sumilon",
        "type": "Full-time",
        "status": "Active",
        "posted": "Feb 1, 2026",
        "closed": None,
        "description": "Lead the culinary operation across menu development, food quality, kitchen discipline, sanitation compliance, and brigade performance. The role is responsible for balancing creativity with operational efficiency by managing costing, inventory usage, banquet and a la carte readiness, vendor coordination, and training of sous chefs and line cooks to maintain consistent standards during both regular service and high-volume functions.",
        "qualifications": "Proven leadership experience in senior kitchen management, strong background in menu engineering and food cost control, and deep familiarity with HACCP and safe food handling practices. Candidates should be capable of leading large teams, planning production effectively, maintaining consistency under pressure, and collaborating with operations leadership on guest experience, events, and commercial performance.",
    },
    {
        "title": "Housekeeping Supervisor",
        "dept": "Housekeeping",
        "location": "Almont Beach Resort",
        "type": "Full-time",
        "status": "Active",
        "posted": "Feb 10, 2026",
        "closed": None,
        "description": "Supervise daily housekeeping operations by assigning room attendants, monitoring turnaround priorities, inspecting guestrooms and public areas, and ensuring cleaning standards meet brand expectations. The role also supports linen and supplies control, coordinates closely with front office on room availability, handles quality issues promptly, and helps maintain productivity, discipline, and service readiness across the housekeeping team.",
        "qualifications": "Relevant housekeeping experience in a hotel or resort environment with supervisory or team lead exposure, excellent attention to detail, and strong knowledge of room inspection standards and housekeeping procedures. Candidates should be organized, dependable, capable of scheduling or task delegation, and comfortable coordinating with other departments to support occupancy and guest satisfaction goals.",
    },
    {
        "title": "Spa Therapist",
        "dept": "Wellness",
        "location": "Amuma Spa",
        "type": "Full-time",
        "status": "Active",
        "posted": "Feb 20, 2026",
        "closed": None,
        "description": "Deliver high-quality wellness treatments while creating a calm, personalized, and premium guest experience from arrival to post-treatment care. This role is responsible for preparing treatment rooms, maintaining hygiene and product standards, recommending suitable services, supporting retail or upsell opportunities when appropriate, and ensuring every guest interaction reflects professionalism, attentiveness, and therapeutic care.",
        "qualifications": "Valid spa or massage therapy certification, hands-on treatment experience, and strong understanding of hygiene, safety, and guest care standards. Candidates should present excellent interpersonal skills, a polished service mindset, and the ability to perform treatments consistently while making guests feel comfortable, relaxed, and well attended throughout the service journey.",
    },
    {
        "title": "Demi Chef de Partie",
        "dept": "Kitchen",
        "location": "Bluewater Panglao",
        "type": "Full-time",
        "status": "Active",
        "posted": "Mar 1, 2026",
        "closed": None,
        "description": "Support kitchen station operations by preparing mise en place, executing dishes according to recipe and plating specifications, and assisting senior chefs in maintaining smooth service flow during peak periods. The role includes monitoring stock levels, minimizing waste, keeping the workstation clean and organized, and contributing to consistent product quality for both buffet and a la carte preparation.",
        "qualifications": "Previous culinary production experience in a professional kitchen, strong understanding of kitchen discipline and food safety procedures, and the ability to work efficiently during busy service periods. Candidates should be coachable, detail-oriented, physically capable of handling kitchen demands, and committed to consistency, cleanliness, and continuous improvement in technique and execution.",
    },
    {
        "title": "Maintenance Technician",
        "dept": "Engineering",
        "location": "Almont Inland",
        "type": "Full-time",
        "status": "Closed",
        "posted": "Nov 10, 2025",
        "closed": "Jan 30, 2026",
        "description": "Perform preventive maintenance and responsive repair work across guestrooms, public areas, and back-of-house facilities, including electrical, plumbing, mechanical, and general building concerns within scope. The role supports operational continuity by troubleshooting issues quickly, coordinating with department heads on urgent maintenance needs, documenting completed work, and helping maintain safe, functional, and presentable facilities for both guests and staff.",
        "qualifications": "Relevant building or facilities maintenance experience with solid troubleshooting ability across common repair categories, plus a practical understanding of safety procedures and equipment handling. Candidates should be dependable, responsive to urgent issues, comfortable working flexible schedules, and able to communicate repair status clearly while maintaining quality workmanship and preventive maintenance discipline.",
    },
    {
        "title": "Guest Relations Officer",
        "dept": "Front Office",
        "location": "Blue Bubble",
        "type": "Full-time",
        "status": "Active",
        "posted": "Mar 5, 2026",
        "closed": None,
        "description": "Serve as a key point of contact for guest concerns, VIP handling, and service recovery coordination by working closely with front office, housekeeping, food and beverage, and other operational teams. The role is expected to respond professionally to complaints, track recurring issues, support special guest arrangements, and help strengthen satisfaction and brand loyalty through thoughtful follow-through and polished guest communication.",
        "qualifications": "Strong hospitality or customer service background with excellent verbal and written communication, confident problem resolution skills, and the ability to remain composed during high-pressure guest interactions. Candidates should demonstrate empathy, professionalism, attention to detail, and strong coordination skills when managing escalations, special requests, and cross-functional follow-up.",
    },
]

seeded_jobs = []
for jd in jobs_data:
    job = Job.objects.create(**jd)
    seeded_jobs.append(job)
    print(f"Created job: {job.title} @ {job.location}")

# ── 3. Candidates ─────────────────────────────────────────────────────────────

candidates_data = [
    # Front Office Supervisor
    {"job": seeded_jobs[0], "name": "Isabella Torres", "email": "isabella.t@email.com", "phone": "09171234501", "salary": "28000", "source": "LinkedIn", "cover_letter": "Experienced front office leader ready to handle guest recovery and shift leadership.", "stage": "Final Interview", "rating": 5, "notes": "Strong leadership presence and solid guest recovery examples.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[0], "name": "Mark Villanueva", "email": "mark.v@email.com", "phone": "09171234502", "salary": "26000", "source": "Website", "cover_letter": "Interested in growing into a larger supervisory role in hospitality operations.", "stage": "Departmental Interview", "rating": 4, "notes": "Operationally capable, still needs deeper conflict-handling examples.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[0], "name": "Claire Mendoza", "email": "claire.m@email.com", "phone": "09171234503", "salary": "25000", "source": "Referral", "cover_letter": "Referred by a current employee for guest services supervision.", "stage": "Rejected", "rating": 2, "notes": "Communication was good, but supervisory examples were thin.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    # Executive Chef
    {"job": seeded_jobs[1], "name": "Roberto Lim", "email": "roberto.l@email.com", "phone": "09171234504", "salary": "55000", "source": "LinkedIn", "cover_letter": "Seasoned culinary leader with resort and high-volume banquet exposure.", "stage": "Job Offer", "rating": 5, "notes": "Top culinary fit; aligned with cost controls and people leadership.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[1], "name": "Carla Aquino", "email": "carla.a@email.com", "phone": "09171234505", "salary": "50000", "source": "Indeed", "cover_letter": "Senior sous chef ready for a first executive chef role.", "stage": "Exam", "rating": 4, "notes": "Technical exam pending final scoring.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[1], "name": "Dennis Bautista", "email": "dennis.b@email.com", "phone": "09171234506", "salary": "48000", "source": "Website", "cover_letter": "Kitchen operations manager with a strong back-of-house systems focus.", "stage": "Screening", "rating": 3, "notes": "Needs deeper menu development discussion in next round.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    # Housekeeping Supervisor
    {"job": seeded_jobs[2], "name": "Liza Fernandez", "email": "liza.f@email.com", "phone": "09171234507", "salary": "22000", "source": "Website", "cover_letter": "Housekeeping team lead with strong room inspection discipline.", "stage": "Hired", "rating": 5, "notes": "Excellent room standards and team coordination.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[2], "name": "Angelo Ramos", "email": "angelo.r@email.com", "phone": "09171234508", "salary": "21000", "source": "Referral", "cover_letter": "Interested in stepping into a supervisory housekeeping role.", "stage": "Rejected", "rating": 2, "notes": "Not enough people-management examples yet.", "endorsed_from": "", "is_pooled": True, "pooled_at": datetime(2026, 3, 1, 10, 0, tzinfo=timezone.utc)},
    # Spa Therapist
    {"job": seeded_jobs[3], "name": "Grace Soriano", "email": "grace.s@email.com", "phone": "09171234509", "salary": "20000", "source": "Website", "cover_letter": "Licensed therapist focused on premium guest treatment experiences.", "stage": "Initial Interview", "rating": 3, "notes": "Good service orientation; still validating modality breadth.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[3], "name": "Patrick Uy", "email": "patrick.u@email.com", "phone": "09171234510", "salary": "19500", "source": "Indeed", "cover_letter": "Entry-level spa therapist candidate looking to enter resort wellness.", "stage": "Applied", "rating": 0, "notes": "", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    # Demi Chef de Partie
    {"job": seeded_jobs[4], "name": "Maricel Gomez", "email": "maricel.g@email.com", "phone": "09171234511", "salary": "18000", "source": "Website", "cover_letter": "Line cook with pastry crossover looking to grow in a structured brigade.", "stage": "Screening", "rating": 3, "notes": "Worth progressing for kitchen trial.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[4], "name": "Bryan Castillo", "email": "bryan.c@email.com", "phone": "09171234512", "salary": "17500", "source": "LinkedIn", "cover_letter": "Commis-level candidate with good fundamentals and strong pace.", "stage": "Applied", "rating": 0, "notes": "", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    # Maintenance Technician (closed)
    {"job": seeded_jobs[5], "name": "Victor Dela Cruz", "email": "victor.dc@email.com", "phone": "09171234513", "salary": "23000", "source": "Website", "cover_letter": "Facility technician with hospitality maintenance experience.", "stage": "Hired", "rating": 4, "notes": "Strong troubleshooting background.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[5], "name": "Noel Pascual", "email": "noel.p@email.com", "phone": "09171234514", "salary": "22000", "source": "Referral", "cover_letter": "General maintenance candidate endorsed by engineering staff.", "stage": "Rejected", "rating": 2, "notes": "Better fit for future openings than this specific role.", "endorsed_from": "Maintenance Technician", "is_pooled": True, "pooled_at": datetime(2026, 2, 5, 9, 30, tzinfo=timezone.utc)},
    # Guest Relations Officer
    {"job": seeded_jobs[6], "name": "Sophia Navarro", "email": "sophia.n@email.com", "phone": "09171234515", "salary": "24000", "source": "Website", "cover_letter": "Guest services candidate with experience handling escalations and VIP requests.", "stage": "Applied", "rating": 0, "notes": "", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
    {"job": seeded_jobs[6], "name": "Joshua Reyes", "email": "joshua.r@email.com", "phone": "09171234516", "salary": "23500", "source": "LinkedIn", "cover_letter": "Front-of-house professional interested in guest relations and service recovery.", "stage": "Screening", "rating": 3, "notes": "Confident communicator; next step is roleplay assessment.", "endorsed_from": "", "is_pooled": False, "pooled_at": None},
]

with transaction.atomic():
    for cd in candidates_data:
        app, app_created = JobApplication.objects.update_or_create(
            job=cd["job"],
            email=cd["email"],
            defaults={
                "name": cd["name"],
                "phone_number": cd["phone"],
                "resume": PLACEHOLDER_RESUME,
                "expected_salary": cd["salary"],
                "cover_letter": cd["cover_letter"],
                "source": cd["source"],
                "agreement": True,
            },
        )

        candidate, candidate_created = Candidate.objects.update_or_create(
            application=app,
            defaults={
                "job": cd["job"],
                "recruiter": recruiter,
                "stage": cd["stage"],
                "rating": cd["rating"],
                "notes": cd["notes"],
                "endorsed_from": cd["endorsed_from"],
                "is_pooled": cd["is_pooled"],
                "pooled_at": cd["pooled_at"],
            },
        )
        app_action = "Created" if app_created else "Updated"
        candidate_action = "Created" if candidate_created else "Updated"
        print(
            f"{app_action} application: {cd['name']} | "
            f"{candidate_action} candidate → {candidate.stage}"
        )

print("\nSeeding complete.")
