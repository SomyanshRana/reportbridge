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

  useEffect(() => {
    axios.get(`${API}/auth/me`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      setUser(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: fmtErr(e.response?.data?.detail) || e.message };
    }
  }, []);

  const register = useCallback(async (email, name, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/register`, { email, name, password }, { withCredentials: true });
      setUser(data);
      return { success: true };
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
