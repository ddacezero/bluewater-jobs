/**
 * AuthContext — manages JWT auth state (tokens + user) across the app.
 * Persists access/refresh tokens to localStorage.
 */

import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from "react";

const API_BASE = "http://localhost:8000/api/auth";

interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchMe(token)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  const fetchMe = async (token: string): Promise<UserInfo> => {
    const res = await fetch(`${API_BASE}/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  };

  const login = async (email: string, password: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        Object.values(data)?.[0] ||
        "Login failed. Please check your credentials.";
      throw new Error(String(message));
    }

    const { access, refresh } = await res.json();
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    const me = await fetchMe(access);
    setUser(me);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
