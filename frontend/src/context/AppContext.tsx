import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type FC,
  type ReactNode,
} from "react";
import {
  createCandidateWithApplication,
  createJob,
  deleteJob,
  listApplications,
  listJobs,
  updateApplication,
  updateJob,
  type ApplicationUpdatePayload,
  type CandidateApplicationPayload,
  type JobPayload,
} from "../api";
import type { Candidate, FillTag, Job, PoolCandidate, Stage } from "../data/types";

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
  fillTags: Record<number, FillTag | undefined>;
  filterStage: string;
  filterRole: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: AppState = {
  candidates: [],
  pool: [],
  jobs: [],
  selectedCandidate: null,
  selectedPoolCandidate: null,
  showAddModal: false,
  showJobModal: false,
  editJob: null,
  nqCandidate: null,
  fillTags: {},
  filterStage: "All",
  filterRole: "All",
  isLoading: true,
  isSaving: false,
  error: null,
};

export type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_JOBS"; payload: Job[] }
  | { type: "SET_CANDIDATES"; payload: Candidate[] }
  | { type: "SET_FILTER_STAGE"; payload: string }
  | { type: "SET_FILTER_ROLE"; payload: string }
  | { type: "SELECT_CANDIDATE"; payload: Candidate | null }
  | { type: "SELECT_POOL_CANDIDATE"; payload: PoolCandidate | null }
  | { type: "SET_SHOW_ADD_MODAL"; payload: boolean }
  | { type: "SET_SHOW_JOB_MODAL"; payload: boolean }
  | { type: "SET_EDIT_JOB"; payload: Job | null }
  | { type: "SET_NQ_CANDIDATE"; payload: Candidate | null }
  | { type: "TOGGLE_FILL_TAG"; payload: { jobId: number; tag: FillTag } };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_JOBS":
      return {
        ...state,
        jobs: action.payload,
        editJob: state.editJob
          ? action.payload.find((job) => job.id === state.editJob?.id) || null
          : null,
      };
    case "SET_CANDIDATES":
      return {
        ...state,
        candidates: action.payload,
        selectedCandidate: state.selectedCandidate
          ? action.payload.find((candidate) => candidate.id === state.selectedCandidate?.id) || null
          : null,
        nqCandidate: state.nqCandidate
          ? action.payload.find((candidate) => candidate.id === state.nqCandidate?.id) || null
          : null,
      };
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
      return { ...state, nqCandidate: action.payload };
    case "TOGGLE_FILL_TAG": {
      const { jobId, tag } = action.payload;
      const current = state.fillTags[jobId];
      return {
        ...state,
        fillTags: { ...state.fillTags, [jobId]: current === tag ? undefined : tag },
      };
    }
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  reloadData: () => Promise<void>;
  saveJob: (payload: JobPayload, jobId?: number) => Promise<void>;
  removeJob: (jobId: number) => Promise<void>;
  addCandidateToPipeline: (payload: CandidateApplicationPayload) => Promise<Candidate>;
  saveApplication: (applicationId: number, payload: ApplicationUpdatePayload) => Promise<void>;
  moveApplicationStage: (applicationId: number, stage: Stage) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const reloadData = async () => {
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const [jobs, candidates] = await Promise.all([listJobs(), listApplications()]);
      dispatch({ type: "SET_JOBS", payload: jobs });
      dispatch({ type: "SET_CANDIDATES", payload: candidates });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to load data.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    void reloadData();
  }, []);

  const runMutation = async (task: () => Promise<void>) => {
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_SAVING", payload: true });

    try {
      await task();
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to save changes.",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const saveJobRecord = async (payload: JobPayload, jobId?: number) => {
    await runMutation(async () => {
      if (jobId) {
        await updateJob(jobId, payload);
      } else {
        await createJob(payload);
      }

      await reloadData();
      dispatch({ type: "SET_SHOW_JOB_MODAL", payload: false });
      dispatch({ type: "SET_EDIT_JOB", payload: null });
    });
  };

  const removeJobRecord = async (jobId: number) => {
    await runMutation(async () => {
      await deleteJob(jobId);
      await reloadData();
      dispatch({ type: "SET_SHOW_JOB_MODAL", payload: false });
      dispatch({ type: "SET_EDIT_JOB", payload: null });
    });
  };

  const addCandidateRecord = async (payload: CandidateApplicationPayload) => {
    let createdCandidate: Candidate | null = null;
    await runMutation(async () => {
      createdCandidate = await createCandidateWithApplication(payload);
      await reloadData();
      dispatch({ type: "SET_SHOW_ADD_MODAL", payload: false });
    });
    if (!createdCandidate) {
      throw new Error("Candidate creation did not return an application.");
    }
    return createdCandidate;
  };

  const saveApplicationRecord = async (
    applicationId: number,
    payload: ApplicationUpdatePayload
  ) => {
    await runMutation(async () => {
      await updateApplication(applicationId, payload);
      await reloadData();
    });
  };

  const moveApplication = async (applicationId: number, stage: Stage) => {
    await saveApplicationRecord(applicationId, { stage });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        reloadData,
        saveJob: saveJobRecord,
        removeJob: removeJobRecord,
        addCandidateToPipeline: addCandidateRecord,
        saveApplication: saveApplicationRecord,
        moveApplicationStage: moveApplication,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
