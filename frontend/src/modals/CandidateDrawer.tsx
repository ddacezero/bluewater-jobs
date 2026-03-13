/**
 * Candidate Drawer — full candidate detail modal with notes editing,
 * resume/exam display, stage mover, rating, and pool action.
 */

import { useState, useRef, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { STAGES, STAGE_COLORS } from "../data/constants";
import Badge from "../components/Badge";
import Avatar from "../components/Avatar";
import {
  XIcon, NoteIcon, UploadIcon, DownloadIcon,
  EndorseIcon, ClipboardIcon, PoolIcon, StarIcon,
} from "../components/icons";
import { updateCandidate } from "../api/candidates";
import type { Stage } from "../data/types";

const CandidateDrawer: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const [editNotes, setEditNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const examRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const { selectedCandidate: selC, candidates } = state;
  if (!selC) return null;

  const c = candidates.find((x) => x.id === selC.id) || selC;

  // Only show for non-pooled candidates
  if (c.is_pooled) return null;

  const nextStages = STAGES.filter((s) => s !== c.stage && s !== "Rejected");

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
    setEditNotes(false);
  };

  const saveNotes = async () => {
    setLoading(true);
    try {
      await updateCandidate(c.id, { notes: notesDraft });
      dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { notes: notesDraft } } });
      setEditNotes(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (stage: Stage) => {
    setLoading(true);
    try {
      await updateCandidate(c.id, { stage });
      dispatch({ type: "MOVE_STAGE", payload: { id: c.id, stage } });
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    setLoading(true);
    try {
      await updateCandidate(c.id, { rating });
      dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { rating } } });
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
    } finally {
      setLoading(false);
    }
  };

  const handleResume = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // Resume upload not supported via this drawer in the current API shape.
    // The resume URL lives on the Application record — upload must go through
    // the application endpoint.
  };

  const handleExam = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // Exam result upload not supported via this drawer in the current API shape.
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
                <p className="mt-1 text-[13.5px] font-semibold">{c.application.created_at}</p>
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
                <p className="mt-1 text-[13.5px] font-semibold text-[var(--color-primary)]">
                  {c.recruiter?.name ?? "Unassigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Endorsed From */}
          {c.endorsed_from && (
            <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary-gradient-end)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-[12.5px] text-[var(--color-primary)] flex items-center gap-1.5">
              <EndorseIcon /> Endorsed from <strong>{c.endorsed_from}</strong>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                Notes
              </span>
              <button
                className="border border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
                disabled={loading}
                onClick={() => {
                  if (editNotes) {
                    saveNotes();
                  } else {
                    setNotesDraft(c.notes || "");
                    setEditNotes(true);
                  }
                }}
              >
                <NoteIcon />
                {editNotes ? (loading ? "Saving..." : "Save") : "Edit"}
              </button>
            </div>
            {editNotes ? (
              <textarea
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] resize-y min-h-[80px] focus:border-[var(--color-primary)]"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add notes..."
                autoFocus
              />
            ) : (
              <div className="bg-[var(--color-notes-bg)] border border-[var(--color-notes-border)] rounded-[var(--radius-md)] p-3 min-h-[44px]">
                {c.notes ? (
                  <p className="text-[13px] text-[var(--color-notes-text)] leading-relaxed whitespace-pre-wrap">
                    {c.notes}
                  </p>
                ) : (
                  <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">No notes</p>
                )}
              </div>
            )}
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
                  className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
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
                  className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                >
                  <DownloadIcon />
                </a>
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">No exam results uploaded</p>
            )}
          </div>

          {/* Move Stage */}
          <div className="border-t border-[var(--color-surface-border)] pt-5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-3">
              Move Stage
            </span>
            <div className="flex gap-2 flex-wrap">
              {nextStages.map((s) => (
                <button
                  key={s}
                  className="rounded-[var(--radius-md)] px-3 py-1.5 text-[12px] font-semibold bg-transparent cursor-pointer transition-colors hover:bg-opacity-10 disabled:opacity-50"
                  style={{
                    border: `1.5px solid ${STAGE_COLORS[s].dot}`,
                    color: STAGE_COLORS[s].text,
                  }}
                  disabled={loading}
                  onClick={() => handleMoveStage(s as Stage)}
                >
                  {s.replace("Interview", "Int.").replace("Departmental", "Dept.")}
                </button>
              ))}
              {c.stage !== "Rejected" && (
                <button
                  className="border border-[var(--color-danger)] text-[var(--color-danger-dark)] rounded-[var(--radius-md)] px-3 py-1.5 text-[12px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-danger-bg)] transition-colors disabled:opacity-50"
                  disabled={loading}
                  onClick={() => handleMoveStage("Rejected")}
                >
                  Reject
                </button>
              )}
            </div>
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
