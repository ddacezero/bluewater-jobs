/**
 * App layout shell — sidebar navigation, topbar, React Router outlet, and global modals.
 * This is the only layout file — all page content is rendered via <Outlet>.
 */

import { useState, useRef, useEffect, type FC } from "react";
import { Routes, Route, NavLink, Outlet, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useMobile } from "./hooks/useMediaQuery";
import {
  DashIcon, PeopleIcon, BagIcon, PipeIcon, ChartIcon, PoolIcon,
  BellIcon, MenuIcon, XIcon, ChevIcon, SunIcon, MoonIcon,
} from "./components/icons";
import Avatar from "./components/Avatar";
import ScrollToTopButton from "./components/ScrollToTopButton";
import ProfileMenu from "./components/ProfileMenu";

// Pages
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Pipeline from "./pages/Pipeline";
import Jobs from "./pages/Jobs";
import Reports from "./pages/Reports";
import TalentPool from "./pages/TalentPool";

// Modals
import CandidateDrawer from "./modals/CandidateDrawer";
import PoolDrawer from "./modals/PoolDrawer";
import AddCandidateModal from "./modals/AddCandidateModal";
import JobModal from "./modals/JobModal";
import NotQualifiedModal from "./modals/NotQualifiedModal";

/* ─── Navigation Items ─── */

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: <DashIcon /> },
  { path: "/candidates", label: "Candidates", icon: <PeopleIcon /> },
  { path: "/pipeline", label: "Pipeline", icon: <PipeIcon /> },
  { path: "/jobs", label: "Jobs", icon: <BagIcon /> },
  { path: "/reports", label: "Reports", icon: <ChartIcon /> },
  { path: "/pool", label: "Talent Pool", icon: <PoolIcon /> },
];

/* ─── Sample Notifications ─── */

const NOTIFICATIONS = [
  { id: 1, msg: "John Cruz moved to Final Interview", time: "2 min ago", dot: "#1f75b9" },
  { id: 2, msg: "New applicant for Senior Dev role", time: "15 min ago", dot: "#16a34a" },
  { id: 3, msg: "Maria Santos accepted the job offer", time: "1 hr ago", dot: "#8e24aa" },
  { id: 4, msg: "3 candidates pending review", time: "2 hrs ago", dot: "#fb8c00" },
  { id: 5, msg: "Weekly hiring report is ready", time: "Today", dot: "#64748b" },
];

/* ─── Sidebar Content ─── */

interface SideContentProps {
  onClose?: () => void;
  onCollapse?: () => void;
}

