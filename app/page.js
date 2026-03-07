"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../components/Sidebar";
import BusinessPanel from "../components/BusinessPanel";
import AIChat from "../components/AIChat";
import AuthModal from "../components/AuthModal";
import SideDrawer from "../components/SideDrawer";
import AddBusinessModal from "../components/AddBusinessModal";
import axios from "axios";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const T = {
  en: { search:"Search places...", askAI:"✦ AI", signIn:"Sign In", places:"places", all:"All", cafes:"Cafes", restaurants:"Restaurants", sweets:"Sweets", street:"Street", nightlife:"Nightlife", shopping:"Shopping", loading:"LOADING MAP...", list:"List", map:"Map" },
  kn: { search:"ಸ್ಥಳ ಹುಡುಕಿ...", askAI:"✦ AI", signIn:"ಪ್ರವೇಶಿಸಿ", places:"ಸ್ಥಳಗಳು", all:"ಎಲ್ಲಾ", cafes:"ಕೆಫೆ", restaurants:"ರೆಸ್ಟೋರೆಂಟ್", sweets:"ಸಿಹಿ", street:"ಬೀದಿ", nightlife:"ರಾತ್ರಿ", shopping:"ಶಾಪಿಂಗ್", loading:"ನಕ್ಷೆ ಲೋಡ್...", list:"ಪಟ್ಟಿ", map:"ನಕ್ಷೆ" },
  hi: { search:"जगह खोजें...", askAI:"✦ AI", signIn:"साइन इन", places:"जगहें", all:"सभी", cafes:"कैफे", restaurants:"रेस्टोरेंट", sweets:"मिठाई", street:"स्ट्रीट", nightlife:"नाइटलाइफ", shopping:"शॉपिंग", loading:"लोड हो रहा है...", list:"सूची", map:"नक्शा" },
  ta: { search:"இடங்களை தேடுங்கள்...", askAI:"✦ AI", signIn:"உள்நுழை", places:"இடங்கள்", all:"அனைத்தும்", cafes:"கஃபே", restaurants:"உணவகம்", sweets:"இனிப்பு", street:"தெரு", nightlife:"இரவு", shopping:"ஷாப்பிங்", loading:"ஏற்றுகிறது...", list:"பட்டியல்", map:"வரைபடம்" },
};

