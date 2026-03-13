/**
 * Glassmorphic toast notification system.
 * Toasts stack on the right edge of the screen and auto-dismiss after 4 s.
 * Colors: green = success (create), blue = info (edit), red = error (delete/failure).
 */

import { useEffect, type FC } from "react";
import { useApp } from "../context/AppContext";
import type { Toast } from "../data/types";

/* ─── Per-variant visual config ─── */

const STYLES: Record<
  Toast["variant"],
  { bg: string; border: string; iconBg: string; textColor: string; icon: string }
> = {
  success: {
    bg: "rgba(22, 163, 74, 0.13)",
    border: "rgba(22, 163, 74, 0.38)",
    iconBg: "#16a34a",
    textColor: "#15803d",
    icon: "✓",
  },
  error: {
    bg: "rgba(220, 38, 38, 0.13)",
    border: "rgba(220, 38, 38, 0.38)",
    iconBg: "#dc2626",
    textColor: "#b91c1c",
    icon: "✕",
  },
  info: {
    bg: "rgba(31, 117, 185, 0.13)",
    border: "rgba(31, 117, 185, 0.38)",
    iconBg: "#1f75b9",
    textColor: "#1558a0",
    icon: "✓",
  },
};

/* ─── Single toast item ─── */

const ToastItem: FC<{ toast: Toast }> = ({ toast }) => {
  const { dispatch } = useApp();
  const s = STYLES[toast.variant];

  // Auto-dismiss after 4 s — dispatch inlined to avoid stale closure on dismiss ref
  useEffect(() => {
    const t = setTimeout(
      () => dispatch({ type: "REMOVE_TOAST", payload: toast.id }),
      4000
    );
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-2xl min-w-[280px] max-w-[360px] animate-fade-in"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        backdropFilter: "blur(18px) saturate(180%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
      }}
    >
      {/* Icon badge */}
      <span
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
        style={{ background: s.iconBg }}
      >
        {s.icon}
      </span>

      {/* Message */}
      <p
        className="flex-1 text-[13px] font-medium leading-snug"
        style={{ color: s.textColor }}
      >
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={() => dispatch({ type: "REMOVE_TOAST", payload: toast.id })}
        className="shrink-0 text-[17px] leading-none mt-[-1px] cursor-pointer border-none bg-transparent opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: s.textColor }}
      >
        ×
      </button>
    </div>
  );
};

/* ─── Container — mounted globally in App.tsx ─── */

export const ToastContainer: FC = () => {
  const { state } = useApp();
  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      <div className="flex flex-col gap-2.5 pointer-events-auto">
        {state.toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </div>
  );
};
