/**
 * ProfileMenu — popup that appears above the sidebar profile card.
 * Rendered by SideContent; outside-click is handled via a ref in the parent.
 *
 * Props:
 *   onClose    — closes this menu
 *   onNavigate — optional, also closes the mobile sidebar overlay on navigation
 *   onLogout   — stub hook for auth API; no-op until auth is implemented
 */

import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PersonIcon } from "./icons";

interface ProfileMenuProps {
  onClose: () => void;
  onNavigate?: () => void;
  onLogout?: () => void;
}

const ProfileMenu: FC<ProfileMenuProps> = ({ onClose, onNavigate, onLogout }) => {
  const navigate = useNavigate();

  const go = (path: string) => {
    navigate(path);
    onClose();
    onNavigate?.();
  };

  const handleLogout = () => {
    onLogout?.(); // hook point — wire to POST /api/auth/logout/ when auth is ready
    onClose();
  };

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-surface-border)] py-1 z-50"
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.10)" }}
    >
      {/* Profile */}
      <button
        onClick={() => go("/profile")}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-bg)] transition-colors bg-transparent border-none cursor-pointer text-left"
      >
        <PersonIcon className="text-[var(--color-text-muted)] shrink-0" style={{ width: 16, height: 16 }} />
        Profile
      </button>

      {/* Settings */}
      <button
        onClick={() => go("/settings")}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-bg)] transition-colors bg-transparent border-none cursor-pointer text-left"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)] shrink-0">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.66 5.34l1.41-1.41" />
        </svg>
        Settings
      </button>

      {/* Divider */}
      <div className="my-1 h-px bg-[var(--color-surface-border)]" />

      {/* Logout — stub; wire onLogout to auth API in the next implementation */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-surface-bg)] transition-colors bg-transparent border-none cursor-pointer text-left"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
};

export default ProfileMenu;
