import type { FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import Avatar from "../components/Avatar";
import { XIcon } from "../components/icons";

const NotQualifiedModal: FC = () => {
  const { state, dispatch, moveApplicationStage } = useApp();
  const mob = useMobile();

  const { nqCandidate, isSaving } = state;
  if (!nqCandidate) return null;

  const close = () => {
    dispatch({ type: "SET_NQ_CANDIDATE", payload: null });
  };

  const confirmReject = async () => {
    await moveApplicationStage(nqCandidate.id, "Rejected");
    close();
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[460px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`bg-gradient-to-br from-[var(--color-nq-gradient-start)] via-[var(--color-nq-gradient-mid)] to-[var(--color-nq-gradient-end)] ${
            mob ? "px-5 py-5" : "px-6 py-6"
          } text-white relative`}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-none rounded-[var(--radius-md)] p-1.5 cursor-pointer text-white flex transition-colors"
          >
            <XIcon />
          </button>
          <div className="flex items-center gap-3.5">
            <Avatar initials={nqCandidate.avatar} size="md" className="!bg-white/25" />
            <div>
              <h3 className="text-[15px] font-bold">Reject Application</h3>
              <p className="mt-0.5 text-[13px] opacity-90">
                {nqCandidate.name} — {nqCandidate.role}
              </p>
            </div>
          </div>
        </div>

        <div className={`${mob ? "px-5 py-5" : "px-6 py-6"}`}>
          <p className="mb-5 text-[13px] text-[var(--color-text-subtle)] leading-relaxed">
            This will move the application to the <strong>Rejected</strong> stage. This flow is API-backed and stays within the current jobs, candidates, and pipeline scope.
          </p>
          <div className="flex gap-2.5 justify-end">
            <button
              className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="bg-[var(--color-danger)] text-white rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer disabled:opacity-50 hover:bg-[var(--color-danger-dark)] transition-colors"
              disabled={isSaving}
              onClick={() => void confirmReject()}
            >
              {isSaving ? "Saving..." : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotQualifiedModal;
