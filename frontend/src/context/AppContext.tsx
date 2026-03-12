/**
 * Global application state management for Bluewater Jobs ATS.
 * Uses React Context + useReducer to centralize all candidates, jobs, pool data,
 * and UI state (selected candidate, modal visibility, etc.).
 *
 * Components consume state via the useApp() hook.
 */

import {
  createContext,
  useContext,
  useReducer,
  type FC,
  type ReactNode,
  type Dispatch,
} from "react";
import type { Candidate, PoolCandidate, Job, FillTag } from "../data/types";
import { INIT_CANDIDATES, INIT_POOL, INIT_JOBS } from "../data/seeds";

/* ─── State Shape ─── */

export interface AppState {
  candidates: Candidate[];
  pool: PoolCandidate[];
  jobs: Job[];
  selectedCandidate: Candidate | null;
  selectedPoolCandidate: PoolCandidate | null;
  showAddModal: boolean;
  showJobModal: boolean;
  editJob: Job | null;
  nqCandidate: Candidate | null;
  nqAction: "endorse" | null;
  nqJob: string;
  fillTags: Record<number, FillTag | undefined>;
  filterStage: string;
  filterRole: string;
}

const initialState: AppState = {
  candidates: INIT_CANDIDATES,
  pool: INIT_POOL,
  jobs: INIT_JOBS,
  selectedCandidate: null,
  selectedPoolCandidate: null,
  showAddModal: false,
  showJobModal: false,
  editJob: null,
  nqCandidate: null,
  nqAction: null,
  nqJob: "",
  fillTags: {},
  filterStage: "All",
  filterRole: "All",
};

/* ─── Action Types ─── */

export type AppAction =
  | { type: "SET_FILTER_STAGE"; payload: string }
  | { type: "SET_FILTER_ROLE"; payload: string }
  | { type: "SELECT_CANDIDATE"; payload: Candidate | null }
  | { type: "SELECT_POOL_CANDIDATE"; payload: PoolCandidate | null }
  | { type: "SET_SHOW_ADD_MODAL"; payload: boolean }
  | { type: "SET_SHOW_JOB_MODAL"; payload: boolean }
  | { type: "SET_EDIT_JOB"; payload: Job | null }
  | { type: "SET_NQ_CANDIDATE"; payload: Candidate | null }
  | { type: "SET_NQ_ACTION"; payload: "endorse" | null }
  | { type: "SET_NQ_JOB"; payload: string }
  | { type: "TOGGLE_FILL_TAG"; payload: { jobId: number; tag: FillTag } }
  | { type: "MOVE_STAGE"; payload: { id: number; stage: string } }
  | { type: "UPDATE_CANDIDATE"; payload: { id: number; updates: Partial<Candidate> } }
  | { type: "ADD_CANDIDATE"; payload: Candidate }
  | { type: "ENDORSE_CANDIDATE"; payload: { candidate: Candidate; jobId: number } }
  | { type: "REACTIVATE_POOL"; payload: { poolCandidate: PoolCandidate; jobId: number } }
  | { type: "MARK_NOT_QUALIFIED"; payload: Candidate }
  | { type: "ADD_TO_POOL"; payload: Candidate }
  | { type: "NQ_ENDORSE"; payload: { candidate: Candidate; jobId: number } }
  | { type: "ADD_JOB"; payload: Job }
  | { type: "UPDATE_JOB"; payload: Job }
  | { type: "DELETE_JOB"; payload: number };

/* ─── Helpers ─── */

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}


