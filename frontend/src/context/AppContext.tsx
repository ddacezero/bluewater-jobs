/**
 * Global application state management for Bluewater Jobs ATS.
 * Uses React Context + useReducer to centralize all candidates, jobs,
 * and UI state (selected candidate, modal visibility, etc.).
 *
 * Components consume state via the useApp() hook.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type FC,
  type ReactNode,
  type Dispatch,
} from "react";
import type { Candidate, Job, FillTag, Toast } from "../data/types";
import { INIT_JOBS } from "../data/seeds";
import { listJobs } from "../api/jobs";
import { listCandidates } from "../api/candidates";

/* ─── State Shape ─── */

export interface AppState {
  candidates: Candidate[];
  jobs: Job[];
  selectedCandidate: Candidate | null;
  showAddModal: boolean;
  showJobModal: boolean;
  editJob: Job | null;
  fillTags: Record<number, FillTag | undefined>;
  filterStage: string;
  filterRole: string;
  toasts: Toast[];
}

const initialState: AppState = {
  candidates: [],
  jobs: INIT_JOBS,
  selectedCandidate: null,
  showAddModal: false,
  showJobModal: false,
  editJob: null,
  fillTags: {},
  filterStage: "All",
  filterRole: "All",
  toasts: [],
};

/* ─── Action Types ─── */

export type AppAction =
  | { type: "SET_FILTER_STAGE"; payload: string }
  | { type: "SET_FILTER_ROLE"; payload: string }
  | { type: "SELECT_CANDIDATE"; payload: Candidate | null }
  | { type: "SET_SHOW_ADD_MODAL"; payload: boolean }
  | { type: "SET_SHOW_JOB_MODAL"; payload: boolean }
  | { type: "SET_EDIT_JOB"; payload: Job | null }
  | { type: "TOGGLE_FILL_TAG"; payload: { jobId: number; tag: FillTag } }
  | { type: "MOVE_STAGE"; payload: { id: number; stage: string } }
  | { type: "UPDATE_CANDIDATE"; payload: { id: number; updates: Partial<Candidate> } }
  | { type: "ADD_CANDIDATE"; payload: Candidate }
  | { type: "SET_API_CANDIDATES"; payload: Candidate[] }
  | { type: "ADD_JOB"; payload: Job }
  | { type: "UPDATE_JOB"; payload: Job }
  | { type: "DELETE_JOB"; payload: { id: number; source?: "api" } }
  | { type: "SET_API_JOBS"; payload: Job[] }
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string };

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
    case "SET_SHOW_ADD_MODAL":
      return { ...state, showAddModal: action.payload };
    case "SET_SHOW_JOB_MODAL":
      return { ...state, showJobModal: action.payload };
    case "SET_EDIT_JOB":
      return { ...state, editJob: action.payload };

    case "TOGGLE_FILL_TAG": {
      const { jobId, tag } = action.payload;
      const current = state.fillTags[jobId];
      return {
        ...state,
        fillTags: { ...state.fillTags, [jobId]: current === tag ? undefined : tag },
      };
    }

    /* ── Candidate Mutations ── */
    case "SET_API_CANDIDATES":
      return { ...state, candidates: action.payload };

    case "ADD_CANDIDATE":
      return {
        ...state,
        candidates: [action.payload, ...state.candidates],
        showAddModal: false,
      };

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
          j.id === action.payload.id && j.source === action.payload.source
            ? action.payload
            : j
        ),
        showJobModal: false,
        editJob: null,
      };

    case "DELETE_JOB":
      // Match on both id and source so a seeded job and an API job with the same
      // numeric id cannot accidentally delete each other.
      return {
        ...state,
        jobs: state.jobs.filter(
          (j) =>
            !(
              j.id === action.payload.id &&
              j.source === action.payload.source
            )
        ),
        showJobModal: false,
        editJob: null,
      };

    case "SET_API_JOBS": {
      // Replace all existing API-sourced jobs wholesale so stale entries are
      // always reconciled with the fresh server response.
      const seededJobs = state.jobs.filter((j) => j.source !== "api");
      return { ...state, jobs: [...seededJobs, ...action.payload] };
    }

    /* ── Toast Notifications ── */
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
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

  // On mount: if a valid token exists (page refresh while logged in),
  // fetch API-persisted jobs and candidates.
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const errorToast = (message: string) =>
      dispatch({ type: "ADD_TOAST", payload: { id: Date.now().toString(), message, variant: "error" } });

    listJobs()
      .then((apiJobs) => dispatch({ type: "SET_API_JOBS", payload: apiJobs }))
      .catch(() => errorToast("Failed to load jobs. Please refresh."));

    listCandidates()
      .then((candidates) => dispatch({ type: "SET_API_CANDIDATES", payload: candidates }))
      .catch(() => errorToast("Failed to load candidates. Please refresh."));
  }, []);

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
