"use client";
const API = process.env.NEXT_PUBLIC_API_URL || `${API}`;
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
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: 52, height: 52, margin: "0 auto 14px",
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            borderRadius: "15px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px",
            boxShadow: "0 0 30px rgba(201,168,76,0.3)",
          }}>🌆</div>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "22px",
            fontWeight: 700, color: "var(--text)", marginBottom: "4px",
          }}>
            {mode === "login" ? "Welcome back" : "Join CityLens"}
          </div>
          <div style={{ color: "var(--text3)", fontSize: "12px" }}>
            {mode === "login" ? "Sign in to your account" : "Create your free account"}
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.03)",
          borderRadius: "10px", padding: "4px",
          border: "1px solid var(--border)", marginBottom: "24px",
        }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "9px",
              background: mode === m ? "linear-gradient(135deg, var(--gold), var(--gold2))" : "transparent",
              border: "none", borderRadius: "8px",
              color: mode === m ? "#080810" : "var(--text2)",
              fontSize: "12px", fontWeight: mode === m ? 700 : 400,
              cursor: "pointer", transition: "all 0.2s",
              letterSpacing: "0.04em",
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

        {error && (
          <div style={{
            marginTop: "12px", padding: "10px 14px", borderRadius: "8px",
            background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)",
            color: "var(--coral)", fontSize: "12px",
          }}>⚠ {error}</div>
        )}
        {success && (
          <div style={{
            marginTop: "12px", padding: "10px 14px", borderRadius: "8px",
            background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)",
            color: "var(--teal)", fontSize: "12px",
          }}>✓ {success}</div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: "20px", padding: "13px",
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