export default function Home() {
  const [businesses, setBusinesses]   = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [category, setCategory]       = useState("all");
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [showAI, setShowAI]           = useState(false);
  const [aiActive, setAiActive]       = useState(false);
  const [showAuth, setShowAuth]       = useState(false);
  const [showDrawer, setShowDrawer]   = useState(false);
  const [showAddBiz, setShowAddBiz]   = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [lang, setLang]               = useState("en");
  const [mobileTab, setMobileTab]     = useState("map"); // "map" | "list"
  const [isMobile, setIsMobile]       = useState(false);

  const t = T[lang] || T.en;

  const CATEGORIES = [
    { key: "all",         label: t.all,         emoji: "✦" },
    { key: "cafe",        label: t.cafes,       emoji: "☕" },
    { key: "restaurant",  label: t.restaurants, emoji: "🍽" },
    { key: "sweet_shop",  label: t.sweets,      emoji: "🍮" },
    { key: "street_food", label: t.street,      emoji: "🌮" },
    { key: "nightlife",   label: t.nightlife,   emoji: "🍻" },
    { key: "shopping",    label: t.shopping,    emoji: "🛍" },
  ];

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("citylens_user");
    if (saved) setCurrentUser(JSON.parse(saved));
    const savedLang = localStorage.getItem("citylens_lang") || "en";
    setLang(savedLang);
  }, []);

  useEffect(() => {
    const handler = (e) => setLang(e.detail);
    window.addEventListener("citylens_lang_change", handler);
    return () => window.removeEventListener("citylens_lang_change", handler);
  }, []);

  useEffect(() => {
    const handler = () => setTimeout(() => setShowAddBiz(true), 150);
    window.addEventListener("citylens_add_business", handler);
    return () => window.removeEventListener("citylens_add_business", handler);
  }, []);

  useEffect(() => {
    axios.get(`${API}/api/businesses`)
      .then(res => { setBusinesses(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (aiActive) return;
    let r = businesses;
    if (category !== "all") r = r.filter(b => b.category === category);
    if (search.trim()) r = r.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(r);
  }, [category, search, businesses, aiActive]);

  const handleAIResults = (results) => { setFiltered(results); setAiActive(true); setShowAI(false); };
  const resetAI = () => { setAiActive(false); setFiltered(businesses); };
  const handleLogin = (user) => { setCurrentUser(user); localStorage.setItem("citylens_user", JSON.stringify(user)); };
  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem("citylens_user"); };
  const handleBusinessAdded = (newBiz) => { setBusinesses(prev => [...prev, newBiz]); setFiltered(prev => [...prev, newBiz]); setSelected(newBiz); };
  const handleSelect = (biz) => { setSelected(biz); if (isMobile) setMobileTab("map"); };

  const avatarColor = currentUser
    ? ["#c9a84c","#00d4aa","#ff6b6b","#a855f7","#4f9eff"][currentUser.name.charCodeAt(0) % 5]
    : "#c9a84c";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>

      {/* ── HEADER ── */}
      <header style={{
        height: isMobile ? "56px" : "62px",
        display: "flex", alignItems: "center",
        padding: isMobile ? "0 12px" : "0 16px",
        gap: isMobile ? "8px" : "12px",
        background: "rgba(8,8,16,0.95)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        position: "relative", zIndex: 100, flexShrink: 0,
      }}>

        {/* Hamburger */}
        <button onClick={() => setShowDrawer(true)} style={{
          width: 34, height: 34, flexShrink: 0,
          background: "var(--glass)", border: "1px solid var(--border)",
          borderRadius: "10px", cursor: "pointer",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "4px",
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: i===1?10:14, height: 1.5, background: "var(--text2)", borderRadius: 1 }} />
          ))}
        </button>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30,
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            borderRadius: "9px", fontSize: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(201,168,76,0.35)",
          }}>🌆</div>
          {!isMobile && (
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", lineHeight: 1 }}>CityLens</div>
              <div style={{ color: "var(--text3)", fontSize: "9px", letterSpacing: "0.12em" }}>BENGALURU</div>
            </div>
          )}
        </div>

        {!isMobile && <div style={{ width: 1, height: 26, background: "var(--border)", flexShrink: 0 }} />}

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: isMobile ? "100%" : "320px" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: "13px" }}>⌕</span>
          <input type="text" placeholder={t.search} value={search}
            onChange={e => { setSearch(e.target.value); setAiActive(false); }}
            style={{
              width: "100%", background: "var(--glass)",
              border: "1px solid var(--border)", borderRadius: "9px",
              padding: "8px 10px 8px 28px", color: "var(--text)", fontSize: "13px", outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "var(--gold)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>

        {/* AI button */}
        <button onClick={() => setShowAI(true)} style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          border: "1px solid rgba(201,168,76,0.3)", borderRadius: "9px",
          padding: isMobile ? "8px 10px" : "8px 13px",
          color: "var(--gold)", fontSize: "12px", fontWeight: 600,
          cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
        }}>{t.askAI}</button>

        {aiActive && (
          <button onClick={resetAI} style={{
            background: "transparent", border: "1px solid var(--border2)",
            borderRadius: "8px", padding: "7px 10px",
            color: "var(--text3)", fontSize: "11px", cursor: "pointer", flexShrink: 0,
          }}>✕</button>
        )}

        {/* Categories — desktop only in header */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "5px", overflowX: "auto", flex: 1 }}>
            {CATEGORIES.map(cat => {
              const active = category === cat.key && !aiActive;
              return (
                <button key={cat.key} onClick={() => { setCategory(cat.key); setAiActive(false); }} style={{
                  background: active ? "linear-gradient(135deg, var(--gold), var(--gold2))" : "var(--glass)",
                  border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                  borderRadius: "18px", padding: "5px 11px",
                  color: active ? "#080810" : "var(--text2)",
                  fontSize: "11px", fontWeight: active ? 700 : 400,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
                }}>{cat.emoji} {cat.label}</button>
              );
            })}
          </div>
        )}

        {/* Count — desktop only */}
        {!isMobile && (
          <div style={{
            background: "var(--glass)", border: "1px solid var(--border)",
            borderRadius: "18px", padding: "4px 10px",
            color: "var(--text3)", fontSize: "11px", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            {filtered.length} {t.places}
            {aiActive && <span style={{ color: "var(--gold)", marginLeft: "4px" }}>✦</span>}
          </div>
        )}

        {/* Auth */}
        {currentUser ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
            background: "var(--glass)", border: "1px solid var(--border2)",
            borderRadius: "18px", padding: "4px 10px 4px 4px",
            cursor: "pointer",
          }} onClick={() => setShowDrawer(true)}>
            <div style={{
              width: 24, height: 24,
              background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 800, color: "#fff",
            }}>{currentUser.name[0].toUpperCase()}</div>
            {!isMobile && <span style={{ color: "var(--text)", fontSize: "12px" }}>{currentUser.name.split(" ")[0]}</span>}
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            border: "none", borderRadius: "9px",
            padding: isMobile ? "8px 10px" : "8px 14px",
            color: "#080810", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
          }}>{t.signIn}</button>
        )}
      </header>

      {/* ── MOBILE: Category strip ── */}
      {isMobile && (
        <div style={{
          display: "flex", gap: "6px", overflowX: "auto", padding: "8px 12px",
          background: "rgba(8,8,16,0.9)", borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          scrollbarWidth: "none",
        }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.key && !aiActive;
            return (
              <button key={cat.key} onClick={() => { setCategory(cat.key); setAiActive(false); }} style={{
                background: active ? "linear-gradient(135deg, var(--gold), var(--gold2))" : "var(--glass)",
                border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                borderRadius: "18px", padding: "5px 12px",
                color: active ? "#080810" : "var(--text2)",
                fontSize: "12px", fontWeight: active ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}>{cat.emoji} {cat.label}</button>
            );
          })}
        </div>
      )}

      {/* ── MAIN ── */}
      {isMobile ? (
        // ── MOBILE LAYOUT ──
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Map — always rendered, hidden when list tab active */}
          <div style={{ position: "absolute", inset: 0, display: mobileTab === "map" ? "block" : "none" }}>
            {loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:"16px" }}>
                <div style={{ fontSize:"48px", animation:"pulse 1.5s infinite" }}>🌆</div>
                <p style={{ color:"var(--text3)", fontSize:"13px", letterSpacing:"0.1em" }}>{t.loading}</p>
              </div>
            ) : (
              <Map businesses={filtered} selected={selected} onSelect={handleSelect} />
            )}
          </div>

          {/* List — full screen when list tab active */}
          {mobileTab === "list" && (
            <div style={{ position: "absolute", inset: 0, overflowY: "auto", background: "var(--bg)" }}>
              <Sidebar businesses={filtered} selected={selected} onSelect={handleSelect} loading={loading} mobile />
            </div>
          )}

          {/* ── Bottom Tab Bar ── */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "58px",
            background: "rgba(8,8,16,0.97)", backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center",
            zIndex: 200, paddingBottom: "env(safe-area-inset-bottom)",
          }}>
            {/* Map tab */}
            <button onClick={() => setMobileTab("map")} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "3px", background: "none", border: "none", cursor: "pointer",
              color: mobileTab === "map" ? "var(--gold)" : "var(--text3)",
              paddingBottom: "4px",
            }}>
              <span style={{ fontSize: "18px" }}>🗺️</span>
              <span style={{ fontSize: "10px", fontWeight: mobileTab === "map" ? 700 : 400 }}>{t.map}</span>
            </button>

            {/* Center: Add business */}
            <button onClick={() => setShowAddBiz(true)} style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold), var(--gold2))",
              border: "3px solid var(--bg)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", flexShrink: 0,
              boxShadow: "0 4px 20px rgba(201,168,76,0.5)",
              marginBottom: "10px",
            }}>+</button>

            {/* List tab */}
            <button onClick={() => setMobileTab("list")} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "3px", background: "none", border: "none", cursor: "pointer",
              color: mobileTab === "list" ? "var(--gold)" : "var(--text3)",
              paddingBottom: "4px",
            }}>
              <span style={{ fontSize: "18px" }}>📋</span>
              <span style={{ fontSize: "10px", fontWeight: mobileTab === "list" ? 700 : 400 }}>{t.list}</span>
            </button>
          </div>
        </div>
      ) : (
        // ── DESKTOP LAYOUT ──
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar businesses={filtered} selected={selected} onSelect={setSelected} loading={loading} />
          <div style={{ flex: 1, position: "relative" }}>
            {loading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:"16px" }}>
                <div style={{ fontSize:"48px", animation:"pulse 1.5s infinite" }}>🌆</div>
                <p style={{ color:"var(--text3)", fontSize:"13px", letterSpacing:"0.1em" }}>{t.loading}</p>
              </div>
            ) : (
              <Map businesses={filtered} selected={selected} onSelect={setSelected} />
            )}
          </div>
        </div>
      )}

      {/* ── OVERLAYS ── */}
      <SideDrawer open={showDrawer} onClose={() => setShowDrawer(false)} currentUser={currentUser} onLogout={handleLogout} onLoginRequired={() => { setShowDrawer(false); setShowAuth(true); }} />
      {selected   && <BusinessPanel business={selected} onClose={() => setSelected(null)} currentUser={currentUser} onLoginRequired={() => setShowAuth(true)} />}
      {showAI     && <AIChat onResults={handleAIResults} onClose={() => setShowAI(false)} />}
      {showAuth   && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
      {showAddBiz && <AddBusinessModal onClose={() => setShowAddBiz(false)} onAdded={handleBusinessAdded} />}
    </div>
  );
}