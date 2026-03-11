import { useMemo, useRef, useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { STAGES, STAGE_COLORS } from "../data/constants";
import Badge from "../components/Badge";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import {
  XIcon,
  NoteIcon,
  UploadIcon,
  DownloadIcon,
  ClipboardIcon,
} from "../components/icons";

const CandidateDrawer: FC = () => {
  const { state, dispatch, saveApplication, moveApplicationStage } = useApp();
  const mob = useMobile();
  const fileRef = useRef<HTMLInputElement>(null);
  const examRef = useRef<HTMLInputElement>(null);
  const [editNotes, setEditNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  const { selectedCandidate, candidates, isSaving } = state;
  const currentCandidate = useMemo(() => {
    if (!selectedCandidate) return null;
    return candidates.find((candidate) => candidate.id === selectedCandidate.id) || selectedCandidate;
  }, [candidates, selectedCandidate]);

  if (!currentCandidate) return null;

  const nextStages = STAGES.filter(
    (stage) => stage !== currentCandidate.stage && stage !== "Rejected"
  );

  const close = () => {
    dispatch({ type: "SELECT_CANDIDATE", payload: null });
    setEditNotes(false);
    setNotesDraft("");
  };

  const saveNotes = async () => {
    await saveApplication(currentCandidate.id, { notes: notesDraft });
    setEditNotes(false);
  };

  const handleResume = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await saveApplication(currentCandidate.id, { resumeFile: file });
  };

  const handleExam = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await saveApplication(currentCandidate.id, { examResultFile: file });
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[580px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(event) => event.stopPropagation()}
      >
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
            <Avatar initials={currentCandidate.avatar} size="lg" className="!bg-white/25 shrink-0" />
            <div className="min-w-0">
              <h2 className={`${mob ? "text-[17px]" : "text-xl"} font-bold leading-snug`}>
                {currentCandidate.name}
              </h2>
              <p className="mt-1 text-[13px] opacity-90 font-medium">{currentCandidate.role}</p>
              <div className="text-[12px] opacity-80 mt-0.5">{currentCandidate.email}</div>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-5 py-5" : "px-6 py-6"} flex flex-col gap-5`}>
          <div className="flex justify-between items-center bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] px-4 py-3">
            <div>
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Stage
              </span>
              <Badge stage={currentCandidate.stage} />
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Rating
              </span>
              <Stars value={currentCandidate.rating} />
            </div>
          </div>

          <div className="bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] p-4">
            <div className={`grid ${mob ? "grid-cols-2" : "grid-cols-3"} gap-4`}>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                  Applied
                </span>
                <p className="mt-1 text-[13.5px] font-semibold">{currentCandidate.applied || "—"}</p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                  Source
                </span>
                <p className="mt-1 text-[13.5px] font-semibold">{currentCandidate.source}</p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                  Recruiter
                </span>
                <p className="mt-1 text-[13.5px] font-semibold text-[var(--color-primary)]">
                  {currentCandidate.recruiter || "—"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide">
                Notes
              </span>
              <button
                className="border border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                onClick={() => {
                  if (editNotes) {
                    void saveNotes();
                  } else {
                    setNotesDraft(currentCandidate.notes || "");
                    setEditNotes(true);
                  }
                }}
                disabled={isSaving}
              >
                <NoteIcon />
                {editNotes ? "Save" : "Edit"}
              </button>
            </div>
            {editNotes ? (
              <textarea
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] resize-y min-h-[80px] focus:border-[var(--color-primary)]"
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                placeholder="Add notes..."
                autoFocus
              />
            ) : (
              <div className="bg-[var(--color-notes-bg)] border border-[var(--color-notes-border)] rounded-[var(--radius-md)] p-3 min-h-[44px]">
                {currentCandidate.notes ? (
                  <p className="text-[13px] text-[var(--color-notes-text)] leading-relaxed whitespace-pre-wrap">
                    {currentCandidate.notes}
                  </p>
                ) : (
                  <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">No notes</p>
                )}
              </div>
            )}
          </div>

          <div>
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-2">
              Skills
            </span>
            <div className="flex gap-1.5 flex-wrap min-h-[28px]">
              {currentCandidate.tags.length > 0 ? (
                currentCandidate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[12px] font-semibold"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-[12.5px] text-[var(--color-text-placeholder)] italic">
                  Not available from backend yet
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-2">
              Resume
            </span>
            <div className="flex justify-between items-center mb-2">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(event) => void handleResume(event)}
              />
              <button
                className="border border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                onClick={() => fileRef.current?.click()}
                disabled={isSaving}
              >
                <UploadIcon />
                {mob ? "" : currentCandidate.resumeName ? "Replace" : "Upload"}
              </button>
            </div>
            {currentCandidate.resumeName ? (
              <div className="bg-[var(--color-surface-hover)] border border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3.5 py-2.5 flex items-center gap-2">
                <NoteIcon />
                <span className="text-[13px] font-medium flex-1 truncate">{currentCandidate.resumeName}</span>
                {currentCandidate.resumeUrl && (
                  <a
                    href={currentCandidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <DownloadIcon />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">No resume uploaded</p>
            )}
          </div>

          <div>
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-2">
              Exam Results
            </span>
            <div className="flex justify-between items-center mb-2">
              <input
                ref={examRef}
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,.png,.jpg"
                className="hidden"
                onChange={(event) => void handleExam(event)}
              />
              <button
                className="border border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                onClick={() => examRef.current?.click()}
                disabled={isSaving}
              >
                <UploadIcon />
                {mob ? "" : currentCandidate.examResultName ? "Replace" : "Upload"}
              </button>
            </div>
            {currentCandidate.examResultName ? (
              <div className="bg-[var(--color-exam-bg)] border border-[var(--color-exam-border)] rounded-[var(--radius-md)] px-3.5 py-2.5 flex items-center gap-2">
                <ClipboardIcon />
                <span className="text-[13px] font-medium flex-1 truncate">
                  {currentCandidate.examResultName}
                </span>
                {currentCandidate.examResultUrl && (
                  <a
                    href={currentCandidate.examResultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <DownloadIcon />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--color-text-placeholder)] italic">
                No exam results uploaded
              </p>
            )}
          </div>

          <div className="border-t border-[var(--color-surface-border)] pt-5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-3">
              Move Stage
            </span>
            <div className="flex gap-2 flex-wrap">
              {nextStages.map((stage) => (
                <button
                  key={stage}
                  className="rounded-[var(--radius-md)] px-3 py-1.5 text-[12px] font-semibold bg-transparent cursor-pointer transition-colors hover:bg-opacity-10"
                  style={{
                    border: `1.5px solid ${STAGE_COLORS[stage].dot}`,
                    color: STAGE_COLORS[stage].text,
                  }}
                  onClick={() => void moveApplicationStage(currentCandidate.id, stage)}
                  disabled={isSaving}
                >
                  {stage.replace("Interview", "Int.").replace("Departmental", "Dept.")}
                </button>
              ))}
              {currentCandidate.stage !== "Rejected" && (
                <button
                  className="border border-[var(--color-danger)] text-[var(--color-danger-dark)] rounded-[var(--radius-md)] px-3 py-1.5 text-[12px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-danger-bg)] transition-colors"
                  onClick={() => void moveApplicationStage(currentCandidate.id, "Rejected")}
                  disabled={isSaving}
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDrawer;
