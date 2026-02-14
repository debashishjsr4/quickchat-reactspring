import React, { createContext, useContext, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import { clearToken, setToken } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() =>
    localStorage.getItem("qc_token"),
  );
  const [username, setUsername] = useState(() =>
    localStorage.getItem("qc_user"),
  );

  const login = async (u) => {
    const usernameNorm = (u || "").trim().toLowerCase();
    const res = await authApi.login(usernameNorm);

    if (!res.ok) throw new Error(res.data?.message || "Login failed");

    // your backend: { username, token }
    const jwt = res.data?.token;
    const name = res.data?.username ?? usernameNorm;

    localStorage.setItem("qc_user", name);
    setToken(jwt);

    setUsername(name);
    setTokenState(jwt);
  };

  const logout = () => {
    clearToken();
    setUsername(null);
    setTokenState(null);
  };

  const value = useMemo(
    () => ({
      token,
      username,
      isAuthed: !!token,
      login,
      logout,
    }),
    [token, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
