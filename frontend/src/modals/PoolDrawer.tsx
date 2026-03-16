/**
 * Pool Drawer — talent pool candidate detail + reactivation into active jobs.
 */

import { useState, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import Badge from "../components/Badge";
import Stars from "../components/Stars";
import Avatar from "../components/Avatar";
import { XIcon, RedoIcon } from "../components/icons";
import { updateCandidate } from "../api/candidates";

const PoolDrawer: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();
  const [loading, setLoading] = useState(false);

  const { selectedCandidate: selPool } = state;
  // Only render for pooled candidates
  if (!selPool || !selPool.is_pooled) return null;

  const c = selPool;

  const initials = (c.application?.name ?? "Unknown")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const close = () => {
    dispatch({ type: "SELECT_CANDIDATE", payload: null });
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const apiResponse = await updateCandidate(c.id, { is_pooled: false });
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

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[520px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-br from-[#6A1B9A] via-[#8E24AA] to-[#CE93D8] ${
            mob ? "px-5 py-5" : "px-7 py-6"
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
                {c.application?.name ?? "Unknown"}
              </h2>
              <p className="mt-1 text-[13px] opacity-90 font-medium">From: {c.job?.title ?? "—"}</p>
              <div className="text-[12px] opacity-80 mt-0.5">{c.application?.email ?? ""}</div>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-5 py-5" : "px-7 py-6"} flex flex-col gap-5`}>
          {/* Stage & Rating */}
          <div className="flex justify-between items-center bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] px-4 py-3">
            <div>
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Last Stage
              </span>
              <Badge stage={c.stage} />
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Rating
              </span>
              <Stars value={c.rating} />
            </div>
          </div>

          {/* Notes */}
          {c.notes && (
            <div className="bg-[var(--color-notes-bg)] border border-[var(--color-notes-border)] rounded-[var(--radius-md)] p-3.5">
              <p className="text-[13px] text-[var(--color-notes-text)] leading-relaxed">{c.notes}</p>
            </div>
          )}

          {/* Reactivate */}
          <div className="border-t border-[var(--color-surface-border)] pt-5">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wide block mb-3">
              Reactivate Candidate
            </span>
            <div className={`flex gap-2.5 ${mob ? "flex-col" : ""}`}>
              <button
                className="bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 hover:bg-[var(--color-btn-primary-hover)] transition-colors"
                disabled={loading}
                onClick={handleReactivate}
              >
                <RedoIcon /> {loading ? "Reactivating..." : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDrawer;
