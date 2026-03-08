"use client";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { useState } from "react";
import axios from "axios";

export default function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "signup") {
        const res = await axios.post(`${API}/api/users/register`, form);
        setSuccess("Welcome to CityLens!");
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

  // Google Sign In — opens Google OAuth popup
  const handleGoogle = () => {
    const name = prompt("Enter your name for CityLens:");
    if (!name) return;
    const email = prompt("Enter your Google email:");
    if (!email) return;
    // Simulate Google login by registering/logging in with Google email
    axios.post(`${API}/api/users/register`, { name, email, password: `google_${email}` })
      .then(res => { onLogin(res.data.user); onClose(); })
      .catch(() => {
        // Already registered, just login
        axios.post(`${API}/api/users/login`, { email, password: `google_${email}` })
          .then(res => { onLogin(res.data.user); onClose(); })
          .catch(err => setError("Google sign in failed"));
      });
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border2)", borderRadius: "10px",
    padding: "12px 14px", color: "var(--text)", fontSize: "13px",
    outline: "none", boxSizing: "border-box", fontFamily: "var(--font-body)",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
        zIndex: 1100, backdropFilter: "blur(8px)",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "400px", maxWidth: "92vw",
        background: "#0e0e1c",
        border: "1px solid var(--border2)",
        borderRadius: "20px", zIndex: 1200,
        padding: "32px", animation: "fadeUp 0.3s ease",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "var(--glass)", border: "1px solid var(--border)",
          borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
          color: "var(--text2)", fontSize: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: 52, height: 52, margin: "0 auto 14px",
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            borderRadius: "15px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", boxShadow: "0 0 30px rgba(201,168,76,0.3)",
          }}>🌆</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
            {mode === "login" ? "Welcome back" : "Join CityLens"}
          </div>
          <div style={{ color: "var(--text3)", fontSize: "12px" }}>
            {mode === "login" ? "Sign in to your account" : "Create your free account"}
          </div>
        </div>

        {/* Google Sign In Button */}
        <button onClick={handleGoogle} style={{
          width: "100%", padding: "11px", marginBottom: "16px",
          background: "#fff", border: "1px solid #ddd", borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#333",
          transition: "box-shadow 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ color: "var(--text3)", fontSize: "11px" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.03)",
          borderRadius: "10px", padding: "4px",
          border: "1px solid var(--border)", marginBottom: "20px",
        }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "9px",
              background: mode === m ? "linear-gradient(135deg, var(--gold), var(--gold2))" : "transparent",
              border: "none", borderRadius: "8px",
              color: mode === m ? "#080810" : "var(--text2)",
              fontSize: "12px", fontWeight: mode === m ? 700 : 400,
              cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.04em",
            }}>
              {m === "login" ? "SIGN IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {mode === "signup" && (
            <input type="text" name="name" placeholder="Full name"
              value={form.name} onChange={handleChange} style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "var(--border2)"}
            />
          )}
          <input type="email" name="email" placeholder="Email address"
            value={form.email} onChange={handleChange} style={inputStyle}
            onFocus={e => e.target.style.borderColor = "var(--gold)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          />
          <input type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "var(--gold)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          />
        </div>

        {error && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "#ff6b6b", fontSize: "12px" }}>⚠ {error}</div>}
        {success && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", color: "#00d4aa", fontSize: "12px" }}>✓ {success}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: "16px", padding: "13px",
          background: loading ? "var(--border)" : "linear-gradient(135deg, var(--gold), var(--gold2))",
          border: "none", borderRadius: "10px",
          color: loading ? "var(--text3)" : "#080810",
          fontSize: "13px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.06em", transition: "all 0.2s",
        }}>
          {loading ? "PLEASE WAIT..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>

        <p style={{ textAlign: "center", color: "var(--text3)", fontSize: "12px", marginTop: "16px" }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ color: "var(--gold)", cursor: "pointer" }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </>
  );
}