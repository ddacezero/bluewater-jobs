/**
 * Candidate Drawer — full candidate detail modal with skill/notes editing,
 * resume/exam upload, stage mover, and endorse functionality.
 */

import { useState, useRef, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { STAGES, STAGE_COLORS } from "../data/constants";
import Badge from "../components/Badge";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import {
  XIcon, TagIcon, NoteIcon, TrophyIcon, UploadIcon, DownloadIcon,
  EndorseIcon, ClipboardIcon,
} from "../components/icons";

const CandidateDrawer: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();

  const [endorseJob, setEndorseJob] = useState("");
  const [showEndorse, setShowEndorse] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [editSkills, setEditSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [editTalents, setEditTalents] = useState(false);
  const [newTalent, setNewTalent] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const examRef = useRef<HTMLInputElement>(null);

  const { selectedCandidate: selC, candidates, jobs } = state;
  if (!selC) return null;

  const c = candidates.find((x) => x.id === selC.id) || selC;
  const activeJobs = jobs.filter((j) => j.status === "Active");
  const nextStages = STAGES.filter((s) => s !== c.stage && s !== "Rejected");
  const otherJobs = activeJobs.filter((j) => j.id !== c.jobId);

  const close = () => {
    dispatch({ type: "SELECT_CANDIDATE", payload: null });
    setShowEndorse(false);
    setEndorseJob("");
    setEditNotes(false);
    setEditSkills(false);
    setEditTalents(false);
    setNewTalent("");
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { tags: [...c.tags, newSkill.trim()] } } });
    setNewSkill("");
  };

  const rmSkill = (t: string) => {
    dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { tags: c.tags.filter((x) => x !== t) } } });
  };

  const addTalent = () => {
    if (!newTalent.trim()) return;
    dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { talents: [...(c.talents || []), newTalent.trim()] } } });
    setNewTalent("");
  };

  const rmTalent = (t: string) => {
    dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { talents: (c.talents || []).filter((x) => x !== t) } } });
  };

  const saveNotes = () => {
    dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { notes: notesDraft } } });
    setEditNotes(false);
  };

  const handleResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { resumeName: f.name } } });
  };

  const handleExam = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) dispatch({ type: "UPDATE_CANDIDATE", payload: { id: c.id, updates: { examResultName: f.name } } });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(15,30,50,0.45)] backdrop-blur-[4px]" style={mob ? { alignItems: "flex-end" } : {}} onClick={close}>
      <div className={`${mob ? "w-full rounded-t-[18px]" : "w-[560px] rounded-[18px]"} max-h-[92vh] bg-white overflow-auto shadow-[var(--shadow-modal)]`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`bg-gradient-to-br from-[#1F75B9] via-[#3498DB] to-[#B6D6EB] ${mob ? "px-4.5 py-5" : "px-6.5 py-7"} text-white relative`}>
          <button onClick={close} className="absolute top-3 right-3 bg-white/20 border-none rounded-lg p-1.5 cursor-pointer text-white flex">
            <XIcon />
          </button>
          <div className="flex items-center gap-3.5">
            <Avatar initials={c.avatar} size="lg" className="!bg-white/25" />
            <div>
              <h2 className={`${mob ? "text-[17px]" : "text-xl"} font-bold`}>{c.name}</h2>
              <p className="mt-1 text-[13px] opacity-90">{c.role}</p>
              <div className="text-xs opacity-85">{c.email}</div>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-4.5 py-4" : "px-6.5 py-5"}`}>
          {/* Stage & Rating */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[11px] text-[var(--color-text-secondary)]">Stage</span>
              <div className="mt-1"><Badge stage={c.stage} /></div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[var(--color-text-secondary)]">Rating</span>
              <div className="mt-1"><Stars value={c.rating} /></div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] p-3.5 mb-3.5">
            <div className={`grid ${mob ? "grid-cols-2" : "grid-cols-3"} gap-3`}>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase">Applied</span>
                <p className="mt-1 text-[13px] font-semibold">{c.applied}</p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase">Source</span>
                <p className="mt-1 text-[13px] font-semibold">{c.source}</p>
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase">Recruiter</span>
                <p className="mt-1 text-[13px] font-semibold text-[var(--color-primary)]">{c.recruiter || "—"}</p>
              </div>
            </div>
          </div>

          {/* Endorsed From */}
          {c.endorsedFrom && (
            <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary-gradient-end)] rounded-[var(--radius-md)] p-2.5 mb-3.5 text-xs text-[var(--color-primary)] flex items-center gap-1">
              <EndorseIcon /> Endorsed from <strong>{c.endorsedFrom}</strong>
            </div>
          )}

          {/* Skills */}
          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold uppercase">Skills</span>
              <button className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer" onClick={() => setEditSkills(!editSkills)}>
                <TagIcon />{editSkills ? "Done" : "Edit"}
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {c.tags.map((t) => (
                <span key={t} className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1">
                  {t}
                  {editSkills && <span className="cursor-pointer font-extrabold text-[var(--color-danger-dark)]" onClick={() => rmSkill(t)}>×</span>}
                </span>
              ))}
              {!c.tags.length && !editSkills && <span className="text-xs text-[var(--color-text-placeholder)]">None</span>}
            </div>
            {editSkills && (
              <div className="flex gap-1.5 mt-1.5">
                <input className="flex-1 px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" placeholder="Add skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }} />
                <button className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold cursor-pointer" onClick={addSkill}>Add</button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold uppercase">Notes</span>
              <button className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer" onClick={() => { if (editNotes) { saveNotes(); } else { setNotesDraft(c.notes || ""); setEditNotes(true); } }}>
                <NoteIcon />{editNotes ? "Save" : "Edit"}
              </button>
            </div>
            {editNotes ? (
              <textarea className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit] resize-y min-h-[70px]" value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Add notes..." autoFocus />
            ) : (
              <div className="bg-[var(--color-notes-bg)] border border-[var(--color-notes-border)] rounded-[var(--radius-md)] p-2.5 min-h-9">
                {c.notes ? <p className="text-xs text-[var(--color-notes-text)] leading-relaxed whitespace-pre-wrap">{c.notes}</p> : <p className="text-xs text-[var(--color-text-placeholder)] italic">No notes</p>}
              </div>
            )}
          </div>

          {/* Talents / Hobbies */}
          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold uppercase">Talents / Hobbies / Sports</span>
              <button className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer" onClick={() => setEditTalents(!editTalents)}>
                <TrophyIcon />{editTalents ? "Done" : "Edit"}
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(c.talents || []).map((t) => (
                <span key={t} className="bg-[var(--color-purple-light)] text-[#7B1FA2] rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1">
                  {t}
                  {editTalents && <span className="cursor-pointer font-extrabold text-[var(--color-danger-dark)]" onClick={() => rmTalent(t)}>×</span>}
                </span>
              ))}
              {!(c.talents || []).length && !editTalents && <span className="text-xs text-[var(--color-text-placeholder)]">None</span>}
            </div>
            {editTalents && (
              <div className="flex gap-1.5 mt-1.5">
                <input className="flex-1 px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]" placeholder="Add talent, hobby, or sport..." value={newTalent} onChange={(e) => setNewTalent(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTalent(); }} />
                <button className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold cursor-pointer" onClick={addTalent}>Add</button>
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="mb-3.5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold uppercase block mb-1.5">Resume</span>
            <div className="flex items-center gap-2 flex-wrap">
              {c.resumeName ? (
                <div className="bg-[var(--color-surface-hover)] border border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3 py-1.5 flex items-center gap-1.5 flex-1 min-w-0">
                  <NoteIcon />
                  <span className="text-xs font-medium flex-1 truncate">{c.resumeName}</span>
                  <button className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-semibold cursor-pointer"><DownloadIcon /></button>
                </div>
              ) : (
                <span className="text-xs text-[var(--color-text-placeholder)] flex-1">No resume</span>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResume} />
              <button className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer" onClick={() => fileRef.current?.click()}>
                <UploadIcon />{mob ? "" : "Replace"}
              </button>
            </div>
          </div>

          {/* Exam Results */}
          <div className="mb-3.5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold uppercase block mb-1.5">Exam Results</span>
            <div className="flex items-center gap-2 flex-wrap">
              {c.examResultName ? (
                <div className="bg-[var(--color-exam-bg)] border border-[var(--color-exam-border)] rounded-[var(--radius-md)] px-3 py-1.5 flex items-center gap-1.5 flex-1 min-w-0">
                  <ClipboardIcon />
                  <span className="text-xs font-medium flex-1 truncate">{c.examResultName}</span>
                  <button className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-semibold cursor-pointer"><DownloadIcon /></button>
                </div>
              ) : (
                <span className="text-xs text-[var(--color-text-placeholder)] flex-1">No exam results</span>
              )}
              <input ref={examRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.png,.jpg" className="hidden" onChange={handleExam} />
              <button className="border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold inline-flex items-center gap-1 bg-transparent cursor-pointer" onClick={() => examRef.current?.click()}>
                <UploadIcon />{mob ? "" : "Upload"}
              </button>
            </div>
          </div>

          {/* Move Stage */}
          <div className="border-t border-[var(--color-surface-border)] pt-3.5 mb-3.5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold block mb-2 uppercase">Move Stage</span>
            <div className="flex gap-1.5 flex-wrap">
              {nextStages.map((s) => (
                <button
                  key={s}
                  className="rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold bg-transparent cursor-pointer"
                  style={{ border: `1.5px solid ${STAGE_COLORS[s].dot}`, color: STAGE_COLORS[s].text }}
                  onClick={() => dispatch({ type: "MOVE_STAGE", payload: { id: c.id, stage: s } })}
                >
                  {s.replace("Interview", "Int.").replace("Departmental", "Dept.")}
                </button>
              ))}
              {c.stage !== "Rejected" && (
                <button
                  className="border-[1.5px] border-[var(--color-danger)] text-[var(--color-danger-dark)] rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold bg-transparent cursor-pointer"
                  onClick={() => dispatch({ type: "MOVE_STAGE", payload: { id: c.id, stage: "Rejected" } })}
                >
                  Reject
                </button>
              )}
            </div>
          </div>

          {/* Endorse */}
          <div className="border-t border-[var(--color-surface-border)] pt-3.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-semibold uppercase">Endorse</span>
              <button
                className={`${showEndorse ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-btn)]" : "border-[1.5px] border-[var(--color-surface-muted)] text-[var(--color-primary)] bg-transparent"} rounded-[var(--radius-md)] px-3 py-1 text-xs font-semibold cursor-pointer`}
                onClick={() => setShowEndorse(!showEndorse)}
              >
                {showEndorse ? "Cancel" : "Endorse"}
              </button>
            </div>
            {showEndorse && (
              <div className="bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] p-3">
                <div className={`flex gap-2 ${mob ? "flex-col" : ""}`}>
                  <select value={endorseJob} onChange={(e) => setEndorseJob(e.target.value)} className="flex-1 px-3.5 py-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-surface-muted)] text-[13.5px] outline-none font-[inherit]">
                    <option value="">Select job...</option>
                    {otherJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                  <button
                    className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-4.5 py-2 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer disabled:opacity-50"
                    disabled={!endorseJob}
                    onClick={() => {
                      if (endorseJob) {
                        dispatch({ type: "ENDORSE_CANDIDATE", payload: { candidate: c, jobId: Number(endorseJob) } });
                        setEndorseJob("");
                        setShowEndorse(false);
                      }
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDrawer;
