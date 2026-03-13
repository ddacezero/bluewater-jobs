/**
 * Seed data for the Bluewater Jobs ATS.
 * Candidates and pool entries are now fetched from the API.
 * Job postings remain as local seed data for demo/prototype purposes.
 */

import type { Job } from "./types";

export const INIT_CANDIDATES: never[] = [];
export const INIT_POOL: never[] = [];

export const INIT_JOBS: Job[] = [
  { id: 1, title: "Chef de Partie (Hot)", dept: "Kitchen", location: "Bluewater Maribago", type: "Full-time", status: "Active", posted: "Feb 15, 2026", description: "Oversee the hot kitchen section including grill, sauces, and main course preparation for our resort restaurant and banquet operations.", qualifications: "At least 3 years experience in a 4-5 star hotel kitchen. Culinary diploma or equivalent. Strong knowledge of international cuisines, food safety and hygiene standards." },
  { id: 2, title: "Demi Baker", dept: "Pastry & Bakery", location: "Bluewater Maribago", type: "Full-time", status: "Active", posted: "Feb 20, 2026", description: "Assist the Head Baker in daily pastry and bread production for the resort.", qualifications: "At least 1 year experience in pastry/bakery. Knowledge of bread making, pastry techniques, and food safety. Culinary arts certificate preferred." },
  { id: 3, title: "Plumbing Supervisor", dept: "Engineering", location: "Bluewater Sumilon", type: "Full-time", status: "Active", posted: "Feb 18, 2026", description: "Lead the plumbing maintenance team to ensure all resort water systems and pools are in top condition.", qualifications: "At least 5 years experience in commercial plumbing. TESDA NC II certification. Experience with large-scale water systems, pools, and preventive maintenance." },
  { id: 4, title: "Carpenter", dept: "Engineering", location: "Bluewater Panglao", type: "Full-time", status: "Active", posted: "Feb 22, 2026", description: "Handle furniture repair, custom woodwork, and resort fixture installation.", qualifications: "At least 2 years experience in furniture repair and custom woodwork. TESDA certification preferred. Ability to read blueprints and technical drawings." },
  { id: 5, title: "Front Office Supervisor", dept: "Front Office", location: "Almont Beach Resort", type: "Full-time", status: "Active", posted: "Mar 1, 2026", description: "Supervise the front desk team, manage guest check-in/check-out, and handle VIP arrivals.", qualifications: "At least 2 years experience in hotel front office operations. Proficiency in Opera PMS or similar. Excellent communication and guest relations skills." },
  { id: 6, title: "Baker", dept: "Pastry & Bakery", location: "Bluewater Panglao", type: "Full-time", status: "Active", posted: "Feb 25, 2026", description: "Produce artisan breads, rolls, and baked goods daily for the resort.", qualifications: "At least 2 years experience in commercial baking. Knowledge of artisan bread techniques and pastry basics. Food safety certification required." },
  { id: 7, title: "Housekeeping Team Leader", dept: "Housekeeping", location: "Almont City Hotel", type: "Full-time", status: "Active", posted: "Mar 3, 2026", description: "Lead a team of room attendants and public area cleaners.", qualifications: "At least 2 years experience in hotel housekeeping. Supervisory experience preferred. Knowledge of cleaning standards and inventory management." },
  { id: 8, title: "Commis Chef", dept: "Kitchen", location: "Bluewater Maribago", type: "Full-time", status: "Closed", posted: "Jan 10, 2026", closed: "Feb 10, 2026", description: "Entry-level kitchen position assisting senior chefs.", qualifications: "Basic culinary training or TESDA certification. Knowledge of food preparation and kitchen hygiene. Willing to work in shifts." },
  { id: 9, title: "Spa Therapist", dept: "Spa & Wellness", location: "Amuma Spa", type: "Full-time", status: "Closed", posted: "Nov 15, 2025", closed: "Jan 20, 2026", description: "Provide massage and body treatments. Position paused due to spa renovation.", qualifications: "At least 1 year experience in spa/wellness. TESDA Hilot or massage therapy certification. Knowledge of various massage techniques." },
];
