import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await auth.login(username);
      navigate(from, { replace: true });
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginBox">
        <h2 style={{ margin: "0 0 12px 0" }}>QuickChat Login</h2>

        <div className="small" style={{ marginBottom: 10 }}>
          Enter any username (no password for now).
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username (e.g., deba)"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading || !username.trim()}>
            {loading ? "..." : "Login"}
          </button>
        </form>

        {err && <div className="error">{err}</div>}
      </div>
    </div>
  );
}
