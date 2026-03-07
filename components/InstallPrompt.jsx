"use client";
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [prompt, setPrompt]     = useState(null); // deferred install event
  const [show, setShow]         = useState(false);
  const [isIOS, setIsIOS]       = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true) {
      setInstalled(true);
      return;
    }

    // Check if user previously dismissed
    if (localStorage.getItem("citylens_install_dismissed")) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
                !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // iOS doesn't support beforeinstallprompt — show manual guide after 3s
      setTimeout(() => setShow(true), 3000);
      return;
    }

    // Android / Chrome — listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShow(false);
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("citylens_install_dismissed", "1");
  };

  if (!show || installed || dismissed) return null;

  return (
    <>
      {/* Backdrop blur */}
      <div
        onClick={handleDismiss}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
          zIndex: 2000,
          animation: "fadeIn 0.3s ease",
        }}
      />

      {/* Install card — slides up from bottom */}
      <div style={{
        position: "fixed", left: 16, right: 16, bottom: 24,
        background: "linear-gradient(135deg, #0d0d1a, #12121f)",
        border: "1px solid rgba(201,168,76,0.35)",
        borderRadius: 24,
        padding: "20px 20px 24px",
        zIndex: 2100,
        boxShadow: "0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)",
        animation: "slideUpIn 0.4s cubic-bezier(0.32,0.72,0,1)",
      }}>
        {/* Gold glow accent */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #c9a84c22, #c9a84c0a)",
            border: "1px solid rgba(201,168,76,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>🏙️</div>
          <div>
            <div style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: 18, fontWeight: 700,
              color: "var(--text, #fff)", marginBottom: 3,
            }}>Install CityLens</div>
            <div style={{ color: "var(--text3, #888)", fontSize: 12 }}>
              Add to home screen for the full experience
            </div>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              marginLeft: "auto", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%", width: 28, height: 28,
              color: "var(--text3, #888)", fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {["⚡ Instant load", "📴 Works offline", "🗺️ No browser bar", "🔔 Notifications"].map(f => (
            <div key={f} style={{
              background: "rgba(201,168,76,0.07)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 20, padding: "5px 11px",
              color: "var(--text2, #ccc)", fontSize: 11,
            }}>{f}</div>
          ))}
        </div>

        {/* CTA */}
        {isIOS ? (
          <div>
            <div style={{
              background: "rgba(79,158,255,0.08)",
              border: "1px solid rgba(79,158,255,0.2)",
              borderRadius: 14, padding: "14px 16px", marginBottom: 12,
            }}>
              <div style={{ color: "#4f9eff", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                How to install on iPhone / iPad:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: "1️⃣", text: 'Tap the Share button  ⬆  at the bottom of Safari' },
                  { icon: "2️⃣", text: 'Scroll down and tap "Add to Home Screen"' },
                  { icon: "3️⃣", text: 'Tap "Add" — CityLens appears on your home screen!' },
                ].map(s => (
                  <div key={s.icon} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ color: "var(--text2, #ccc)", fontSize: 12, lineHeight: 1.5 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleDismiss} style={{
              width: "100%", padding: "13px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              borderRadius: 12, color: "var(--text2, #ccc)",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Got it!</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleDismiss} style={{
              flex: 1, padding: "13px",
              background: "transparent",
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              borderRadius: 12, color: "var(--text3, #888)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Not now</button>
            <button onClick={handleInstall} style={{
              flex: 2, padding: "13px",
              background: "linear-gradient(135deg, #c9a84c, #a8893e)",
              border: "none", borderRadius: 12,
              color: "#080810", fontSize: 14, fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span>📲</span> Install App
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUpIn {
          from { transform: translateY(100px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}