/* ─── Reducer ─── */

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    /* ── UI State ── */
    case "SET_FILTER_STAGE":
      return { ...state, filterStage: action.payload };
    case "SET_FILTER_ROLE":
      return { ...state, filterRole: action.payload };
    case "SELECT_CANDIDATE":
      return { ...state, selectedCandidate: action.payload };
    case "SELECT_POOL_CANDIDATE":
      return { ...state, selectedPoolCandidate: action.payload };
    case "SET_SHOW_ADD_MODAL":
      return { ...state, showAddModal: action.payload };
    case "SET_SHOW_JOB_MODAL":
      return { ...state, showJobModal: action.payload };
    case "SET_EDIT_JOB":
      return { ...state, editJob: action.payload };
    case "SET_NQ_CANDIDATE":
      return { ...state, nqCandidate: action.payload, nqAction: null, nqJob: "" };
    case "SET_NQ_ACTION":
      return { ...state, nqAction: action.payload };
    case "SET_NQ_JOB":
      return { ...state, nqJob: action.payload };

    case "TOGGLE_FILL_TAG": {
      const { jobId, tag } = action.payload;
      const current = state.fillTags[jobId];
      return {
        ...state,
        fillTags: { ...state.fillTags, [jobId]: current === tag ? undefined : tag },
      };
    }

    /* ── Candidate Mutations ── */
    case "MOVE_STAGE": {
      const { id, stage } = action.payload;
      const candidates = state.candidates.map((c) =>
        c.id === id ? { ...c, stage: stage as Candidate["stage"] } : c
      );
      const selectedCandidate =
        state.selectedCandidate?.id === id
          ? { ...state.selectedCandidate, stage: stage as Candidate["stage"] }
          : state.selectedCandidate;
      return { ...state, candidates, selectedCandidate };
    }

    case "UPDATE_CANDIDATE": {
      const { id, updates } = action.payload;
      const candidates = state.candidates.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      const selectedCandidate =
        state.selectedCandidate?.id === id
          ? { ...state.selectedCandidate, ...updates }
          : state.selectedCandidate;
      return { ...state, candidates, selectedCandidate };
    }

    case "ADD_CANDIDATE":
      return {
        ...state,
        candidates: [action.payload, ...state.candidates],
        showAddModal: false,
      };

    case "ENDORSE_CANDIDATE": {
      const { candidate: c, jobId } = action.payload;
      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return state;

      const endorsed: Candidate = {
        id: Date.now(),
        name: c.name,
        email: c.email,
        role: job.title,
        stage: "Screening",
        rating: c.rating,
        applied: formatDate(),
        avatar: c.avatar,
        tags: [...c.tags],
        source: "Endorsed",
        jobId,
        recruiter: c.recruiter || "",
        notes: "",
        resumeName: "",
        talents: c.talents || [],
        examResultName: "",
        endorsedFrom: c.role,
      };
      return {
        ...state,
        candidates: [endorsed, ...state.candidates],
        selectedCandidate: null,
      };
    }

    case "REACTIVATE_POOL": {
      const { poolCandidate: pc, jobId } = action.payload;
      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return state;

      const reactivated: Candidate = {
        id: Date.now(),
        name: pc.name,
        email: pc.email,
        role: job.title,
        stage: "Screening",
        rating: pc.rating,
        applied: formatDate(),
        avatar: pc.avatar,
        tags: [...pc.tags],
        source: "Talent Pool",
        jobId,
        recruiter: "",
        notes: "",
        resumeName: "",
        talents: pc.talents || [],
        examResultName: "",
      };
      return {
        ...state,
        candidates: [reactivated, ...state.candidates],
        pool: state.pool.filter((p) => p.id !== pc.id),
        selectedPoolCandidate: null,
      };
    }

    case "MARK_NOT_QUALIFIED": {
      const c = action.payload;
      const candidates = state.candidates.map((x) =>
        x.id === c.id
          ? {
              ...x,
              stage: "Rejected" as const,
              notes: (x.notes ? x.notes + "\n" : "") + "Tagged as Not Qualified.",
            }
          : x
      );
      return { ...state, candidates };
    }

    case "ADD_TO_POOL": {
      const c = action.payload;
      const poolEntry: PoolCandidate = {
        id: Date.now(),
        name: c.name,
        role: c.role,
        lastStage: c.stage,
        rating: c.rating,
        applied: c.applied,
        email: c.email,
        avatar: c.avatar,
        tags: [...c.tags],
        source: c.source,
        jobId: c.jobId,
        closedJob: c.role,
        pooledDate: formatDate(),
        notes:
          (c.notes ? c.notes + "\n" : "") +
          "Not Qualified for " +
          c.role +
          ". Added to talent pool.",
        talents: c.talents || [],
      };
      return {
        ...state,
        pool: [...state.pool, poolEntry],
        candidates: state.candidates.filter((x) => x.id !== c.id),
      };
    }

    case "NQ_ENDORSE": {
      const { candidate: c, jobId } = action.payload;
      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return state;

      // Mark as rejected
      const candidates = state.candidates.map((x) =>
        x.id === c.id
          ? {
              ...x,
              stage: "Rejected" as const,
              notes: (x.notes ? x.notes + "\n" : "") + "Tagged as Not Qualified.",
            }
          : x
      );

      // Create endorsed entry
      const endorsed: Candidate = {
        id: Date.now(),
        name: c.name,
        email: c.email,
        role: job.title,
        stage: "Screening",
        rating: c.rating,
        applied: formatDate(),
        avatar: c.avatar,
        tags: [...c.tags],
        source: "Endorsed",
        jobId,
        recruiter: c.recruiter || "",
        notes: "Endorsed from " + c.role + " (Not Qualified)",
        resumeName: "",
        talents: c.talents || [],
        examResultName: "",
        endorsedFrom: c.role,
      };
      return {
        ...state,
        candidates: [endorsed, ...candidates],
        nqCandidate: null,
        nqAction: null,
        nqJob: "",
      };
    }

    /* ── Job Mutations ── */
    case "ADD_JOB":
      return {
        ...state,
        jobs: [...state.jobs, action.payload],
        showJobModal: false,
        editJob: null,
      };

    case "UPDATE_JOB":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.payload.id ? action.payload : j
        ),
        showJobModal: false,
        editJob: null,
      };

    case "DELETE_JOB":
      return {
        ...state,
        jobs: state.jobs.filter((j) => j.id !== action.payload),
        showJobModal: false,
        editJob: null,
      };

    default:
      return state;
  }
}

/* ─── Context ─── */

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ─── Provider ─── */

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

/* ─── Hook ─── */

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
