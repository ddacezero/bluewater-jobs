/**
 * App layout shell — sidebar navigation, topbar, React Router outlet, and global modals.
 * This is the only layout file — all page content is rendered via <Outlet>.
 */

import { useState, type FC } from "react";
import { Routes, Route, NavLink, Outlet, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { useMobile } from "./hooks/useMediaQuery";
import {
  DashIcon, PeopleIcon, BagIcon, PipeIcon, ChartIcon, PoolIcon,
  SearchIcon, BellIcon, MenuIcon, XIcon,
} from "./components/icons";
import Avatar from "./components/Avatar";

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

/* ─── Sidebar Content ─── */

interface SideContentProps {
  onClose?: () => void;
}

const SideContent: FC<SideContentProps> = ({ onClose }) => (
  <>
    <div className="px-6 py-5 flex items-center gap-3 border-b border-[var(--color-surface-border)]">
      <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-gradient-end)] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
        BW
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-extrabold text-[15px] text-[var(--color-text-heading)] whitespace-nowrap">
          Bluewater Resorts
        </span>
        <span className="text-[10.5px] text-[var(--color-text-secondary)] font-medium">Jobs Portal</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-auto bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] flex">
          <XIcon />
        </button>
      )}
    </div>
    <nav className="py-2.5 flex-1">
      {NAV_ITEMS.map((n) => (
        <NavLink
          key={n.path}
          to={n.path}
          end={n.path === "/"}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-5.5 py-2.5 mx-2.5 my-0.5 rounded-[var(--radius-md)] cursor-pointer text-[13.5px] no-underline transition-all duration-200 ${
              isActive
                ? "font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                : "font-medium text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-bg)]"
            }`
          }
        >
          {n.icon}
          <span>{n.label}</span>
        </NavLink>
      ))}
    </nav>
    <div className="px-5 py-3.5 border-t border-[var(--color-surface-border)] flex items-center gap-2.5">
      <Avatar initials="AD" size="sm" />
      <div>
        <div className="font-semibold text-[12.5px]">Admin</div>
        <div className="text-[10.5px] text-[var(--color-text-muted)]">HR Manager</div>
      </div>
    </div>
  </>
);

/* ─── Layout Shell ─── */

const Layout: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      {!mob && (
        <div
          className={`${collapsed ? "w-[72px] min-w-[72px]" : "w-[260px] min-w-[260px]"} bg-white border-r border-[var(--color-surface-border)] flex flex-col transition-all duration-300 overflow-hidden`}
        >
          <div className="cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
            {!collapsed ? (
              <SideContent />
            ) : (
              <div className="px-4 py-5 flex justify-center">
                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-gradient-end)] flex items-center justify-center text-white font-extrabold text-sm">
                  BW
                </div>
              </div>
            )}
          </div>
          {collapsed && (
            <nav className="py-2.5 flex-1">
              {NAV_ITEMS.map((n) => (
                <NavLink
                  key={n.path}
                  to={n.path}
                  end={n.path === "/"}
                  className={({ isActive }) =>
                    `flex justify-center py-3 mx-2.5 my-0.5 rounded-[var(--radius-md)] cursor-pointer no-underline ${
                      isActive
                        ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]"
                        : "text-[var(--color-text-subtle)]"
                    }`
                  }
                >
                  {n.icon}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {mob && menuOpen && (
        <div className="fixed inset-0 z-200 flex">
          <div className="w-[280px] bg-white flex flex-col shadow-[var(--shadow-sidebar)] z-10">
            <SideContent onClose={() => setMenuOpen(false)} />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className={`bg-white border-b border-[var(--color-surface-border)] ${mob ? "px-4 py-2.5" : "px-8 py-3.5"} flex items-center justify-between gap-3`}>
          {mob && (
            <button onClick={() => setMenuOpen(true)} className="bg-transparent border-none cursor-pointer text-[var(--color-primary)] flex p-1">
              <MenuIcon />
            </button>
          )}
          <div className="flex items-center gap-2 bg-[#F1F7FB] border-[1.5px] border-[var(--color-surface-muted)] rounded-[var(--radius-md)] px-3.5 py-2 flex-1 max-w-[300px]">
            <SearchIcon />
            <input
              className="border-none outline-none bg-transparent text-sm text-[var(--color-text-primary)] w-full font-[inherit]"
              placeholder="Search..."
              value={state.search}
              onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
            />
          </div>
          <div className="relative cursor-pointer">
            <BellIcon />
            <span className="absolute -top-1 -right-1 w-[7px] h-[7px] rounded-full bg-[var(--color-danger)] border-2 border-white" />
          </div>
        </div>

        {/* Page Content */}
        <div className={`flex-1 overflow-auto ${mob ? "p-4" : "p-6 px-8"}`}>
          <Outlet />
        </div>
      </div>

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
  <AppProvider>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="reports" element={<Reports />} />
        <Route path="pool" element={<TalentPool />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </AppProvider>
);

export default App;
