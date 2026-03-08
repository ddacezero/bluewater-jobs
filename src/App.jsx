import { useState, useEffect, useRef } from "react";

const RECRUITERS = ["Joela", "Ranie"];
const LOCATIONS = ["Bluewater Maribago", "Bluewater Sumilon", "Bluewater Panglao", "Almont Inland", "Almont Beach Resort", "Almont City Hotel", "Amuma Spa", "Blue Bubble"];
const STAGES = ["Applied", "Screening", "Initial Interview", "Exam", "Departmental Interview", "Final Interview", "Job Offer", "Hired", "Rejected"];
const STAGE_COLORS = {
  "Applied": { bg: "#E8F4FD", text: "#1F75B9", dot: "#1F75B9" },
  "Screening": { bg: "#FFF3E0", text: "#E65100", dot: "#FB8C00" },
  "Initial Interview": { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" },
  "Exam": { bg: "#FFF8E1", text: "#F57F17", dot: "#FDD835" },
  "Departmental Interview": { bg: "#E3F2FD", text: "#1565C0", dot: "#42A5F5" },
  "Final Interview": { bg: "#EDE7F6", text: "#4527A0", dot: "#7E57C2" },
  "Job Offer": { bg: "#F3E5F5", text: "#6A1B9A", dot: "#8E24AA" },
  "Hired": { bg: "#E0F2F1", text: "#00695C", dot: "#00897B" },
  "Rejected": { bg: "#FFEBEE", text: "#C62828", dot: "#EF5350" },
};

const INIT_CANDIDATES = [
  { id: 1, name: "Ricardo Santos", role: "Chef de Partie (Hot)", stage: "Initial Interview", rating: 5, applied: "Mar 2, 2026", email: "r.santos@email.com", avatar: "RS", tags: ["Hot Kitchen", "Sauces", "Grill", "Fine Dining"], source: "LinkedIn", jobId: 1, recruiter: "Joela", notes: "10 years experience in 5-star hotel kitchens. Very strong on sauces and grill work.", resumeName: "Ricardo_Santos_CV.pdf" },
  { id: 2, name: "Maria Dela Cruz", role: "Demi Baker", stage: "Screening", rating: 4, applied: "Mar 4, 2026", email: "m.delacruz@email.com", avatar: "MD", tags: ["Pastry", "Bread Making", "Plating"], source: "Referral", jobId: 2, recruiter: "Ranie", notes: "", resumeName: "Maria_DelaCruz_Resume.pdf" },
  { id: 3, name: "Jun Reyes", role: "Plumbing Supervisor", stage: "Job Offer", rating: 5, applied: "Feb 28, 2026", email: "j.reyes@email.com", avatar: "JR", tags: ["Plumbing Systems", "Team Lead", "Preventive Maintenance"], source: "Indeed", jobId: 3, recruiter: "Joela", notes: "Excellent candidate. 15 years in hotel maintenance. Passed all interviews.", resumeName: "Jun_Reyes_CV.pdf" },
  { id: 4, name: "Angelica Torres", role: "Chef de Partie (Hot)", stage: "Applied", rating: 3, applied: "Mar 5, 2026", email: "a.torres@email.com", avatar: "AT", tags: ["Asian Cuisine", "Wok Station"], source: "Website", jobId: 1, recruiter: "Ranie", notes: "", resumeName: "" },
  { id: 5, name: "Carlo Mendoza", role: "Carpenter", stage: "Departmental Interview", rating: 4, applied: "Mar 1, 2026", email: "c.mendoza@email.com", avatar: "CM", tags: ["Woodworking", "Furniture Repair", "Finishing"], source: "LinkedIn", jobId: 4, recruiter: "Joela", notes: "Great portfolio of resort furniture restoration. Engineering head wants to meet.", resumeName: "Carlo_Mendoza_Resume.pdf" },
  { id: 6, name: "Patricia Lim", role: "Demi Baker", stage: "Applied", rating: 3, applied: "Mar 6, 2026", email: "p.lim@email.com", avatar: "PL", tags: ["Cakes", "Desserts"], source: "Website", jobId: 2, recruiter: "Joela", notes: "", resumeName: "" },
  { id: 7, name: "Dennis Aquino", role: "Plumbing Supervisor", stage: "Exam", rating: 4, applied: "Mar 3, 2026", email: "d.aquino@email.com", avatar: "DA", tags: ["Water Systems", "HVAC Basics", "Troubleshooting"], source: "Referral", jobId: 3, recruiter: "Ranie", notes: "Scheduled for practical skills exam.", resumeName: "Dennis_Aquino_CV.pdf" },
  { id: 8, name: "Miguel Garcia", role: "Carpenter", stage: "Hired", rating: 5, applied: "Feb 20, 2026", email: "m.garcia@email.com", avatar: "MG", tags: ["Cabinetry", "Installation", "Blueprint Reading"], source: "LinkedIn", jobId: 4, recruiter: "Ranie", notes: "Successfully hired. Start date Mar 15. Assigned to resort renovation project.", resumeName: "Miguel_Garcia_Resume.pdf" },
  { id: 9, name: "Anna Villanueva", role: "Chef de Partie (Hot)", stage: "Final Interview", rating: 4, applied: "Mar 3, 2026", email: "a.villanueva@email.com", avatar: "AV", tags: ["Mediterranean", "Sous Vide", "Banquet"], source: "Indeed", jobId: 1, recruiter: "Joela", notes: "Final interview with Executive Chef scheduled.", resumeName: "Anna_Villanueva_CV.pdf" },
  { id: 10, name: "Bryan Tan", role: "Front Office Supervisor", stage: "Applied", rating: 3, applied: "Mar 7, 2026", email: "b.tan@email.com", avatar: "BT", tags: ["Guest Relations", "Opera PMS", "Check-in/Check-out"], source: "Website", jobId: 5, recruiter: "Ranie", notes: "", resumeName: "" },
  { id: 11, name: "Christine Uy", role: "Front Office Supervisor", stage: "Screening", rating: 4, applied: "Mar 5, 2026", email: "c.uy@email.com", avatar: "CU", tags: ["Reservations", "VIP Handling", "Night Audit"], source: "LinkedIn", jobId: 5, recruiter: "Joela", notes: "", resumeName: "Christine_Uy_Resume.pdf" },
  { id: 12, name: "Roberto Navarro", role: "Plumbing Supervisor", stage: "Rejected", rating: 2, applied: "Feb 25, 2026", email: "r.navarro@email.com", avatar: "RN", tags: ["Basic Plumbing", "Residential"], source: "Indeed", jobId: 3, recruiter: "Ranie", notes: "Lacks experience in large-scale commercial/resort plumbing systems.", resumeName: "" },
  { id: 13, name: "Grace Fernandez", role: "Baker", stage: "Initial Interview", rating: 4, applied: "Mar 1, 2026", email: "g.fernandez@email.com", avatar: "GF", tags: ["Artisan Bread", "Viennoiserie", "Sourdough"], source: "Referral", jobId: 6, recruiter: "Ranie", notes: "Impressive bread portfolio.", resumeName: "Grace_Fernandez_CV.pdf" },
  { id: 14, name: "Mark Espinosa", role: "Baker", stage: "Exam", rating: 3, applied: "Mar 4, 2026", email: "m.espinosa@email.com", avatar: "ME", tags: ["Production Baking", "Pastry Basics"], source: "Website", jobId: 6, recruiter: "Joela", notes: "Scheduled for practical baking exam.", resumeName: "Mark_Espinosa_Resume.pdf" },
  { id: 15, name: "Sophia Cruz", role: "Housekeeping Team Leader", stage: "Screening", rating: 4, applied: "Mar 6, 2026", email: "s.cruz@email.com", avatar: "SC", tags: ["Room Inspection", "Team Management", "Laundry Ops"], source: "LinkedIn", jobId: 7, recruiter: "Joela", notes: "", resumeName: "Sophia_Cruz_CV.pdf" },
  { id: 16, name: "Jason Lee", role: "Housekeeping Team Leader", stage: "Applied", rating: 3, applied: "Mar 7, 2026", email: "j.lee@email.com", avatar: "JL", tags: ["Inventory", "Quality Control"], source: "Indeed", jobId: 7, recruiter: "Ranie", notes: "", resumeName: "" },
];

const INIT_POOL = [
  { id: 101, name: "Elena Pascual", role: "Commis Chef", lastStage: "Final Interview", rating: 4, applied: "Jan 15, 2026", email: "e.pascual@email.com", avatar: "EP", tags: ["Cold Kitchen", "Salad Prep", "Garde Manger"], source: "LinkedIn", jobId: 8, closedJob: "Commis Chef", pooledDate: "Feb 10, 2026", notes: "Strong candidate. Reached final round." },
  { id: 102, name: "Kevin Bautista", role: "Commis Chef", lastStage: "Screening", rating: 3, applied: "Jan 18, 2026", email: "k.bautista@email.com", avatar: "KB", tags: ["Food Prep", "Hygiene", "Breakfast Buffet"], source: "Indeed", jobId: 8, closedJob: "Commis Chef", pooledDate: "Feb 10, 2026", notes: "Basic skills but eager to learn." },
  { id: 103, name: "Diana Reyes", role: "Commis Chef", lastStage: "Job Offer", rating: 5, applied: "Jan 12, 2026", email: "d.reyes@email.com", avatar: "DR", tags: ["Pastry", "Plating", "A la Carte", "Banquet"], source: "Referral", jobId: 8, closedJob: "Commis Chef", pooledDate: "Feb 10, 2026", notes: "Excellent candidate. Offer declined due to relocation." },
  { id: 104, name: "Andrei Soriano", role: "Commis Chef", lastStage: "Applied", rating: 3, applied: "Jan 20, 2026", email: "a.soriano@email.com", avatar: "AS", tags: ["Line Cook", "Filipino Cuisine"], source: "Website", jobId: 8, closedJob: "Commis Chef", pooledDate: "Feb 10, 2026", notes: "Good local cuisine knowledge." },
  { id: 105, name: "Lorna Villanueva", role: "Spa Therapist", lastStage: "Departmental Interview", rating: 5, applied: "Dec 3, 2025", email: "l.villanueva@email.com", avatar: "LV", tags: ["Swedish Massage", "Hilot", "Aromatherapy"], source: "Indeed", jobId: 9, closedJob: "Spa Therapist", pooledDate: "Jan 20, 2026", notes: "Top candidate. Position frozen — highly recommended." },
  { id: 106, name: "Ryan Magno", role: "Spa Therapist", lastStage: "Applied", rating: 3, applied: "Dec 8, 2025", email: "r.magno@email.com", avatar: "RM", tags: ["Sports Massage", "Hot Stone"], source: "Website", jobId: 9, closedJob: "Spa Therapist", pooledDate: "Jan 20, 2026", notes: "Limited resort spa experience but certified." },
];

const INIT_JOBS = [
  { id: 1, title: "Chef de Partie (Hot)", dept: "Kitchen", location: "Bluewater Maribago", type: "Full-time", status: "Active", posted: "Feb 15, 2026", description: "Oversee the hot kitchen section including grill, sauces, and main course preparation for our resort restaurant and banquet operations." },
  { id: 2, title: "Demi Baker", dept: "Pastry & Bakery", location: "Bluewater Maribago", type: "Full-time", status: "Active", posted: "Feb 20, 2026", description: "Assist the Head Baker in daily pastry and bread production for the resort." },
  { id: 3, title: "Plumbing Supervisor", dept: "Engineering", location: "Bluewater Sumilon", type: "Full-time", status: "Active", posted: "Feb 18, 2026", description: "Lead the plumbing maintenance team to ensure all resort water systems and pools are in top condition." },
  { id: 4, title: "Carpenter", dept: "Engineering", location: "Bluewater Panglao", type: "Full-time", status: "Active", posted: "Feb 22, 2026", description: "Handle furniture repair, custom woodwork, and resort fixture installation." },
  { id: 5, title: "Front Office Supervisor", dept: "Front Office", location: "Almont Beach Resort", type: "Full-time", status: "Active", posted: "Mar 1, 2026", description: "Supervise the front desk team, manage guest check-in/check-out, and handle VIP arrivals." },
  { id: 6, title: "Baker", dept: "Pastry & Bakery", location: "Bluewater Panglao", type: "Full-time", status: "Active", posted: "Feb 25, 2026", description: "Produce artisan breads, rolls, and baked goods daily for the resort." },
  { id: 7, title: "Housekeeping Team Leader", dept: "Housekeeping", location: "Almont City Hotel", type: "Full-time", status: "Active", posted: "Mar 3, 2026", description: "Lead a team of room attendants and public area cleaners." },
  { id: 8, title: "Commis Chef", dept: "Kitchen", location: "Bluewater Maribago", type: "Full-time", status: "Closed", posted: "Jan 10, 2026", closed: "Feb 10, 2026", description: "Entry-level kitchen position assisting senior chefs." },
  { id: 9, title: "Spa Therapist", dept: "Spa & Wellness", location: "Amuma Spa", type: "Full-time", status: "Closed", posted: "Nov 15, 2025", closed: "Jan 20, 2026", description: "Provide massage and body treatments. Position paused due to spa renovation." },
];

const I = {
  Dash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  People: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Bag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  Pipe: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Pool: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Star: ({f}) => <svg width="14" height="14" viewBox="0 0 24 24" fill={f?"#F59E0B":"none"} stroke={f?"#F59E0B":"#CBD5E1"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Loc: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Up: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Chev: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Redo: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  Endorse: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Person: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Note: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Tag: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Cal: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};

const Badge = ({stage}) => { const c = STAGE_COLORS[stage]||STAGE_COLORS["Applied"]; return <span style={{background:c.bg,color:c.text,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}><span style={{width:6,height:6,borderRadius:"50%",background:c.dot}}/>{stage}</span>; };
const Stars = ({v}) => <span style={{display:"inline-flex",gap:1}}>{[1,2,3,4,5].map(i=><I.Star key={i} f={i<=v}/>)}</span>;

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [candidates, setCandidates] = useState(INIT_CANDIDATES);
  const [pool, setPool] = useState(INIT_POOL);
  const [jobs, setJobs] = useState(INIT_JOBS);
  const [search, setSearch] = useState("");
  const [fStage, setFStage] = useState("All");
  const [fRole, setFRole] = useState("All");
  const [selC, setSelC] = useState(null);
  const [selPool, setSelPool] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [anim, setAnim] = useState(false);
  const [repJob, setRepJob] = useState("all");
  const [repMonth, setRepMonth] = useState("all");
  const [pFilter, setPFilter] = useState("all");
  const [pSearch, setPSearch] = useState("");
  const [pStage, setPStage] = useState("All");
  const [fillTags, setFillTags] = useState({});
  const [mob, setMob] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(()=>{
    setAnim(true);
    const check=()=>setMob(window.innerWidth<768);
    check();
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  const daysBetween=(d1,d2)=>{const a=new Date(d1);const b=d2?new Date(d2):new Date("Mar 8, 2026");return Math.max(0,Math.round((b-a)/(1000*60*60*24)));};
  const toggleFillTag=(jobId,tag)=>setFillTags(p=>{const cur=p[jobId];return{...p,[jobId]:cur===tag?null:tag};});

  const filtered = candidates.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    const mst = fStage==="All"||c.stage===fStage;
    const mr = fRole==="All"||c.role===fRole;
    return ms&&mst&&mr;
  });
  const roles = [...new Set(candidates.map(c=>c.role))];
  const stageCount = s => candidates.filter(c=>c.stage===s).length;
  const activeJobs = jobs.filter(j=>j.status==="Active");

  const moveStage = (id,ns) => { setCandidates(p=>p.map(c=>c.id===id?{...c,stage:ns}:c)); if(selC?.id===id) setSelC(p=>({...p,stage:ns})); };
  const updateCandidate = (id,upd) => { setCandidates(p=>p.map(c=>c.id===id?{...c,...upd}:c)); if(selC?.id===id) setSelC(p=>({...p,...upd})); };
  const endorseCandidate = (c,jid) => { const j=jobs.find(x=>x.id===jid); if(!j)return; setCandidates(p=>[{id:Date.now(),name:c.name,email:c.email,role:j.title,stage:"Screening",rating:c.rating,applied:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),avatar:c.avatar,tags:[...c.tags],source:"Endorsed",jobId:jid,recruiter:c.recruiter||"",notes:"",resumeName:"",endorsedFrom:c.role},...p]); setSelC(null); };
  const reactivate = (pc,jid) => { const j=jobs.find(x=>x.id===jid); if(!j)return; setCandidates(p=>[{id:Date.now(),name:pc.name,email:pc.email,role:j.title,stage:"Screening",rating:pc.rating,applied:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),avatar:pc.avatar,tags:[...pc.tags],source:"Talent Pool",jobId:jid,recruiter:"",notes:"",resumeName:""},...p]); setPool(p=>p.filter(x=>x.id!==pc.id)); setSelPool(null); };

  const goPage=(p)=>{setPage(p);setMenuOpen(false);};
  const px=mob?16:32;
  const S = {
    app:{display:"flex",height:"100vh",fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",background:"#F7FAFC",color:"#1a2332",overflow:"hidden"},
    main:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},
    top:{background:"#fff",borderBottom:"1px solid #E2EAF1",padding:mob?"10px 16px":"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12},
    sb:{display:"flex",alignItems:"center",gap:8,background:"#F1F7FB",border:"1.5px solid #D9E8F2",borderRadius:10,padding:"9px 14px",flex:1,maxWidth:mob?undefined:300},
    si:{border:"none",outline:"none",background:"transparent",fontSize:14,color:"#1a2332",width:"100%",fontFamily:"inherit"},
    cnt:{flex:1,overflow:"auto",padding:mob?"16px":"24px 32px"},
    btn:(v="primary",sz="md")=>({background:v==="primary"?"#1F75B9":v==="outline"?"transparent":v==="danger"?"#EF5350":"#EDF5FC",color:v==="primary"||v==="danger"?"#fff":"#1F75B9",border:v==="outline"?"1.5px solid #B6D6EB":"none",borderRadius:10,padding:sz==="sm"?"5px 12px":sz==="xs"?"4px 8px":"9px 18px",fontSize:sz==="sm"?12:sz==="xs"?11:13.5,fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,transition:"all .2s",fontFamily:"inherit",boxShadow:v==="primary"?"0 2px 8px rgba(31,117,185,.2)":"none",whiteSpace:"nowrap"}),
    card:{background:"#fff",borderRadius:14,border:"1px solid #E2EAF1",padding:mob?"16px":"22px",boxShadow:"0 1px 4px rgba(31,117,185,.04)"},
    sCard:a=>({background:"#fff",borderRadius:14,border:"1px solid #E2EAF1",padding:mob?"16px":"22px",boxShadow:"0 1px 4px rgba(31,117,185,.04)",borderTop:`3px solid ${a}`}),
    tag:{background:"#EDF5FC",color:"#1F75B9",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:600},
    modal:{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",background:"rgba(15,30,50,.45)",backdropFilter:"blur(4px)"},
    mBox:{width:mob?"100%":560,maxHeight:mob?"95vh":"92vh",background:"#fff",borderRadius:mob?"18px 18px 0 0":18,overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.15)"},
    av:s=>({width:s,height:s,borderRadius:"50%",background:"linear-gradient(135deg,#B6D6EB,#1F75B9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:s*.35,flexShrink:0}),
    fs:{width:"100%",padding:"9px 14px",borderRadius:10,border:"1.5px solid #D9E8F2",fontSize:13.5,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border .2s"},
    ta:{width:"100%",padding:"9px 14px",borderRadius:10,border:"1.5px solid #D9E8F2",fontSize:13.5,fontFamily:"inherit",outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:70},
    lb:{fontSize:12,fontWeight:600,color:"#64748b",display:"block",marginBottom:5},
    grid:(cols)=>({display:"grid",gridTemplateColumns:mob?"1fr":`repeat(${cols},1fr)`,gap:mob?12:18}),
  };

  /* ══════ SIDEBAR ══════ */
  const navItems=[
    {id:"dashboard",label:"Dashboard",icon:<I.Dash/>},
    {id:"candidates",label:"Candidates",icon:<I.People/>},
    {id:"pipeline",label:"Pipeline",icon:<I.Pipe/>},
    {id:"jobs",label:"Jobs",icon:<I.Bag/>},
    {id:"reports",label:"Reports",icon:<I.Chart/>},
    {id:"pool",label:"Talent Pool",icon:<I.Pool/>},
  ];
  const SideContent=()=>(
    <>
      <div style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #E2EAF1"}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1F75B9,#B6D6EB)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0}}>BW</div>
        <div style={{display:"flex",flexDirection:"column",lineHeight:1.2}}><span style={{fontWeight:800,fontSize:15,color:"#0f1d2e",whiteSpace:"nowrap"}}>Bluewater Resorts</span><span style={{fontSize:10.5,color:"#7c8da5",fontWeight:500}}>Jobs Portal</span></div>
        {mob&&<button onClick={()=>setMenuOpen(false)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#94a3b8",display:"flex"}}><I.X/></button>}
      </div>
      <nav style={{padding:"10px 0",flex:1}}>
        {navItems.map(n=>(
          <div key={n.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 22px",margin:"2px 10px",borderRadius:10,cursor:"pointer",fontWeight:page===n.id?600:500,fontSize:13.5,background:page===n.id?"#EDF5FC":"transparent",color:page===n.id?"#1F75B9":"#64748b"}} onClick={()=>goPage(n.id)}>
            {n.icon}<span>{n.label}</span>
          </div>
        ))}
      </nav>
      <div style={{padding:"14px 20px",borderTop:"1px solid #E2EAF1",display:"flex",alignItems:"center",gap:10}}>
        <div style={S.av(32)}>AD</div><div><div style={{fontWeight:600,fontSize:12.5}}>Admin</div><div style={{fontSize:10.5,color:"#94a3b8"}}>HR Manager</div></div>
      </div>
    </>
  );

  /* ══════ DASHBOARD ══════ */
  const DashPage=()=>{
    const ps=STAGES.filter(s=>s!=="Rejected");
    const stats=[{l:"Total Candidates",v:candidates.length,a:"#1F75B9",c:"+12%"},{l:"Active Jobs",v:activeJobs.length,a:"#43A047",c:"+2"},{l:"In Interviews",v:candidates.filter(c=>["Initial Interview","Departmental Interview","Final Interview"].includes(c.stage)).length,a:"#FB8C00",c:"+5"},{l:"Talent Pool",v:pool.length,a:"#8E24AA",c:`${pool.filter(p=>p.rating>=4).length} top`}];
    return(
      <div style={{opacity:anim?1:0,transition:"opacity .4s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div><h1 style={{fontSize:mob?20:24,fontWeight:700,margin:0}}>Dashboard</h1><p style={{color:"#7c8da5",margin:"4px 0 0",fontSize:13}}>Your hiring overview</p></div>
          <button style={S.btn()} onClick={()=>setShowAdd(true)}><I.Plus/>{mob?"Add":"Add Candidate"}</button>
        </div>
        <div style={S.grid(mob?2:4)}>{stats.map((s,i)=><div key={i} style={S.sCard(s.a)}><p style={{fontSize:12,color:"#7c8da5",margin:0}}>{s.l}</p><div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:5}}><span style={{fontSize:mob?22:30,fontWeight:700}}>{s.v}</span><span style={{fontSize:11,fontWeight:600,color:"#16a34a",display:"flex",alignItems:"center",gap:2}}><I.Up/>{s.c}</span></div></div>)}</div>
        <div style={{...S.grid(mob?1:2),marginTop:18}}>
          <div style={S.card}><h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:700}}>Hiring Pipeline</h3>
            <div style={{display:"flex",gap:4,alignItems:"flex-end",height:mob?120:180,overflowX:"auto"}}>
              {ps.map(s=>{const c=stageCount(s);const mx=Math.max(...ps.map(x=>stageCount(x)),1);const h=Math.max((c/mx)*(mob?100:150),6);return(
                <div key={s} style={{flex:1,minWidth:mob?30:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:mob?12:15,fontWeight:700,color:STAGE_COLORS[s].text}}>{c}</span>
                  <div style={{width:"100%",height:h,borderRadius:"6px 6px 3px 3px",background:`linear-gradient(180deg,${STAGE_COLORS[s].dot},${STAGE_COLORS[s].bg})`,transition:"height .6s"}}/>
                  <span style={{fontSize:mob?7:9,fontWeight:600,color:"#7c8da5",textAlign:"center",lineHeight:1.1}}>{s.replace("Interview","Int.").replace("Departmental","Dept.")}</span>
                </div>);})}
            </div>
          </div>
          <div style={S.card}><h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:700}}>Recent Activity</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[{t:"Anna Villanueva moved to Final Interview for Chef de Partie",tm:"2h ago",c:"#7E57C2"},{t:"New application from Jason Lee for Housekeeping TL",tm:"5h ago",c:"#1F75B9"},{t:"Jun Reyes received a Job Offer — Plumbing Supervisor",tm:"1d ago",c:"#8E24AA"},{t:"Miguel Garcia was hired as Carpenter",tm:"2d ago",c:"#00897B"}].map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{width:7,height:7,borderRadius:"50%",background:a.c,marginTop:6,flexShrink:0}}/><div><p style={{margin:0,fontSize:12,fontWeight:500,lineHeight:1.5}}>{a.t}</p><p style={{margin:"2px 0 0",fontSize:11,color:"#94a3b8"}}>{a.tm}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </div>);
  };

  /* ══════ CANDIDATE CARD (mobile) ══════ */
  const CandCard=({c})=>(
    <div style={{...S.card,cursor:"pointer",transition:"all .2s"}} onClick={()=>setSelC(c)}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={S.av(36)}>{c.avatar}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div><div style={{fontSize:12,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.role}</div></div>
        <Stars v={c.rating}/>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <Badge stage={c.stage}/>
        {c.recruiter&&<span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,color:"#1F75B9",fontWeight:500}}><I.Person/>{c.recruiter}</span>}
        <span style={S.tag}>{c.source}</span>
      </div>
    </div>
  );

  /* ══════ CANDIDATES ══════ */
  const CandPage=()=>(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:mob?20:24,fontWeight:700,margin:0}}>Candidates</h1><p style={{color:"#7c8da5",margin:"4px 0 0",fontSize:13}}>{filtered.length} found</p></div>
        <button style={S.btn()} onClick={()=>setShowAdd(true)}><I.Plus/>{mob?"Add":"Add Candidate"}</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={S.sb}><I.Search/><input style={S.si} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <select value={fStage} onChange={e=>setFStage(e.target.value)} style={{...S.btn("outline"),appearance:"none",paddingRight:24,cursor:"pointer",fontSize:12}}><option value="All">All Stages</option>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
        {!mob&&<select value={fRole} onChange={e=>setFRole(e.target.value)} style={{...S.btn("outline"),appearance:"none",paddingRight:24,cursor:"pointer",fontSize:12}}><option value="All">All Roles</option>{roles.map(r=><option key={r}>{r}</option>)}</select>}
      </div>
      {mob?<div style={{display:"flex",flexDirection:"column",gap:10}}>{filtered.map(c=><CandCard key={c.id} c={c}/>)}</div>:
      <div style={{...S.card,padding:0,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
          <thead><tr style={{background:"#F5F9FC",borderBottom:"1.5px solid #E2EAF1"}}>{["Candidate","Role","Stage","Recruiter","Rating","Source",""].map((h,i)=><th key={i} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#7c8da5",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(c=>(
            <tr key={c.id} style={{borderBottom:"1px solid #F0F4F8",cursor:"pointer"}} onClick={()=>setSelC(c)}>
              <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={S.av(36)}>{c.avatar}</div><div><div style={{fontWeight:600,fontSize:13.5}}>{c.name}</div><div style={{fontSize:11.5,color:"#94a3b8"}}>{c.email}</div></div></div></td>
              <td style={{padding:"12px 16px",fontSize:12.5}}>{c.role}</td>
              <td style={{padding:"12px 16px"}}><Badge stage={c.stage}/></td>
              <td style={{padding:"12px 16px"}}>{c.recruiter?<span style={{fontSize:12.5,color:"#1F75B9"}}><I.Person/> {c.recruiter}</span>:"—"}</td>
              <td style={{padding:"12px 16px"}}><Stars v={c.rating}/></td>
              <td style={{padding:"12px 16px"}}><span style={S.tag}>{c.source}</span></td>
              <td style={{padding:"12px 16px"}}><button style={{...S.btn("ghost","sm"),background:"transparent"}} onClick={e=>{e.stopPropagation();setSelC(c);}}>View</button></td>
            </tr>))}</tbody>
        </table>
      </div>}
      {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}><p>No candidates found</p></div>}
    </div>
  );

  /* ══════ PIPELINE ══════ */
  const PipePage=()=>{
    const ps=STAGES.filter(s=>s!=="Rejected");
    return(<div>
      <div style={{marginBottom:16}}><h1 style={{fontSize:mob?20:24,fontWeight:700,margin:0}}>Pipeline</h1></div>
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:16}}>
        {ps.map(stage=>{const items=candidates.filter(c=>c.stage===stage);const sc=STAGE_COLORS[stage];return(
          <div key={stage} style={{minWidth:mob?200:210,flex:mob?undefined:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><span style={{width:9,height:9,borderRadius:"50%",background:sc.dot}}/><span style={{fontSize:13,fontWeight:700}}>{stage.replace("Interview","Int.").replace("Departmental","Dept.")}</span><span style={{background:sc.bg,color:sc.text,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{items.length}</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {items.map(c=>(<div key={c.id} style={{...S.card,padding:14,cursor:"pointer",borderLeft:`3px solid ${sc.dot}`}} onClick={()=>setSelC(c)}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={S.av(28)}>{c.avatar}</div><div><div style={{fontWeight:600,fontSize:12.5}}>{c.name}</div><div style={{fontSize:10.5,color:"#94a3b8"}}>{c.recruiter||c.role}</div></div></div>
                <Stars v={c.rating}/>
              </div>))}
              {items.length===0&&<div style={{padding:20,textAlign:"center",color:"#b8c8d8",fontSize:12,border:"2px dashed #DDE8F0",borderRadius:10}}>Empty</div>}
            </div>
          </div>);})}
      </div>
    </div>);
  };

  /* ══════ JOBS ══════ */
  const JobsPage=()=>(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:mob?20:24,fontWeight:700,margin:0}}>Job Openings</h1><p style={{color:"#7c8da5",margin:"4px 0 0",fontSize:13}}>{jobs.length} positions</p></div>
        <button style={S.btn()} onClick={()=>{setEditJob(null);setShowJobModal(true);}}><I.Plus/>{mob?"New":"Post New Job"}</button>
      </div>
      <div style={S.grid(mob?1:2)}>
        {jobs.map(j=>{const jc=candidates.filter(c=>c.jobId===j.id);return(
          <div key={j.id} style={{...S.card,cursor:"pointer",position:"relative",overflow:"hidden"}} onClick={()=>{setEditJob(j);setShowJobModal(true);}}>
            {j.status==="Closed"&&<div style={{position:"absolute",top:0,right:0,background:"#FFEBEE",color:"#C62828",padding:"3px 12px",fontSize:10,fontWeight:700,borderRadius:"0 0 0 10px"}}>Closed</div>}
            <h3 style={{margin:0,fontSize:15,fontWeight:700}}>{j.title}</h3>
            <p style={{margin:"4px 0 0",fontSize:12,color:"#7c8da5"}}>{j.dept} · {j.type}</p>
            <div style={{display:"flex",alignItems:"center",gap:5,margin:"8px 0 12px",fontSize:12,color:"#64748b"}}><I.Loc/>{j.location}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #F0F4F8",paddingTop:10}}>
              <span style={{fontSize:12}}><strong style={{color:"#1F75B9"}}>{jc.length}</strong> <span style={{color:"#94a3b8"}}>applicants</span></span>
              <span style={{fontSize:11,color:"#94a3b8"}}>{j.posted}</span>
            </div>
          </div>);})}
      </div>
    </div>
  );

  /* ══════ REPORTS ══════ */
  const RepPage=()=>{
    const months=["Jan 2026","Feb 2026","Mar 2026"];
    const jobsToReport=repJob==="all"?jobs:jobs.filter(j=>j.id===Number(repJob));
    const getStats=(job,month)=>{
      let all=[...candidates.filter(c=>c.jobId===job.id),...pool.filter(p=>p.jobId===job.id)];
      if(month!=="all") all=all.filter(c=>{const d=c.applied||c.pooledDate||"";return d.includes(month.split(" ")[0]);});
      const sc={};STAGES.forEach(s=>{sc[s]=all.filter(c=>(c.stage||c.lastStage)===s).length;});
      const t=all.length;const hr=t>0?((sc["Hired"]/t)*100).toFixed(0):0;const pr=t>0?(((t-sc["Rejected"])/t)*100).toFixed(0):0;
      const daysOpen=daysBetween(job.posted,job.status==="Closed"?job.closed:null);
      const daysClosed=job.status==="Closed"&&job.closed?daysBetween(job.closed,"Mar 8, 2026"):null;
      return{sc,total:t,hr,pr,all,daysOpen,daysClosed};
    };
    const overAll=()=>{let ta=0,th=0,tr=0;jobs.forEach(j=>{const s=getStats(j,repMonth);ta+=s.total;th+=s.sc["Hired"];tr+=s.sc["Rejected"];});return{ta,th,tr,hr:ta>0?((th/ta)*100).toFixed(0):0};};
    const ov=overAll();
    const Donut=({v,label,color,size=mob?70:85})=>{const p=Math.min(Math.max(Number(v),0),100);const r=(size-12)/2;const ci=2*Math.PI*r;const o=ci-(p/100)*ci;return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDF0F4" strokeWidth="7"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={ci} strokeDashoffset={o} strokeLinecap="round"/></svg><span style={{fontSize:mob?14:18,fontWeight:800,marginTop:-size/2-8,position:"relative"}}>{p}%</span><span style={{fontSize:10,fontWeight:600,color:"#7c8da5",marginTop:size/2-24,position:"relative"}}>{label}</span></div>);};
    const exportExcel=()=>{
      let csv="Job Title,Department,Location,Status,Posted,Days Open,Fill Difficulty,Total Applicants,"+STAGES.join(",")+",Hire Rate %,Pass Rate %\n";
      jobsToReport.forEach(job=>{const s=getStats(job,repMonth);csv+=`"${job.title}","${job.dept}","${job.location}","${job.status}","${job.posted}",${s.daysOpen},"${fillTags[job.id]||"—"}",${s.total},`+STAGES.map(st=>s.sc[st]).join(",")+`,${s.hr},${s.pr}\n`;});
      csv+="\n\nCandidate Details\nName,Email,Role,Stage,Rating,Applied,Recruiter,Source\n";
      jobsToReport.forEach(job=>{[...candidates.filter(c=>c.jobId===job.id),...pool.filter(p=>p.jobId===job.id)].forEach(c=>{csv+=`"${c.name}","${c.email}","${c.role||c.closedJob||""}","${c.stage||c.lastStage}",${c.rating},"${c.applied||c.pooledDate}","${c.recruiter||""}","${c.source}"\n`;});});
      const blob=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Bluewater_Report_${repMonth==="all"?"All":repMonth.replace(" ","_")}.csv`;a.click();
    };
    const ftC={"Hard to Fill":{bg:"#FFEBEE",t:"#C62828",b:"#EF9A9A"},"Easy to Fill":{bg:"#E8F5E9",t:"#2E7D32",b:"#A5D6A7"}};
    return(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:mob?20:24,fontWeight:700,margin:0}}>Reports</h1><p style={{color:"#7c8da5",margin:"4px 0 0",fontSize:13}}>Analytics per job & month</p></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select value={repMonth} onChange={e=>setRepMonth(e.target.value)} style={{...S.btn("outline","sm"),appearance:"none",paddingRight:24,cursor:"pointer"}}><option value="all">All Months</option>{months.map(m=><option key={m} value={m}>{m}</option>)}</select>
          <select value={repJob} onChange={e=>setRepJob(e.target.value)} style={{...S.btn("outline","sm"),appearance:"none",paddingRight:24,cursor:"pointer"}}><option value="all">All Jobs</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}</select>
          <button style={S.btn("primary","sm")} onClick={exportExcel}><I.Download/>{mob?"CSV":"Export"}</button>
        </div>
      </div>
      {repJob==="all"&&<div style={{...S.grid(mob?2:4),marginBottom:18}}>
        {[{l:"Applicants",v:ov.ta,a:"#1F75B9"},{l:"Hired",v:ov.th,a:"#00897B"},{l:"Rejected",v:ov.tr,a:"#EF5350"},{l:"Hire Rate",v:ov.hr+"%",a:"#8E24AA"}].map((s,i)=><div key={i} style={S.sCard(s.a)}><p style={{fontSize:11,color:"#7c8da5",margin:0}}>{s.l}</p><span style={{fontSize:mob?22:28,fontWeight:700,marginTop:4,display:"block"}}>{s.v}</span></div>)}
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        {jobsToReport.map(job=>{const s=getStats(job,repMonth);const mx=Math.max(...STAGES.map(st=>s.sc[st]),1);const ft=fillTags[job.id];return(
          <div key={job.id} style={{...S.card,padding:0,overflow:"hidden"}}>
            <div style={{padding:mob?"14px 16px":"16px 24px",borderBottom:"1px solid #EDF0F4",background:"#FAFCFE"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                <div style={{flex:1,minWidth:150}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <h3 style={{margin:0,fontSize:mob?14:16,fontWeight:700}}>{job.title}</h3>
                    <span style={{background:job.status==="Active"?"#E8F5E9":"#FFEBEE",color:job.status==="Active"?"#2E7D32":"#C62828",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>{job.status}</span>
                    {ft&&<span style={{background:ftC[ft].bg,color:ftC[ft].t,border:`1px solid ${ftC[ft].b}`,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:600}}>{ft}</span>}
                  </div>
                  <p style={{margin:"3px 0 0",fontSize:12,color:"#7c8da5"}}>{job.dept} · {job.location}</p>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {["Hard to Fill","Easy to Fill"].map(tag=><button key={tag} onClick={()=>toggleFillTag(job.id,tag)} style={{padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:600,cursor:"pointer",border:`1.5px solid ${ft===tag?ftC[tag].b:"#D9E8F2"}`,background:ft===tag?ftC[tag].bg:"#fff",color:ft===tag?ftC[tag].t:"#7c8da5"}}>{ft===tag?"✓ ":""}{tag}</button>)}
                </div>
              </div>
            </div>
            <div style={{padding:mob?"10px 16px":"8px 24px",background:"#F5F9FC",borderBottom:"1px solid #EDF0F4",display:"flex",gap:mob?12:24,flexWrap:"wrap",fontSize:12,color:"#64748b"}}>
              <span>Posted: <strong style={{color:"#0f1d2e"}}>{job.posted}</strong></span>
              <span>{job.status==="Active"?"Open":"Time to Fill"}: <strong style={{color:s.daysOpen>60?"#C62828":s.daysOpen>30?"#E65100":"#2E7D32"}}>{s.daysOpen}d</strong></span>
              {job.status==="Closed"&&<span>Closed: <strong>{job.closed}</strong></span>}
              {s.daysClosed!==null&&<span>Since closed: <strong style={{color:"#7c8da5"}}>{s.daysClosed}d</strong></span>}
              <span style={{marginLeft:"auto",fontWeight:700,color:"#1F75B9",fontSize:14}}>{s.total} applicants</span>
            </div>
            <div style={{padding:mob?"16px":"20px 24px",display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?16:24}}>
              <div><h4 style={{margin:"0 0 12px",fontSize:13,fontWeight:700}}>Stage Breakdown</h4>
                <div style={{display:"flex",gap:3,alignItems:"flex-end",height:mob?100:130,overflowX:"auto"}}>
                  {STAGES.map(st=>{const val=s.sc[st];const h=Math.max((val/mx)*(mob?80:110),3);return(<div key={st} style={{flex:1,minWidth:mob?22:0,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:mob?10:12,fontWeight:700,color:STAGE_COLORS[st].text}}>{val}</span><div style={{width:"100%",height:h,borderRadius:"5px 5px 2px 2px",background:`linear-gradient(180deg,${STAGE_COLORS[st].dot},${STAGE_COLORS[st].bg})`}}/><span style={{fontSize:mob?6:8,fontWeight:600,color:"#7c8da5",textAlign:"center",lineHeight:1.1}}>{st.replace("Interview","Int.").replace("Departmental","D.")}</span></div>);})}
                </div>
              </div>
              <div><h4 style={{margin:"0 0 12px",fontSize:13,fontWeight:700}}>Rates</h4>
                <div style={{display:"flex",justifyContent:"center",gap:mob?20:28,marginBottom:14}}><Donut v={s.hr} label="Hire" color="#00897B"/><Donut v={s.pr} label="Pass" color="#1F75B9"/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {STAGES.map(st=><div key={st} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 8px",background:"#F7FAFC",borderRadius:6}}><span style={{width:6,height:6,borderRadius:"50%",background:STAGE_COLORS[st].dot}}/><span style={{fontSize:10,color:"#64748b",flex:1}}>{st.length>12?st.slice(0,10)+"…":st}</span><span style={{fontSize:12,fontWeight:700}}>{s.sc[st]}</span></div>)}
                </div>
              </div>
            </div>
          </div>);})}
      </div>
    </div>);
  };

  /* ══════ TALENT POOL ══════ */
  const PoolPage=()=>{
    const cj=jobs.filter(j=>j.status==="Closed");const cjt=[...new Set(pool.map(p=>p.closedJob))];
    const fp=pool.filter(p=>{const ms=p.name.toLowerCase().includes(pSearch.toLowerCase())||p.tags.some(t=>t.toLowerCase().includes(pSearch.toLowerCase()));const mj=pFilter==="all"||p.closedJob===pFilter;const mst=pStage==="All"||p.lastStage===pStage;return ms&&mj&&mst;});
    return(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:mob?20:24,fontWeight:700,margin:0}}>Talent Pool</h1><p style={{color:"#7c8da5",margin:"4px 0 0",fontSize:13}}>{pool.length} pooled candidates</p></div>
      </div>
      <div style={{...S.grid(mob?1:cj.length),marginBottom:16}}>
        {cj.map(j=>{const cnt=pool.filter(p=>p.jobId===j.id).length;return(
          <div key={j.id} style={{...S.card,borderLeft:"4px solid #8E24AA",cursor:"pointer"}} onClick={()=>setPFilter(pFilter===j.title?"all":j.title)}>
            <h4 style={{margin:0,fontSize:14,fontWeight:700}}>{j.title}</h4>
            <p style={{margin:"3px 0 0",fontSize:11,color:"#94a3b8"}}>Closed {j.closed}</p>
            <span style={{fontSize:20,fontWeight:800,color:"#1F75B9",marginTop:8,display:"block"}}>{cnt}</span>
          </div>);})}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <div style={S.sb}><I.Search/><input style={S.si} placeholder="Search..." value={pSearch} onChange={e=>setPSearch(e.target.value)}/></div>
        <select value={pFilter} onChange={e=>setPFilter(e.target.value)} style={{...S.btn("outline","sm"),appearance:"none",paddingRight:24,cursor:"pointer"}}><option value="all">All</option>{cjt.map(t=><option key={t}>{t}</option>)}</select>
      </div>
      {mob?<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {fp.map(c=><div key={c.id} style={{...S.card,cursor:"pointer"}} onClick={()=>setSelPool(c)}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{...S.av(36),background:"linear-gradient(135deg,#D4B6EB,#8E24AA)"}}>{c.avatar}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{c.name}</div><div style={{fontSize:12,color:"#94a3b8"}}>{c.closedJob}</div></div>
            <Stars v={c.rating}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><Badge stage={c.lastStage}/>{c.tags.slice(0,2).map(t=><span key={t} style={{...S.tag,fontSize:10,padding:"2px 7px"}}>{t}</span>)}</div>
        </div>)}
      </div>:
      <div style={{...S.card,padding:0,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
          <thead><tr style={{background:"#F5F9FC",borderBottom:"1.5px solid #E2EAF1"}}>{["Candidate","Position","Stage","Rating","Pooled",""].map((h,i)=><th key={i} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#7c8da5",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
          <tbody>{fp.map(c=>(
            <tr key={c.id} style={{borderBottom:"1px solid #F0F4F8",cursor:"pointer"}} onClick={()=>setSelPool(c)}>
              <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{...S.av(36),background:"linear-gradient(135deg,#D4B6EB,#8E24AA)"}}>{c.avatar}</div><div><div style={{fontWeight:600,fontSize:13.5}}>{c.name}</div><div style={{fontSize:11.5,color:"#94a3b8"}}>{c.email}</div></div></div></td>
              <td style={{padding:"12px 16px",fontSize:12.5}}>{c.closedJob}</td>
              <td style={{padding:"12px 16px"}}><Badge stage={c.lastStage}/></td>
              <td style={{padding:"12px 16px"}}><Stars v={c.rating}/></td>
              <td style={{padding:"12px 16px",fontSize:12.5,color:"#64748b"}}>{c.pooledDate}</td>
              <td style={{padding:"12px 16px"}}><button style={{...S.btn("outline","sm"),borderColor:"#8E24AA",color:"#8E24AA"}} onClick={e=>{e.stopPropagation();setSelPool(c);}}><I.Redo/></button></td>
            </tr>))}</tbody>
        </table>
      </div>}
    </div>);
  };

  /* ══════ CANDIDATE DRAWER ══════ */
  const CDrawer=()=>{
    const [ej,setEJ]=useState("");const [showE,setShowE]=useState(false);const [eNotes,setEN]=useState(false);const [nd,setND]=useState("");const [ns,setNS]=useState("");const [si,setSI]=useState(false);
    if(!selC)return null;
    const c=candidates.find(x=>x.id===selC.id)||selC;
    const next=STAGES.filter(s=>s!==c.stage&&s!=="Rejected");
    const other=activeJobs.filter(j=>j.id!==c.jobId);
    const close=()=>{setSelC(null);setShowE(false);setEJ("");setEN(false);setSI(false);};
    const addSkill=()=>{if(!ns.trim())return;updateCandidate(c.id,{tags:[...c.tags,ns.trim()]});setNS("");};
    const rmSkill=(t)=>updateCandidate(c.id,{tags:c.tags.filter(x=>x!==t)});
    const saveN=()=>{updateCandidate(c.id,{notes:nd});setEN(false);};
    const hRes=(e)=>{const f=e.target.files[0];if(f)updateCandidate(c.id,{resumeName:f.name});};
    return(
      <div style={S.modal} onClick={close}>
        <div style={S.mBox} onClick={e=>e.stopPropagation()}>
          <div style={{background:"linear-gradient(135deg,#1F75B9,#3498DB,#B6D6EB)",padding:mob?"20px 18px":"28px 26px",color:"#fff",position:"relative"}}>
            <button onClick={close} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,.2)",border:"none",borderRadius:8,padding:5,cursor:"pointer",color:"#fff",display:"flex"}}><I.X/></button>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{...S.av(mob?46:56),background:"rgba(255,255,255,.25)",fontSize:mob?16:20}}>{c.avatar}</div>
              <div><h2 style={{margin:0,fontSize:mob?17:20,fontWeight:700}}>{c.name}</h2><p style={{margin:"3px 0",fontSize:13,opacity:.9}}>{c.role}</p><div style={{fontSize:12,opacity:.85}}>{c.email}</div></div>
            </div>
          </div>
          <div style={{padding:mob?"16px 18px":"20px 26px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><span style={{fontSize:11,color:"#7c8da5"}}>Stage</span><div style={{marginTop:4}}><Badge stage={c.stage}/></div></div>
              <div style={{textAlign:"right"}}><span style={{fontSize:11,color:"#7c8da5"}}>Rating</span><div style={{marginTop:4}}><Stars v={c.rating}/></div></div>
            </div>
            <div style={{background:"#F5F9FC",borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"1fr 1fr 1fr",gap:12}}>
                <div><span style={{fontSize:10,color:"#7c8da5",fontWeight:600,textTransform:"uppercase"}}>Applied</span><p style={{margin:"3px 0 0",fontSize:13,fontWeight:600}}>{c.applied}</p></div>
                <div><span style={{fontSize:10,color:"#7c8da5",fontWeight:600,textTransform:"uppercase"}}>Source</span><p style={{margin:"3px 0 0",fontSize:13,fontWeight:600}}>{c.source}</p></div>
                <div><span style={{fontSize:10,color:"#7c8da5",fontWeight:600,textTransform:"uppercase"}}>Recruiter</span><p style={{margin:"3px 0 0",fontSize:13,fontWeight:600,color:"#1F75B9"}}>{c.recruiter||"—"}</p></div>
              </div>
            </div>
            {c.endorsedFrom&&<div style={{background:"#EDF5FC",border:"1px solid #B6D6EB",borderRadius:10,padding:10,marginBottom:14,fontSize:12,color:"#1F75B9"}}><I.Endorse/> Endorsed from <strong>{c.endorsedFrom}</strong></div>}
            {/* Skills */}
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:11,color:"#7c8da5",fontWeight:600,textTransform:"uppercase"}}>Skills</span>
                <button style={{...S.btn("outline","xs")}} onClick={()=>setSI(!si)}><I.Tag/>{si?"Done":"Edit"}</button>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {c.tags.map(t=><span key={t} style={{...S.tag,padding:"4px 10px",fontSize:12,borderRadius:8,display:"inline-flex",alignItems:"center",gap:4}}>{t}{si&&<span style={{cursor:"pointer",fontWeight:800,color:"#C62828"}} onClick={()=>rmSkill(t)}>×</span>}</span>)}
                {!c.tags.length&&!si&&<span style={{fontSize:12,color:"#b8c8d8"}}>None</span>}
              </div>
              {si&&<div style={{display:"flex",gap:6,marginTop:6}}><input style={{...S.fs,flex:1}} placeholder="Add skill..." value={ns} onChange={e=>setNS(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addSkill();}}/><button style={S.btn("primary","sm")} onClick={addSkill}>Add</button></div>}
            </div>
            {/* Notes */}
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:11,color:"#7c8da5",fontWeight:600,textTransform:"uppercase"}}>Notes</span>
                <button style={{...S.btn("outline","xs")}} onClick={()=>{if(eNotes){saveN();}else{setND(c.notes||"");setEN(true);}}}><I.Note/>{eNotes?"Save":"Edit"}</button>
              </div>
              {eNotes?<textarea style={S.ta} value={nd} onChange={e=>setND(e.target.value)} placeholder="Add notes..." autoFocus/>:
              <div style={{background:"#FFFDE7",border:"1px solid #FFF9C4",borderRadius:10,padding:10,minHeight:36}}>
                {c.notes?<p style={{margin:0,fontSize:12,color:"#5D4037",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{c.notes}</p>:<p style={{margin:0,fontSize:12,color:"#b8c8d8",fontStyle:"italic"}}>No notes</p>}
              </div>}
            </div>
            {/* Resume */}
            <div style={{marginBottom:14}}>
              <span style={{fontSize:11,color:"#7c8da5",fontWeight:600,textTransform:"uppercase",display:"block",marginBottom:6}}>Resume</span>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                {c.resumeName?<div style={{background:"#F5F9FC",border:"1px solid #D9E8F2",borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}><I.Note/><span style={{fontSize:12,fontWeight:500,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.resumeName}</span><button style={{...S.btn("primary","xs")}}><I.Download/></button></div>:<span style={{fontSize:12,color:"#b8c8d8",flex:1}}>No resume</span>}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{display:"none"}} onChange={hRes}/><button style={S.btn("outline","sm")} onClick={()=>fileRef.current?.click()}><I.Upload/>{mob?"":"Upload"}</button>
              </div>
            </div>
            {/* Stages */}
            <div style={{borderTop:"1px solid #E2EAF1",paddingTop:14,marginBottom:14}}>
              <span style={{fontSize:11,color:"#7c8da5",fontWeight:600,display:"block",marginBottom:8,textTransform:"uppercase"}}>Move Stage</span>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {next.map(s=><button key={s} style={{...S.btn("outline","sm"),borderColor:STAGE_COLORS[s].dot,color:STAGE_COLORS[s].text,fontSize:11,padding:"4px 10px"}} onClick={()=>moveStage(c.id,s)}>{s.replace("Interview","Int.").replace("Departmental","Dept.")}</button>)}
                {c.stage!=="Rejected"&&<button style={{...S.btn("outline","sm"),borderColor:"#EF5350",color:"#C62828",fontSize:11,padding:"4px 10px"}} onClick={()=>moveStage(c.id,"Rejected")}>Reject</button>}
              </div>
            </div>
            {/* Endorse */}
            <div style={{borderTop:"1px solid #E2EAF1",paddingTop:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,color:"#7c8da5",fontWeight:600,textTransform:"uppercase"}}>Endorse</span>
                <button style={S.btn(showE?"primary":"outline","sm")} onClick={()=>setShowE(!showE)}>{showE?"Cancel":"Endorse"}</button>
              </div>
              {showE&&<div style={{background:"#F5F9FC",borderRadius:10,padding:12}}>
                <div style={{display:"flex",gap:8,flexDirection:mob?"column":"row"}}>
                  <select value={ej} onChange={e=>setEJ(e.target.value)} style={{...S.fs,flex:1}}><option value="">Select job...</option>{other.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}</select>
                  <button style={{...S.btn(),opacity:ej?1:.5}} disabled={!ej} onClick={()=>{if(ej){endorseCandidate(c,Number(ej));setEJ("");setShowE(false);}}}>Confirm</button>
                </div>
              </div>}
            </div>
          </div>
        </div>
      </div>);
  };

  /* ══════ POOL DRAWER ══════ */
  const PDrawer=()=>{
    const [sj,setSJ]=useState("");
    if(!selPool)return null;const c=selPool;
    return(
      <div style={S.modal} onClick={()=>{setSelPool(null);setSJ("");}}>
        <div style={{...S.mBox,width:mob?"100%":520}} onClick={e=>e.stopPropagation()}>
          <div style={{background:"linear-gradient(135deg,#8E24AA,#AB47BC,#D4B6EB)",padding:mob?"20px 18px":"28px 26px",color:"#fff",position:"relative"}}>
            <button onClick={()=>{setSelPool(null);setSJ("");}} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,.2)",border:"none",borderRadius:8,padding:5,cursor:"pointer",color:"#fff",display:"flex"}}><I.X/></button>
            <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{...S.av(mob?46:56),background:"rgba(255,255,255,.25)",fontSize:mob?16:20}}>{c.avatar}</div><div><h2 style={{margin:0,fontSize:mob?17:20,fontWeight:700}}>{c.name}</h2><p style={{margin:"3px 0",fontSize:13,opacity:.9}}>From: {c.closedJob}</p><div style={{fontSize:12,opacity:.85}}>{c.email}</div></div></div>
          </div>
          <div style={{padding:mob?"16px 18px":"20px 26px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><span style={{fontSize:11,color:"#7c8da5"}}>Last Stage</span><div style={{marginTop:4}}><Badge stage={c.lastStage}/></div></div><div style={{textAlign:"right"}}><span style={{fontSize:11,color:"#7c8da5"}}>Rating</span><div style={{marginTop:4}}><Stars v={c.rating}/></div></div></div>
            {c.notes&&<div style={{background:"#FFFDE7",border:"1px solid #FFF9C4",borderRadius:10,padding:10,marginBottom:14}}><p style={{margin:0,fontSize:12,color:"#5D4037",lineHeight:1.6}}>{c.notes}</p></div>}
            <div style={{marginBottom:14}}><span style={{fontSize:11,color:"#7c8da5",fontWeight:600,display:"block",marginBottom:6,textTransform:"uppercase"}}>Skills</span><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{c.tags.map(t=><span key={t} style={{...S.tag,padding:"4px 10px",fontSize:12,borderRadius:8}}>{t}</span>)}</div></div>
            <div style={{borderTop:"1px solid #E2EAF1",paddingTop:14}}>
              <span style={{fontSize:11,color:"#7c8da5",fontWeight:600,display:"block",marginBottom:8,textTransform:"uppercase"}}>Reactivate</span>
              <div style={{display:"flex",gap:8,flexDirection:mob?"column":"row"}}><select value={sj} onChange={e=>setSJ(e.target.value)} style={{...S.fs,flex:1}}><option value="">Select job...</option>{activeJobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}</select><button style={{...S.btn(),opacity:sj?1:.5}} disabled={!sj} onClick={()=>{if(sj){reactivate(c,Number(sj));setSJ("");}}}><I.Redo/> Reactivate</button></div>
            </div>
          </div>
        </div>
      </div>);
  };

  /* ══════ ADD CANDIDATE MODAL ══════ */
  const AddModal=()=>{
    const [f,sF]=useState({name:"",email:"",role:roles[0]||"",source:"Website",recruiter:"Joela"});
    if(!showAdd)return null;
    const add=()=>{if(!f.name||!f.email)return;const ini=f.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);const j=jobs.find(x=>x.title===f.role);setCandidates(p=>[{id:Date.now(),name:f.name,email:f.email,role:f.role,stage:"Applied",rating:3,applied:"Mar 8, 2026",avatar:ini,tags:[],source:f.source,jobId:j?.id||1,recruiter:f.recruiter,notes:"",resumeName:""},...p]);setShowAdd(false);};
    return(
      <div style={S.modal} onClick={()=>setShowAdd(false)}>
        <div style={{...S.mBox,width:mob?"100%":460}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"20px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0,fontSize:18,fontWeight:700}}>Add Candidate</h2><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",display:"flex"}}><I.X/></button></div>
          <div style={{padding:"16px 22px 22px",display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
              <div><label style={S.lb}>Full Name *</label><input style={S.fs} placeholder="Jane Doe" value={f.name} onChange={e=>sF({...f,name:e.target.value})}/></div>
              <div><label style={S.lb}>Email *</label><input style={S.fs} placeholder="jane@email.com" value={f.email} onChange={e=>sF({...f,email:e.target.value})}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
              <div><label style={S.lb}>Role</label><select style={S.fs} value={f.role} onChange={e=>sF({...f,role:e.target.value})}>{roles.map(r=><option key={r}>{r}</option>)}</select></div>
              <div><label style={S.lb}>Recruiter</label><select style={S.fs} value={f.recruiter} onChange={e=>sF({...f,recruiter:e.target.value})}>{RECRUITERS.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div><label style={S.lb}>Source</label><select style={S.fs} value={f.source} onChange={e=>sF({...f,source:e.target.value})}>{["Website","LinkedIn","Indeed","Referral","Other"].map(s=><option key={s}>{s}</option>)}</select></div>
            <div style={{display:"flex",gap:10,marginTop:4,justifyContent:"flex-end"}}><button style={S.btn("outline")} onClick={()=>setShowAdd(false)}>Cancel</button><button style={S.btn()} onClick={add}>Add</button></div>
          </div>
        </div>
      </div>);
  };

  /* ══════ JOB MODAL ══════ */
  const JobModal=()=>{
    const isEdit=!!editJob;
    const [f,sF]=useState(isEdit?{...editJob}:{title:"",dept:"",location:LOCATIONS[0],type:"Full-time",status:"Active",description:""});
    if(!showJobModal)return null;
    const save=()=>{if(!f.title)return;if(isEdit){setJobs(p=>p.map(j=>j.id===editJob.id?{...j,...f}:j));}else{setJobs(p=>[...p,{...f,id:Date.now(),posted:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}]);}setShowJobModal(false);setEditJob(null);};
    const del=()=>{setJobs(p=>p.filter(j=>j.id!==editJob.id));setShowJobModal(false);setEditJob(null);};
    return(
      <div style={S.modal} onClick={()=>{setShowJobModal(false);setEditJob(null);}}>
        <div style={{...S.mBox,width:mob?"100%":500}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"20px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0,fontSize:18,fontWeight:700}}>{isEdit?"Edit Job":"Post New Job"}</h2><button onClick={()=>{setShowJobModal(false);setEditJob(null);}} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",display:"flex"}}><I.X/></button></div>
          <div style={{padding:"16px 22px 22px",display:"flex",flexDirection:"column",gap:12}}>
            <div><label style={S.lb}>Job Title *</label><input style={S.fs} placeholder="e.g. Resort Manager" value={f.title} onChange={e=>sF({...f,title:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
              <div><label style={S.lb}>Department</label><input style={S.fs} placeholder="e.g. Operations" value={f.dept} onChange={e=>sF({...f,dept:e.target.value})}/></div>
              <div><label style={S.lb}>Location</label><select style={S.fs} value={f.location} onChange={e=>sF({...f,location:e.target.value})}>{LOCATIONS.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><label style={S.lb}>Type</label><select style={S.fs} value={f.type} onChange={e=>sF({...f,type:e.target.value})}>{["Full-time","Part-time","Contract","Internship"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={S.lb}>Status</label><select style={S.fs} value={f.status} onChange={e=>sF({...f,status:e.target.value})}>{["Active","Closed"].map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <div><label style={S.lb}>Description</label><textarea style={S.ta} rows={3} placeholder="Describe the role..." value={f.description||""} onChange={e=>sF({...f,description:e.target.value})}/></div>
            <div style={{display:"flex",gap:10,marginTop:4,justifyContent:"space-between"}}>
              <div>{isEdit&&<button style={S.btn("danger","sm")} onClick={del}>Delete</button>}</div>
              <div style={{display:"flex",gap:10}}><button style={S.btn("outline")} onClick={()=>{setShowJobModal(false);setEditJob(null);}}>Cancel</button><button style={S.btn()} onClick={save}>{isEdit?"Save":"Post"}</button></div>
            </div>
          </div>
        </div>
      </div>);
  };

  /* ══════ LAYOUT ══════ */
  return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet"/>
      {/* Desktop sidebar */}
      {!mob&&<div style={{width:collapsed?72:260,minWidth:collapsed?72:260,background:"#fff",borderRight:"1px solid #E2EAF1",display:"flex",flexDirection:"column",transition:"all .3s",overflow:"hidden"}}>
        <div style={{cursor:"pointer"}} onClick={()=>setCollapsed(!collapsed)}>
          {!collapsed?<SideContent/>:<div style={{padding:"20px 16px",display:"flex",justifyContent:"center"}}><div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1F75B9,#B6D6EB)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14}}>BW</div></div>}
        </div>
        {collapsed&&<nav style={{padding:"10px 0",flex:1}}>{navItems.map(n=><div key={n.id} style={{display:"flex",justifyContent:"center",padding:"12px 0",cursor:"pointer",color:page===n.id?"#1F75B9":"#64748b",background:page===n.id?"#EDF5FC":"transparent",margin:"2px 10px",borderRadius:10}} onClick={()=>goPage(n.id)}>{n.icon}</div>)}</nav>}
      </div>}
      {/* Mobile sidebar overlay */}
      {mob&&menuOpen&&<div style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
        <div style={{width:280,background:"#fff",display:"flex",flexDirection:"column",boxShadow:"4px 0 20px rgba(0,0,0,.15)",zIndex:1}}><SideContent/></div>
        <div style={{flex:1,background:"rgba(0,0,0,.3)"}} onClick={()=>setMenuOpen(false)}/>
      </div>}
      {/* Main */}
      <div style={S.main}>
        <div style={S.top}>
          {mob&&<button onClick={()=>setMenuOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:"#1F75B9",display:"flex",padding:4}}><I.Menu/></button>}
          <div style={S.sb}><I.Search/><input style={S.si} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div style={{position:"relative",cursor:"pointer"}}><I.Bell/><span style={{position:"absolute",top:-4,right:-4,width:7,height:7,borderRadius:"50%",background:"#EF5350",border:"2px solid #fff"}}/></div>
        </div>
        <div style={S.cnt}>
          {page==="dashboard"&&<DashPage/>}
          {page==="candidates"&&<CandPage/>}
          {page==="pipeline"&&<PipePage/>}
          {page==="jobs"&&<JobsPage/>}
          {page==="reports"&&<RepPage/>}
          {page==="pool"&&<PoolPage/>}
        </div>
      </div>
      <CDrawer/><PDrawer/><AddModal/><JobModal/>
    </div>
  );
}
