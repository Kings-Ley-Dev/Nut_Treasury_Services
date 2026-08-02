import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to persist token & update API authorization headers
  const persist = useCallback((token, userData) => {
    localStorage.setItem("nut_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  }, []);

  // Restore session on first load
  useEffect(() => {
    const token = localStorage.getItem("nut_token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Set the token on the API client before fetching user profile
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api
      .get("/auth/me")
      .then((res) => {
        const userData = res.data?.user || res.data;
        setUser(userData);
      })
      .catch(() => {
        // Clear broken/expired sessions
        localStorage.removeItem("nut_token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((token, userData) => {
    persist(token, userData);
  }, [persist]);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    const userData = data?.user || data;
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async (email, password) => {
    // Relative to Axios baseURL (e.g., '/auth/login' resolving to '/api/v1/auth/login')
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
    return data;
  }, [persist]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persist(data.token, data.user);
    return data;
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem("nut_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setSession, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}; 
