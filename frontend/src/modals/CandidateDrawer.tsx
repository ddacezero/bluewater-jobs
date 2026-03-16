/**
 * Candidate Drawer — full candidate detail modal with notes editing,
 * resume/exam display, stage mover, rating, pool action, and stage history timeline.
 */

import { useState, useRef, useEffect, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { STAGES, STAGE_COLORS } from "../data/constants";
import Badge from "../components/Badge";
import Avatar from "../components/Avatar";
import {
  XIcon, NoteIcon, UploadIcon, DownloadIcon,
  EndorseIcon, ClipboardIcon, PoolIcon, StarIcon,
} from "../components/icons";
import { updateCandidate, uploadExamResult, listNotes, createNote } from "../api/candidates";
import { formatPHT } from "../data/utils";
import type { CandidateNote } from "../data/types";

interface UserOption {
  id: number;
  name: string;
}

const CandidateDrawer: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const examRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [recruiters, setRecruiters] = useState<UserOption[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    fetch("http://localhost:8000/api/auth/users/", { headers })
      .then((r) => r.json())
      .then(setRecruiters)
      .catch(() => {});
  }, []);

  const { selectedCandidate: selC, candidates } = state;

  // Fetch notes whenever the selected candidate changes (must be before early returns)
  useEffect(() => {
    if (!selC) return;
    listNotes(selC.id)
      .then(setNotes)
      .catch(() => {});
  }, [selC?.id]);

  if (!selC) return null;

  const c = candidates.find((x) => x.id === selC.id) || selC;

  // Only show for non-pooled candidates
  if (c.is_pooled) return null;

  const recentNotes = notes.slice(0, 3);

  // Build effective timestamps: "Applied" falls back to application.created_at
  // so pre-existing candidates always show their application date.
  const effectiveTimestamps: Record<string, string> = {
    ...(c.application.created_at ? { Applied: c.application.created_at } : {}),
    ...(c.stage_timestamps ?? {}),
  };
  // Sort chronologically (oldest → newest) and keep the 5 most recent entries.
  const stagesWithTimestamp = STAGES
    .filter((s) => effectiveTimestamps[s])
    .sort((a, b) =>
      new Date(effectiveTimestamps[a]).getTime() - new Date(effectiveTimestamps[b]).getTime()
    )
    .slice(-5);

  const initials = c.application.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const resumeName = c.application.resume
    ? c.application.resume.split("/").pop() ?? "resume"
    : null;

  const examResultName = c.exam_result
    ? c.exam_result.split("/").pop() ?? "exam"
    : null;

  const close = () => {
    dispatch({ type: "SELECT_CANDIDATE", payload: null });
  };

  const handleAddNote = async () => {
    const content = noteDraft.trim();
    if (!content) return;
    setNotesLoading(true);
    try {
      const note = await createNote(c.id, content);
      setNotes((prev) => [note, ...prev]);
      setNoteDraft("");
    } catch {
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Failed to save note.", variant: "error" },
      });
    } finally {
      setNotesLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    setLoading(true);
    try {
      await updateCandidate(c.id, { rating });
      dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { rating } } });
    } catch {
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Failed to save changes.", variant: "error" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPool = async () => {
    setLoading(true);
    try {
      const apiResponse = await updateCandidate(c.id, { is_pooled: true });
      dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: apiResponse } });
      close();
    } catch {
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Failed to save changes.", variant: "error" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResume = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // Resume upload not supported via this drawer in the current API shape.
    // The resume URL lives on the Application record — upload must go through
    // the application endpoint.
  };

  const handleExam = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const updated = await uploadExamResult(c.id, file);
      dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { exam_result: updated.exam_result } } });
    } catch {
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Failed to upload exam result.", variant: "error" },
      });
    } finally {
      setLoading(false);
      if (examRef.current) examRef.current.value = "";
    }
  };

  const handleRecruiter = async (recruiter_id: number | null) => {
    setLoading(true);
    try {
      const updated = await updateCandidate(c.id, { recruiter_id });
      dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { recruiter: updated.recruiter } } });
    } catch {
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Failed to update recruiter.", variant: "error" },
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[580px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-br from-[#1458A0] via-[#1F75B9] to-[#5BA8D4] ${
            mob ? "px-5 py-5" : "px-6 py-6"
          } text-white relative`}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-none rounded-[var(--radius-md)] p-1.5 cursor-pointer text-white flex transition-colors"
          >
            <XIcon />
          </button>
          <div className="flex items-center gap-4">
            <Avatar initials={initials} size="lg" className="!bg-white/25 shrink-0" />
            <div className="min-w-0">
              <h2 className={`${mob ? "text-[17px]" : "text-xl"} font-bold leading-snug`}>
                {c.application.name}
              </h2>
              <p className="mt-1 text-[13px] opacity-90 font-medium">{c.job.title}</p>
              <div className="text-[12px] opacity-80 mt-0.5">{c.application.email}</div>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-5 py-5" : "px-6 py-6"} flex flex-col gap-5`}>
          {/* Stage & Rating */}
          <div className="flex justify-between items-center bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] px-4 py-3">
            <div>
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Stage
              </span>
              <Badge stage={c.stage} />
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Rating
              </span>
              <span className="inline-flex gap-px">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    className="bg-transparent border-none cursor-pointer p-0 flex"
                    disabled={loading}
                    onClick={() => handleRating(i)}
                  >
                    <StarIcon filled={i <= c.rating} />
                  </button>
                ))}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] p-4">
            <div className={`grid ${mob ? "grid-cols-2" : "grid-cols-3"} gap-4`}>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                  Applied
                </span>
                <p className="mt-1 text-[12px] font-semibold leading-snug">
                  {formatPHT(c.application.created_at)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                  Source
                </span>
                <p className="mt-1 text-[13.5px] font-semibold">{c.application.source}</p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                  Recruiter
                </span>
                <select
                  className="mt-1 text-[13.5px] font-semibold text-[var(--color-primary)] bg-transparent border-none outline-none cursor-pointer w-full p-0"
                  value={c.recruiter?.id ?? ""}
                  onChange={(e) => handleRecruiter(e.target.value ? Number(e.target.value) : null)}
                  disabled={loading}
                >
                  <option value="">Unassigned</option>
                  {recruiters.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stage History Timeline */}
          {stagesWithTimestamp.length > 0 && (
            <div>
              <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-3">
                Stage History
              </span>
              <div className="relative pl-5">
                {/* Vertical line */}
                <div
                  className="absolute left-[7px] top-2 bottom-2 w-px"
                  style={{ background: "var(--color-surface-muted)" }}
                />
                <div className="flex flex-col gap-3">
                  {stagesWithTimestamp.map((stage, idx) => {
                    const sc = STAGE_COLORS[stage];
                    const isCurrent = stage === c.stage;
                    return (
                      <div key={stage} className="relative flex items-start gap-3">
                        {/* Dot */}
                        <div
                          className="absolute -left-5 mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10"
                          style={{
                            background: isCurrent ? sc.dot : sc.bg,
                            borderColor: sc.dot,
                            boxShadow: isCurrent ? `0 0 0 3px ${sc.dot}22` : "none",
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[12px] font-bold"
                              style={{ color: sc.dot }}
                            >
                              {stage}
                            </span>
                            {isCurrent && (
                              <span
                                className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                                style={{ background: sc.bg, color: sc.text }}
                              >
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                            {formatPHT(effectiveTimestamps[stage])}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Endorsed From */}
          {c.endorsed_from && (
            <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary-gradient-end)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[12.5px] text-[var(--color-primary)] flex items-center gap-1.5">
              <EndorseIcon /> Endorsed from <strong>{c.endorsed_from}</strong>
            </div>
          )}

          {/* Notes */}
          <div>
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-3">
              Notes
            </span>

            {/* Add note */}
            <div className="flex gap-2 mb-3">
              <textarea
                className="flex-1 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13px] text-[var(--color-text-primary)] outline-none font-[inherit] resize-none focus:border-[var(--color-primary)] transition-colors"
                rows={2}
                placeholder="Write a note..."
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote();
                }}
                disabled={notesLoading}
              />
              <button
                className="self-end border-none bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1 transition-opacity"
                onClick={handleAddNote}
                disabled={notesLoading || !noteDraft.trim()}
              >
                <NoteIcon />
                {notesLoading ? "..." : "Add"}
              </button>
            </div>

            {/* Recent notes list (top 3) */}
            <div className="flex flex-col gap-2">
              {recentNotes.length === 0 ? (
                <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">No notes yet</p>
              ) : (
                recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[var(--color-notes-bg)] border border-[var(--color-notes-border)] rounded-[var(--radius-md)] px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-[var(--color-primary)] truncate">
                        {note.author_name}
                      </span>
                      <span className="text-[10.5px] text-[var(--color-text-muted)] shrink-0">
                        {formatPHT(note.created_at)}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[var(--color-notes-text)] leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
              {notes.length > 3 && (
                <p className="text-[11px] text-[var(--color-text-muted)] text-center">
                  +{notes.length - 3} older note{notes.length - 3 !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Resume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                Resume
              </span>
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResume} />
                <button
                  className="border border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <UploadIcon />
                  {mob ? "" : "Replace"}
                </button>
              </div>
            </div>
            {resumeName ? (
              <div className="bg-[var(--color-surface-hover)] border border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3.5 py-2.5 flex items-center gap-2">
                <NoteIcon />
                <span className="text-[13px] font-medium flex-1 truncate">{resumeName}</span>
                <a
                  href={c.application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                >
                  <DownloadIcon />
                </a>
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">No resume uploaded</p>
            )}
          </div>

          {/* Exam Results */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                Exam Results
              </span>
              <div className="flex items-center gap-2">
                <input ref={examRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.png,.jpg" className="hidden" onChange={handleExam} />
                <button
                  className="border border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                  onClick={() => examRef.current?.click()}
                >
                  <UploadIcon />
                  {mob ? "" : "Upload"}
                </button>
              </div>
            </div>
            {examResultName ? (
              <div className="bg-[var(--color-exam-bg)] border border-[var(--color-exam-border)] rounded-[var(--radius-md)] px-3.5 py-2.5 flex items-center gap-2">
                <ClipboardIcon />
                <span className="text-[13px] font-medium flex-1 truncate">{examResultName}</span>
                <a
                  href={c.exam_result!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                >
                  <DownloadIcon />
                </a>
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">No exam results uploaded</p>
            )}
          </div>

          {/* Add to Talent Pool */}
          <div className="border-t border-[var(--color-surface-border)] pt-5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                Talent Pool
              </span>
              <button
                className="border border-[var(--color-purple)] text-[var(--color-purple)] rounded-[var(--radius-md)] px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer inline-flex items-center gap-2 bg-transparent hover:bg-[var(--color-purple-light)] transition-colors disabled:opacity-50"
                disabled={loading}
                onClick={handleAddToPool}
              >
                <PoolIcon /> {loading ? "Adding..." : "Add to Pool"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDrawer;
