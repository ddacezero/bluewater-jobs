/**
 * Login page — full-screen blurred background with centered auth card.
 * Authenticates via POST /api/auth/login/ and redirects to /dashboard.
 */

import { useState, type FC } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { listJobs } from "../api/jobs";

const Login: FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect declaratively (avoids side-effect during render)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // After auth succeeds, fetch any API-persisted jobs before showing the dashboard
      try {
        const apiJobs = await listJobs();
        dispatch({ type: "SET_API_JOBS", payload: apiJobs });
      } catch {
        // Non-fatal — seeded jobs remain visible if API jobs can't be loaded
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-2xl text-[13.5px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none transition-all duration-200";

  const inputStyle = {
    background: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(255,255,255,0.75)",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-primary)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31,117,185,0.14)";
    e.currentTarget.style.background = "rgba(255,255,255,0.82)";
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.75)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = "rgba(255,255,255,0.65)";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Full-page loading overlay — shown while logging in and fetching initial data */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.30)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{
              border: "3px solid rgba(31,117,185,0.20)",
              borderTopColor: "#1f75b9",
            }}
          />
        </div>
      )}
      {/* Blurred background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/login-signup-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
          transform: "scale(1.06)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-4 rounded-2xl p-10 flex flex-col items-center"
        style={{
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
          border: "1px solid rgba(255, 255, 255, 0.55)",
        }}
      >
        {/* Logo */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base mb-6"
          style={{
            background: "linear-gradient(135deg, #1f75b9 0%, #4fa8d8 100%)",
            boxShadow: "0 4px 12px rgba(31, 117, 185, 0.35)",
          }}
        >
          BW
        </div>

        <h1 className="font-extrabold text-[28px] text-[var(--color-text-heading)] leading-tight text-center mb-1">
          Jobs at Bluewater Resorts
        </h1>
        <p className="text-[var(--color-text-secondary)] text-[14px] mb-8 text-center">
          Applicant Tracking System
        </p>

        {error && (
          <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] text-[13px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputBase}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputBase}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-[14.5px] tracking-wide mt-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 border-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: "linear-gradient(135deg, #1f75b9 0%, #4fa8d8 100%)",
              boxShadow: "0 4px 18px rgba(31, 117, 185, 0.45)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 8px 24px rgba(31,117,185,0.55)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 4px 18px rgba(31,117,185,0.45)")
            }
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-[var(--color-text-secondary)]">
          Not yet registered?{" "}
          <Link to="/signup" className="text-[var(--color-primary)] font-semibold no-underline hover:underline">
            Signup Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
