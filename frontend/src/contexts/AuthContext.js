import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

export const AuthContext = createContext(null);

function fmtErr(detail) {
  if (!detail) return "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    axios.get(`${API}/auth/me`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Global 401 interceptor — silently refresh token before failing
  useEffect(() => {
    const id = axios.interceptors.response.use(
      r => r,
      async err => {
        const cfg = err.config;
        // Don't retry auth endpoints or already-retried requests
        if (
          err.response?.status === 401 &&
          !cfg._retried &&
          !cfg.url?.includes("/auth/")
        ) {
          cfg._retried = true;
          try {
            await axios.post(`${API}/auth/refresh`, {}, { withCredentials: true });
            return axios(cfg);
          } catch {
            setUser(null);
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []); // eslint-disable-line

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      // If user hasn't seen demo yet and has a demo report, queue the redirect
      if (!data.has_seen_demo && data.demo_report_id) {
        sessionStorage.setItem("onboarding_demo_report", data.demo_report_id);
      }
      setUser(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: fmtErr(e.response?.data?.detail) || e.message };
    }
  }, []);

  const register = useCallback(async (email, name, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/register`, { email, name, password }, { withCredentials: true });
      // Store demo redirect BEFORE setUser so PublicRoute -> /app transition picks it up in AppDashboard
      if (data.demo_report_id) {
        sessionStorage.setItem("onboarding_demo_report", data.demo_report_id);
      }
      setUser(data);
      return { success: true, demo_report_id: data.demo_report_id };
    } catch (e) {
      return { success: false, error: fmtErr(e.response?.data?.detail) || e.message };
    }
  }, []);

  const logout = useCallback(async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
