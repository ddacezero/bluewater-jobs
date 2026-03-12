/**
 * Signup page — full-screen blurred background with centered auth card.
 * Registers via POST /api/auth/register/ and redirects to login on success.
 */

import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:8000/api/auth";

const ROLES = [
  { value: "", label: "Select your role" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "talent_acquisition_specialist", label: "Talent Acquisition Specialist" },
  { value: "talent_acquisition_manager", label: "Talent Acquisition Manager" },
];

const Signup: FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in — go straight to dashboard
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          role,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.role?.[0] ||
          data?.non_field_errors?.[0] ||
          data?.detail ||
          "Signup failed. Please try again.";
        throw new Error(String(message));
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
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

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--color-primary)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31,117,185,0.14)";
    e.currentTarget.style.background = "rgba(255,255,255,0.82)";
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.75)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = "rgba(255,255,255,0.65)";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-8">
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
        className="relative z-10 w-full max-w-[480px] mx-4 rounded-2xl p-10 flex flex-col items-center"
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
          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                First Name
              </label>
              <input
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl text-[13.5px] outline-none appearance-none transition-all duration-200 cursor-pointer"
                style={{
                  ...inputStyle,
                  color: role ? "var(--color-text-primary)" : "var(--color-text-placeholder)",
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} disabled={r.value === ""}>
                    {r.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
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
              minLength={8}
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
            {loading ? "Creating account…" : "Signup"}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <Link to="/" className="text-[var(--color-primary)] font-semibold no-underline hover:underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