const SideContent: FC<SideContentProps> = ({ onClose, onCollapse }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-[var(--color-surface-border)]">
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-gradient-end)] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
          BW
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-extrabold text-[15px] text-[var(--color-text-heading)] truncate">
            Bluewater Resorts
          </span>
          <span className="text-[10.5px] text-[var(--color-text-secondary)] font-medium">Jobs Portal</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] flex shrink-0"
          >
            <XIcon />
          </button>
        )}
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Collapse sidebar"
            className="ml-auto shrink-0 w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-bg)] hover:text-[var(--color-primary)] bg-transparent border-none cursor-pointer transition-colors duration-150"
          >
            <ChevIcon style={{ transform: "rotate(180deg)" }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="py-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((n) => (
          <NavLink
            key={n.path}
            to={n.path}
            end={n.path === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-3 my-0.5 rounded-[var(--radius-md)] cursor-pointer text-[13.5px] no-underline transition-all duration-200 ${
                isActive
                  ? "font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                  : "font-medium text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-bg)] hover:text-[var(--color-text-heading)]"
              }`
            }
          >
            {n.icon}
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile card — popup anchor */}
      <div
        ref={profileRef}
        className="relative px-4 py-3.5 border-t border-[var(--color-surface-border)]"
      >
        {profileOpen && (
          <ProfileMenu
            onClose={() => setProfileOpen(false)}
            onNavigate={onClose}
            // onLogout intentionally omitted — wire to auth API in next implementation
          />
        )}
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-bg)] transition-colors p-1 -m-1 cursor-pointer bg-transparent border-none"
        >
          <Avatar initials="AD" size="sm" />
          <div className="min-w-0 text-left">
            <div className="font-semibold text-[12.5px] text-[var(--color-text-heading)]">Admin</div>
            <div className="text-[10.5px] text-[var(--color-text-muted)]">HR Manager</div>
          </div>
        </button>
      </div>
    </>
  );
};

/* ─── Layout Shell ─── */

const Layout: FC = () => {
  const mob = useMobile();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      {!mob && (
        <div
          className={`${
            collapsed ? "w-[68px] min-w-[68px]" : "w-[256px] min-w-[256px]"
          } bg-[var(--color-surface)] border-r border-[var(--color-surface-border)] flex flex-col transition-all duration-300 overflow-hidden`}
        >
          {!collapsed ? (
            <SideContent onCollapse={() => setCollapsed(true)} />
          ) : (
            <>
              {/* Collapsed: only the logo is clickable to expand */}
              <div
                className="py-4 flex justify-center border-b border-[var(--color-surface-border)] cursor-pointer"
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
              >
                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-gradient-end)] flex items-center justify-center text-white font-extrabold text-sm">
                  BW
                </div>
              </div>
              <nav className="py-3 flex-1">
                {NAV_ITEMS.map((n) => (
                  <NavLink
                    key={n.path}
                    to={n.path}
                    end={n.path === "/"}
                    className={({ isActive }) =>
                      `flex justify-center py-3 mx-2 my-0.5 rounded-[var(--radius-md)] cursor-pointer no-underline transition-all duration-200 ${
                        isActive
                          ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : "text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-bg)]"
                      }`
                    }
                  >
                    {n.icon}
                  </NavLink>
                ))}
              </nav>
              <div className="py-3 border-t border-[var(--color-surface-border)] flex justify-center">
                <Avatar initials="AD" size="sm" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {mob && menuOpen && (
        <div className="fixed inset-0 z-200 flex">
          <div className="w-[280px] bg-[var(--color-surface)] flex flex-col shadow-[var(--shadow-sidebar)] z-10">
            <SideContent onClose={() => setMenuOpen(false)} />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Main Content — min-w-0 prevents flex child from overflowing its parent */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="bg-[var(--color-surface)] border-b border-[var(--color-surface-border)] px-6 py-3 flex items-center gap-4 shrink-0">
          {mob && (
            <button
              onClick={() => setMenuOpen(true)}
              className="bg-transparent border-none cursor-pointer text-[var(--color-primary)] flex p-1 shrink-0"
            >
              <MenuIcon />
            </button>
          )}

          {/* Spacer — pushes controls to right */}
          <div className="flex-1" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="cursor-pointer bg-transparent border-none p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-bg)] transition-colors text-[var(--color-text-muted)] shrink-0"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Notification bell */}
          <div ref={notifRef} className="relative shrink-0">
            <button
              onClick={() => setShowNotifs((v) => !v)}
              className="relative cursor-pointer bg-transparent border-none p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-bg)] transition-colors"
            >
              <BellIcon />
              <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-[var(--color-danger)] border-2 border-[var(--color-surface)]" />
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-[300px] bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] shadow-[var(--shadow-modal)] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-surface-border)] flex items-center justify-between">
                  <span className="font-semibold text-[13px] text-[var(--color-text-heading)]">
                    Notifications
                  </span>
                  <span className="text-[10px] font-bold bg-[var(--color-danger-bg)] text-[var(--color-danger)] px-2 py-0.5 rounded-full">
                    {NOTIFICATIONS.length} new
                  </span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 flex gap-3 items-start border-b border-[var(--color-surface-border-light)] hover:bg-[var(--color-surface-bg)] transition-colors cursor-pointer last:border-b-0"
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: n.dot }}
                      />
                      <div className="min-w-0">
                        <p className="text-[12.5px] text-[var(--color-text-primary)] leading-snug">
                          {n.msg}
                        </p>
                        <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div id="main-scroll" className={`flex-1 overflow-y-auto ${mob ? "p-4" : "px-8 py-7"}`}>
          <Outlet />
        </div>
      </div>

      {/* Scroll to top */}
      <ScrollToTopButton />

      {/* Global Modals */}
      <CandidateDrawer />
      <PoolDrawer />
      <AddCandidateModal />
      <JobModal />
      <NotQualifiedModal />
    </div>
  );
};

/* ─── App Root ─── */

const App: FC = () => (
  <ThemeProvider>
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="pool" element={<TalentPool />} />
          <Route path="profile" element={<div className="p-8 text-[var(--color-text-heading)] font-semibold text-lg">Profile — coming soon</div>} />
          <Route path="settings" element={<div className="p-8 text-[var(--color-text-heading)] font-semibold text-lg">Settings — coming soon</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  </ThemeProvider>
);

export default App;
