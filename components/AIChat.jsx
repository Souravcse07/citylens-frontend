"use client";
const API = process.env.NEXT_PUBLIC_API_URL || `${API}`;
import { useState } from "react";
import axios from "axios";

const SUGGESTIONS = [
  "dosa", "cafe", "sweets", "biryani", "nightlife", "hidden gems", "budget food", "coffee",
];

export default function AIChat({ onResults, onClose }) {
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");
  const [useAI, setUseAI]     = useState(false);
  const [dots, setDots]       = useState("");

  const startDots = () => {
    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      setDots(".".repeat(count));
    }, 400);
    return interval;
  };

  const handleSearch = async (q, forceAI = false) => {
    const sq = (q || query).trim();
    if (!sq) return;
    setLoading(true); setError(""); setMessage("");
    const iv = startDots();
    try {
      const res = await axios.post(`${API}/api/ai/search`, {
        query: sq, useAI: forceAI || useAI,
      });
      setMessage(res.data.message);
      onResults(res.data.results);
    } catch { setError("Search failed. Try again."); }
    finally { clearInterval(iv); setLoading(false); setDots(""); }
  };

  const handleTrending = async () => {
    setLoading(true); setError(""); setMessage("");
    const iv = startDots();
    try {
      const res = await axios.get(`${API}/api/ai/trending`);
      setMessage(res.data.message); onResults(res.data.results);
    } catch { setError("Failed."); }
    finally { clearInterval(iv); setLoading(false); setDots(""); }
  };

  const handleHiddenGems = async () => {
    setLoading(true); setError(""); setMessage("");
    const iv = startDots();
    try {
      const res = await axios.get(`${API}/api/ai/hidden-gems`);
      setMessage(res.data.message); onResults(res.data.results);
    } catch { setError("Failed."); }
    finally { clearInterval(iv); setLoading(false); setDots(""); }
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        zIndex: 1100, backdropFilter: "blur(8px)",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px", maxWidth: "92vw",
        background: "var(--bg2, #0e0e1c)",
        border: "1px solid var(--border2)",
        borderRadius: "20px", zIndex: 1200,
        padding: "26px", animation: "fadeUp 0.3s ease",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "var(--glass)", border: "1px solid var(--border)",
          borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
          color: "var(--text2)", fontSize: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #1a1a2e, #16213e)",
            border: "1px solid rgba(201,168,76,0.4)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gold)", fontSize: "16px",
          }}>✦</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>
              Ask the City
            </div>
            <div style={{ color: "var(--text3)", fontSize: "10px", letterSpacing: "0.06em" }}>
              INSTANT SEARCH · BENGALURU
            </div>
          </div>

          {/* Deep AI toggle */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ color: "var(--text3)", fontSize: "10px", letterSpacing: "0.05em" }}>DEEP AI</span>
            <button onClick={() => setUseAI(!useAI)} style={{
              width: 36, height: 20, borderRadius: "10px",
              background: useAI ? "var(--gold)" : "var(--border2)",
              border: "none", cursor: "pointer", position: "relative",
              transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 2,
                left: useAI ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%",
                background: "white", transition: "left 0.2s",
              }} />
            </button>
          </div>
        </div>

        {/* AI warning */}
        {useAI && (
          <div style={{
            padding: "8px 12px", borderRadius: "8px", marginBottom: "12px",
            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)",
            color: "var(--gold)", fontSize: "11px",
          }}>⚡ Deep AI on — uses Ollama locally, may take 10–30s</div>
        )}

        {/* Search */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder={useAI ? "Ask anything AI-powered..." : "Search instantly..."}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            autoFocus
            style={{
              flex: 1,
              background: "var(--glass)",
              border: "1px solid var(--border2)",
              borderRadius: "10px",
              padding: "11px 14px",
              color: "var(--text)",
              fontSize: "13px",
              outline: "none",
              fontFamily: "var(--font-body)",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--gold)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          />
          <button onClick={() => handleSearch()} disabled={loading} style={{
            background: loading ? "var(--border2)" : "linear-gradient(135deg, var(--gold), var(--gold2))",
            border: "none", borderRadius: "10px",
            padding: "11px 16px",
            color: loading ? "var(--text3)" : "#080810",
            fontSize: "12px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap", letterSpacing: "0.04em",
            minWidth: "90px", transition: "all 0.2s",
          }}>
            {loading ? `Searching${dots}` : "SEARCH"}
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {[
            { label: "▲ Trending", fn: handleTrending },
            { label: "◈ Hidden Gems", fn: handleHiddenGems },
          ].map(btn => (
            <button key={btn.label} onClick={btn.fn} disabled={loading} style={{
              flex: 1, padding: "9px",
              background: "var(--glass)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text2)",
              fontSize: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
            >{btn.label}</button>
          ))}
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ color: "var(--text3)", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>
            QUICK SEARCH
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); handleSearch(s); }}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "20px", padding: "5px 12px",
                  color: "var(--text2)", fontSize: "11px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Result / Error */}
        {message && (
          <div style={{
            padding: "10px 14px", borderRadius: "8px",
            background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)",
            color: "var(--teal)", fontSize: "12px",
          }}>✓ {message}</div>
        )}
        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: "8px",
            background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)",
            color: "var(--coral)", fontSize: "12px",
          }}>⚠ {error}</div>
        )}
      </div>
    </>
  );
}