"use client";
import { useState, useEffect } from "react";

const THEMES = [
  { key: "dark",   label: "Midnight", bg: "#080810", surface: "#0d0d1a", accent: "#c9a84c" },
  { key: "carbon", label: "Carbon",   bg: "#0a0a0a", surface: "#111111", accent: "#00d4aa" },
  { key: "navy",   label: "Deep Navy",bg: "#050d1a", surface: "#0a1628", accent: "#4f9eff" },
  { key: "light",  label: "Light",    bg: "#f5f3ee", surface: "#ffffff", accent: "#c9a84c" },
];

const LANGUAGES = [
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "kn", label: "ಕನ್ನಡ",    flag: "🇮🇳" },
  { key: "hi", label: "हिंदी",     flag: "🇮🇳" },
  { key: "ta", label: "தமிழ்",    flag: "🇮🇳" },
];

export default function SideDrawer({ open, onClose, currentUser, onLogout, onLoginRequired }) {
  const [activeSection, setActiveSection] = useState(null);
  const [theme, setTheme]     = useState("dark");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedTheme = localStorage.getItem("citylens_theme") || "dark";
    const savedLang  = localStorage.getItem("citylens_lang")  || "en";
    setTheme(savedTheme);
    setLanguage(savedLang);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (key) => {
    const t = THEMES.find(t => t.key === key) || THEMES[0];
    const isLight = key === "light";
    const r = document.documentElement.style;

    // Core backgrounds
    r.setProperty("--bg",       t.bg);
    r.setProperty("--bg2",      t.surface);
    r.setProperty("--surface",  t.surface);
    r.setProperty("--surface2", isLight ? "#ece9e2" : "#13131f");

    // Accent / gold
    r.setProperty("--gold",     t.accent);
    r.setProperty("--gold2",    isLight ? t.accent : t.accent + "cc");

    // Text — strong contrast in light mode
    r.setProperty("--text",     isLight ? "#111118" : "#f0ede8");
    r.setProperty("--text2",    isLight ? "#333340" : "#a09a90");
    r.setProperty("--text3",    isLight ? "#666672" : "#5a5550");
    r.setProperty("--muted",    isLight ? "#888896" : "#5a5550");

    // Borders
    r.setProperty("--border",   isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)");
    r.setProperty("--border2",  isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.14)");

    // Glass surfaces — visible in light mode
    r.setProperty("--glass",    isLight ? "rgba(0,0,0,0.06)"  : "rgba(255,255,255,0.04)");
    r.setProperty("--glass2",   isLight ? "rgba(0,0,0,0.10)"  : "rgba(255,255,255,0.07)");

    // Browser native elements (inputs, selects, scrollbars)
    document.documentElement.style.colorScheme = isLight ? "light" : "dark";

    // Body
    document.body.style.background = t.bg;
    document.body.style.color      = isLight ? "#111118" : "#f0ede8";

    // data-theme attribute for CSS targeting
    document.body.setAttribute("data-theme", key);
  };

  const handleTheme = (key) => {
    setTheme(key);
    localStorage.setItem("citylens_theme", key);
    applyTheme(key);
  };

  const handleLanguage = (key) => {
    setLanguage(key);
    localStorage.setItem("citylens_lang", key);
    window.dispatchEvent(new CustomEvent("citylens_lang_change", { detail: key }));
  };

  const menuItems = [
    { key: "profile",  icon: "◉", label: "My Profile"   },
    { key: "add",      icon: "＋", label: "Add Business" },
    { key: "settings", icon: "◈", label: "Settings"      },
    { key: "about",    icon: "◎", label: "About"         },
  ];

  // Avatar color based on name
  const avatarColor = currentUser
    ? ["#c9a84c","#00d4aa","#ff6b6b","#a855f7","#4f9eff"][
        currentUser.name.charCodeAt(0) % 5
      ]
    : "#c9a84c";

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)", zIndex: 900,
          backdropFilter: "blur(4px)",
        }} />
      )}

      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: "300px",
        background: "var(--bg2, #0a0a16)",
        borderRight: "1px solid var(--border2)",
        zIndex: 1000,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: open ? "20px 0 60px rgba(0,0,0,0.5)" : "none",
      }}>

        {/* Top section */}
        <div style={{
          padding: "28px 20px 20px",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(180deg, rgba(201,168,76,0.06) 0%, transparent 100%)",
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "var(--glass)", border: "1px solid var(--border)",
            borderRadius: "50%", width: 28, height: 28,
            cursor: "pointer", color: "var(--text2)", fontSize: "13px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{
              width: 36, height: 36,
              background: `linear-gradient(135deg, var(--gold), var(--gold2))`,
              borderRadius: "10px", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(201,168,76,0.3)",
            }}>🌆</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)" }}>CityLens</div>
              <div style={{ color: "var(--text3)", fontSize: "9px", letterSpacing: "0.14em" }}>BENGALURU</div>
            </div>
          </div>

          {/* User card */}
          {currentUser ? (
            <div style={{
              background: "var(--glass)", border: "1px solid var(--border2)",
              borderRadius: "14px", padding: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Avatar with initial */}
                <div style={{
                  width: 46, height: 46,
                  background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
                  borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", fontWeight: 800,
                  color: "#fff",
                  boxShadow: `0 0 16px ${avatarColor}55`,
                  fontFamily: "var(--font-display)",
                }}>
                  {currentUser.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>
                    {currentUser.name}
                  </div>
                  <div style={{ color: "var(--text3)", fontSize: "11px", marginTop: "2px" }}>
                    {currentUser.email}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: "var(--glass)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "14px", textAlign: "center",
            }}>
              <div style={{ color: "var(--text3)", fontSize: "12px", marginBottom: "10px" }}>
                Sign in to add businesses & reviews
              </div>
              <button onClick={() => { onClose(); onLoginRequired(); }} style={{
                width: "100%", padding: "9px",
                background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                border: "none", borderRadius: "8px",
                color: "#080810", fontSize: "12px", fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.04em",
              }}>SIGN IN</button>
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
          {menuItems.map((item) => (
            <div key={item.key}>
              <button
                onClick={() => setActiveSection(activeSection === item.key ? null : item.key)}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: activeSection === item.key ? "rgba(201,168,76,0.08)" : "transparent",
                  border: "none", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  color: activeSection === item.key ? "var(--gold)" : "var(--text2)",
                  fontSize: "13px", cursor: "pointer", transition: "all 0.2s", marginBottom: "2px",
                }}
                onMouseEnter={e => { if (activeSection !== item.key) e.currentTarget.style.background = "var(--glass)"; }}
                onMouseLeave={e => { if (activeSection !== item.key) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "16px", width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{
                  fontSize: "10px", color: "var(--text3)",
                  transform: activeSection === item.key ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}>▶</span>
              </button>

              {activeSection === item.key && (

                /* PROFILE */
                item.key === "profile" ? (
                  <div style={{ padding: "8px 14px 14px 46px" }}>
                    {currentUser ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[{ label: "Name", value: currentUser.name }, { label: "Email", value: currentUser.email }].map(r => (
                          <div key={r.label} style={{
                            background: "var(--glass)", border: "1px solid var(--border)",
                            borderRadius: "8px", padding: "10px 12px",
                          }}>
                            <div style={{ color: "var(--text3)", fontSize: "10px", letterSpacing: "0.08em" }}>{r.label.toUpperCase()}</div>
                            <div style={{ color: "var(--text)", fontSize: "13px", marginTop: "3px" }}>{r.value}</div>
                          </div>
                        ))}
                        <button onClick={() => { onLogout(); onClose(); }} style={{
                          marginTop: "4px", padding: "9px",
                          background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)",
                          borderRadius: "8px", color: "#ff6b6b", fontSize: "12px", cursor: "pointer",
                        }}>Sign Out</button>
                      </div>
                    ) : (
                      <p style={{ color: "var(--text3)", fontSize: "12px" }}>Sign in to view profile.</p>
                    )}
                  </div>

                /* ADD BUSINESS */
                ) : item.key === "add" ? (
                  <div style={{ padding: "8px 14px 14px 46px" }}>
                    <p style={{ color: "var(--text3)", fontSize: "12px", lineHeight: 1.6, marginBottom: "10px" }}>
                      Own a café, restaurant, or shop in Bengaluru? Add it to the map for free!
                    </p>
                    <button onClick={() => {
                      if (!currentUser) {
                        onClose();
                        setTimeout(() => onLoginRequired && onLoginRequired(), 100);
                        return;
                      }
                      // Fire event first, then close drawer
                      window.dispatchEvent(new CustomEvent("citylens_add_business"));
                      setTimeout(() => onClose(), 100);
                    }} style={{
                      width: "100%", padding: "10px",
                      background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                      border: "none", borderRadius: "8px",
                      color: "#080810", fontSize: "12px", fontWeight: 700,
                      cursor: "pointer", letterSpacing: "0.04em",
                    }}>+ ADD YOUR BUSINESS</button>
                  </div>

                /* SETTINGS */
                ) : item.key === "settings" ? (
                  <div style={{ padding: "8px 14px 14px 46px", display: "flex", flexDirection: "column", gap: "18px" }}>

                    {/* Theme */}
                    <div>
                      <div style={{ color: "var(--text3)", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>APP THEME</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {THEMES.map(t => (
                          <button key={t.key} onClick={() => handleTheme(t.key)} style={{
                            padding: "9px 10px",
                            background: theme === t.key ? "rgba(201,168,76,0.1)" : "var(--glass)",
                            border: `1px solid ${theme === t.key ? "var(--gold)" : "var(--border)"}`,
                            borderRadius: "8px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "8px",
                          }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: "50%",
                              background: t.key === "light"
                                ? "linear-gradient(135deg, #f5f3ee, #ffffff)"
                                : t.accent,
                              border: t.key === "light" ? "1px solid #ccc" : "none",
                              boxShadow: theme === t.key ? `0 0 8px ${t.accent}` : "none",
                            }} />
                            <span style={{ color: theme === t.key ? "var(--gold)" : "var(--text2)", fontSize: "11px" }}>
                              {t.label}
                            </span>
                            {theme === t.key && <span style={{ marginLeft: "auto", color: "var(--gold)", fontSize: "10px" }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <div style={{ color: "var(--text3)", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>LANGUAGE</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {LANGUAGES.map(l => (
                          <button key={l.key} onClick={() => handleLanguage(l.key)} style={{
                            padding: "9px 12px",
                            background: language === l.key ? "rgba(201,168,76,0.1)" : "var(--glass)",
                            border: `1px solid ${language === l.key ? "var(--gold)" : "var(--border)"}`,
                            borderRadius: "8px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "10px", textAlign: "left",
                          }}>
                            <span style={{ fontSize: "16px" }}>{l.flag}</span>
                            <span style={{ color: language === l.key ? "var(--gold)" : "var(--text2)", fontSize: "12px", fontWeight: language === l.key ? 600 : 400 }}>
                              {l.label}
                            </span>
                            {language === l.key && <span style={{ marginLeft: "auto", color: "var(--gold)", fontSize: "12px" }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                /* ABOUT */
                ) : item.key === "about" ? (
                  <div style={{ padding: "8px 14px 14px 46px" }}>
                    <div style={{ background: "var(--glass)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>CityLens</div>
                      <p style={{ color: "var(--text3)", fontSize: "12px", lineHeight: 1.7 }}>
                        Discover the best of Bengaluru — cafes, restaurants, street food, nightlife and more. Powered by AI and built with ❤️ for the city.
                      </p>
                      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text3)", fontSize: "11px" }}>Version 1.0</span>
                        <span style={{ color: "var(--gold)", fontSize: "11px" }}>Bengaluru, India</span>
                      </div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", color: "var(--text3)", fontSize: "11px", textAlign: "center" }}>
          Made with ❤️ for Bengaluru
        </div>
      </div>
    </>
  );
}