import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./authContextValue";

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem("authToken")));

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem("authToken", nextToken);
    localStorage.setItem("authUser", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const hydrateProfile = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/profile");
        localStorage.setItem("authUser", JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        clearSession();
      } finally {
        setInitializing(false);
      }
    };

    hydrateProfile();
  }, [clearSession, token]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistSession(data.token, data.user);
    return data.user;
  }, [persistSession]);

  const login = useCallback(async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persistSession(data.token, data.user);
    return data.user;
  }, [persistSession]);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
    localStorage.setItem("authUser", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      register,
      login,
      updateProfile,
      logout,
    }),
    [user, token, initializing, register, login, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
