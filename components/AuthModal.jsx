"use client";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { useState } from "react";
import axios from "axios";

export default function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "signup") {
        const res = await axios.post(`${API}/api/users/register`, form);
        setSuccess("Welcome to CityLens! 🎉");
        setTimeout(() => { onLogin(res.data.user); onClose(); }, 900);
      } else {
        const res = await axios.post(`${API}/api/users/login`, { email: form.email, password: form.password });
        setSuccess(`Welcome back, ${res.data.user.name}!`);
        setTimeout(() => { onLogin(res.data.user); onClose(); }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGLoading(true); setError("");
    try {
      const { auth, googleProvider } = await import("../lib/firebase");
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, googleProvider);
      const { displayName, email } = result.user;
      const password = `google_${email}_cl2024`;

      // Try login first, if not found then register
      try {
        const res = await axios.post(`${API}/api/users/login`, { email, password });
        setSuccess(`Welcome back, ${displayName}!`);
        setTimeout(() => { onLogin(res.data.user); onClose(); }, 800);
      } catch (loginErr) {
        // Not registered yet — register now
        if (loginErr.response?.status === 404) {
          const res = await axios.post(`${API}/api/users/register`, {
            name: displayName, email, password,
          });
          setSuccess(`Welcome to CityLens, ${displayName}! 🎉`);
          setTimeout(() => { onLogin(res.data.user); onClose(); }, 800);
        } else {
          throw loginErr;
        }
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // user closed popup — do nothing
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup blocked — allow popups for this site and try again.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Google sign in failed. Please try email instead.");
      }
    } finally { setGLoading(false); }
  };

  const inp = {
    width: "100%", background: "#f8f8f8",
    border: "1.5px solid #e8e8e8", borderRadius: "12px",
    padding: "13px 14px", color: "#111", fontSize: "14px",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 1100, backdropFilter: "blur(6px)",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "420px", maxWidth: "94vw",
        maxHeight: "92vh", overflowY: "auto",
        background: "#ffffff", borderRadius: "24px",
        zIndex: 1200, padding: "32px 28px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        animation: "fadeUp 0.3s ease",
      }}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "#f5f5f5", border: "none",
          borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
          color: "#666", fontSize: "16px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: 56, height: 56, margin: "0 auto 12px",
            background: "linear-gradient(135deg, #c9a84c, #a07830)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
          }}>🌆</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#111", marginBottom: "4px" }}>
            {mode === "login" ? "Welcome back" : "Join CityLens"}
          </div>
          <div style={{ color: "#888", fontSize: "13px" }}>
            {mode === "login" ? "Sign in to your account" : "Create your free account"}
          </div>
        </div>

        {/* Google Button */}
        <button onClick={handleGoogle} disabled={gLoading} style={{
          width: "100%", padding: "13px", marginBottom: "16px",
          background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: "12px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          cursor: gLoading ? "wait" : "pointer",
          fontSize: "14px", fontWeight: 600, color: "#333",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "box-shadow 0.2s",
          opacity: gLoading ? 0.7 : 1,
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"}
        >
          {gLoading ? (
            <span style={{ fontSize: "14px" }}>⏳ Opening Google...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
          <span style={{ color: "#bbb", fontSize: "12px" }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex", background: "#f5f5f5",
          borderRadius: "12px", padding: "4px", marginBottom: "20px",
        }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "10px",
              background: mode === m ? "#fff" : "transparent",
              border: "none", borderRadius: "10px",
              color: mode === m ? "#111" : "#888",
              fontSize: "13px", fontWeight: mode === m ? 700 : 400,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mode === "signup" && (
            <input type="text" name="name" placeholder="Full name"
              value={form.name} onChange={handleChange} style={inp}
              onFocus={e => { e.target.style.borderColor = "#c9a84c"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.background = "#f8f8f8"; }}
            />
          )}
          <input type="email" name="email" placeholder="Email address"
            value={form.email} onChange={handleChange} style={inp}
            onFocus={e => { e.target.style.borderColor = "#c9a84c"; e.target.style.background = "#fff"; }}
            onBlur={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.background = "#f8f8f8"; }}
          />
          <input type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={inp}
            onFocus={e => { e.target.style.borderColor = "#c9a84c"; e.target.style.background = "#fff"; }}
            onBlur={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.background = "#f8f8f8"; }}
          />
        </div>

        {error && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "10px", background: "#fff2f2", border: "1px solid #ffd0d0", color: "#e53e3e", fontSize: "13px" }}>⚠ {error}</div>}
        {success && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "10px", background: "#f0fff4", border: "1px solid #c6f6d5", color: "#276749", fontSize: "13px" }}>✓ {success}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: "20px", padding: "14px",
          background: loading ? "#e0e0e0" : "linear-gradient(135deg, #c9a84c, #a07830)",
          border: "none", borderRadius: "12px",
          color: loading ? "#999" : "#fff",
          fontSize: "14px", fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 16px rgba(201,168,76,0.4)",
        }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginTop: "16px" }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ color: "#c9a84c", cursor: "pointer", fontWeight: 600 }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </>
  );
}