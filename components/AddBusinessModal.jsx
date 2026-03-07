"use client";
const API = process.env.NEXT_PUBLIC_API_URL || `${API}`;
import { useState } from "react";
import axios from "axios";

const CATEGORIES = [
  { key: "cafe",        label: "Cafe",        emoji: "☕" },
  { key: "restaurant",  label: "Restaurant",  emoji: "🍽" },
  { key: "sweet_shop",  label: "Sweet Shop",  emoji: "🍮" },
  { key: "street_food", label: "Street Food", emoji: "🌮" },
  { key: "nightlife",   label: "Nightlife",   emoji: "🍻" },
  { key: "shopping",    label: "Shopping",    emoji: "🛍" },
];

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    badge: null,
    color: "#00d4aa",
    desc: "Get listed instantly",
    features: ["✅ Listed in category","✅ Visible on map","✅ Ratings & reviews","❌ No priority placement","❌ No featured badge","❌ No AI search boost"],
  },
  {
    key: "premium",
    name: "Premium",
    price: 499,
    badge: "MOST POPULAR",
    color: "#c9a84c",
    desc: "Get discovered by more people",
    features: ["✅ Listed in category","✅ Visible on map","✅ Ratings & reviews","✅ Priority placement","✅ ⭐ Featured badge","✅ AI search boost"],
  },
  {
    key: "elite",
    name: "Elite",
    price: 1299,
    badge: "MAX REACH",
    color: "#a78bfa",
    desc: "Dominate your category",
    features: ["✅ Listed in category","✅ Visible on map","✅ Ratings & reviews","✅ #1 Priority placement","✅ 👑 Elite crown badge","✅ AI top result"],
  },
];

const UPI_APPS = [
  { id: "gpay",    name: "Google Pay", emoji: "🟦", color: "#4285F4" },
  { id: "phonepe", name: "PhonePe",    emoji: "🟣", color: "#5f259f" },
  { id: "paytm",   name: "Paytm",      emoji: "🔵", color: "#00BAF2" },
  { id: "upi",     name: "Other UPI",  emoji: "🏦", color: "#888"    },
];

export default function AddBusinessModal({ onClose, onAdded }) {
  const [step, setStep]         = useState(1); // 1=details 2=location 3=plan 4=payment 5=success
  const [loading, setLoading]   = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError]       = useState("");
  const [payStep, setPayStep]   = useState("upi"); // upi | processing | done
  const [upiId, setUpiId]       = useState("");
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [utr, setUtr]           = useState(""); // transaction ID entered by user
  const [utrError, setUtrError] = useState("");
  const [form, setForm]         = useState({
    name: "", category: "cafe", address: "",
    phone: "", openingHours: "", priceLevel: 2,
    isHiddenGem: false, lat: "", lng: "", plan: "free",
  });

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setError(""); };
  const selectedPlan = PLANS.find(p => p.key === form.plan);
  const totalSteps   = form.plan === "free" ? 3 : 4;

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { set("lat", pos.coords.latitude.toFixed(6)); set("lng", pos.coords.longitude.toFixed(6)); setLocating(false); },
      ()  => { setError("Could not detect location. Enter manually."); setLocating(false); }
    );
  };

  const handleSubmit = async (verifiedUtr = null) => {
    setLoading(true); setError("");
    try {
      const popularityScore = form.plan === "elite" ? 200 : form.plan === "premium" ? 100 : 0;
      // Paid plans go live only after admin verifies UTR
      const isLive = form.plan === "free";
      const res = await axios.post(`${API}/api/businesses`, {
        name: form.name, category: form.category,
        address: form.address, phone: form.phone,
        openingHours: form.openingHours || "Hours not listed",
        priceLevel: Number(form.priceLevel),
        isHiddenGem: form.isHiddenGem,
        popularityScore, rating: 4.0, plan: form.plan,
        isLive,
        paymentStatus: form.plan === "free" ? "free" : "pending_verification",
        utrNumber: verifiedUtr || null,
        location: { type: "Point", coordinates: [parseFloat(form.lng), parseFloat(form.lat)] },
      });
      setStep(5);
      // Only add to map immediately if free plan
      if (form.plan === "free") setTimeout(() => { onAdded(res.data); onClose(); }, 3000);
      else setTimeout(() => { onClose(); }, 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add business");
    } finally { setLoading(false); }
  };

  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const OWNER_UPI  = "9686795546@omni";
  const OWNER_NAME = "CityLens";

  // Step 1: Open UPI app with pre-filled details
  const handleOpenUPI = (appId = selectedUpi) => {
    setError("");
    const amount = Math.round(selectedPlan.price * 1.18);
    const note   = `CityLens ${selectedPlan.name} - ${form.name}`;
    const upiUri = `upi://pay?pa=${OWNER_UPI}&pn=${encodeURIComponent(OWNER_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    const deepLinks = {
      gpay:    `gpay://upi/pay?pa=${OWNER_UPI}&pn=${encodeURIComponent(OWNER_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
      phonepe: `phonepe://pay?pa=${OWNER_UPI}&pn=${encodeURIComponent(OWNER_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
      paytm:   `paytm://upi/pay?pa=${OWNER_UPI}&pn=${encodeURIComponent(OWNER_NAME)}&am=${amount}&cu=INR`,
      upi:     upiUri,
    };
    const link = deepLinks[appId] || upiUri;
    const a = document.createElement("a");
    a.href = link; a.style.display = "none";
    document.body.appendChild(a);
    try { a.click(); } catch(e) {}
    setTimeout(() => document.body.removeChild(a), 500);
    // Move to UTR entry step after small delay
    setTimeout(() => setPayStep("enter_utr"), 1000);
  };

  // Step 2: User submits real UTR number
  const handleUTRSubmit = async () => {
    const cleaned = utr.trim().toUpperCase();
    if (cleaned.length < 10) {
      setUtrError("Please enter a valid UTR / Transaction ID (min 10 characters)");
      return;
    }
    setUtrError("");
    setPayStep("processing");
    // Save business with pending status + UTR for admin to verify
    await handleSubmit(cleaned);
  };

  // ── shared styles ──
  const inp = {
    width: "100%", background: "rgba(255,255,255,0.06)",
    border: "1px solid var(--border2)", borderRadius: "10px",
    padding: "11px 14px", color: "#ffffff", fontSize: "13px",
    outline: "none", fontFamily: "var(--font-body)",
    transition: "border-color 0.2s", boxSizing: "border-box",
    WebkitTextFillColor: "#ffffff",
    colorScheme: "dark",
  };
  const fo = e => e.target.style.borderColor = "var(--gold)";
  const bl = e => e.target.style.borderColor = "var(--border2)";
  const lbl = txt => (
    <div style={{ color:"var(--text3)", fontSize:"10px", letterSpacing:"0.08em", marginBottom:"6px" }}>{txt}</div>
  );

  const stepName = ["","BUSINESS DETAILS","LOCATION","CHOOSE PLAN","PAYMENT",""][step] || "";

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1100, backdropFilter:"blur(8px)" }} />

      <div style={{
        position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width: step === 3 ? "600px" : "500px", maxWidth:"94vw", maxHeight:"90vh",
        overflowY:"auto", background:"#0e0e1c",
        border:"1px solid var(--border2)", borderRadius:"20px",
        zIndex:1200, padding:"28px",
        animation:"fadeUp 0.3s ease",
        boxShadow:"0 40px 80px rgba(0,0,0,0.7)",
        transition:"width 0.3s ease",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:16, right:16,
          background:"var(--glass)", border:"1px solid var(--border)",
          borderRadius:"50%", width:30, height:30, cursor:"pointer",
          color:"var(--text2)", fontSize:"14px",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>✕</button>

        {/* ═══ SUCCESS ═══ */}
        {step === 5 ? (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            {form.plan === "free" ? (
              <>
                <div style={{ fontSize:"60px", marginBottom:"16px" }}>🎉</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"22px", fontWeight:700, color:"var(--text)", marginBottom:"10px" }}>
                  Business Added!
                </div>
                <p style={{ color:"var(--text3)", fontSize:"13px", lineHeight:1.7, marginBottom:"18px" }}>
                  <span style={{ color:"var(--gold)" }}>{form.name}</span> is now live on the map!
                </p>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:"8px",
                  background:"rgba(0,212,170,0.08)", border:"1px solid rgba(0,212,170,0.25)",
                  borderRadius:"20px", padding:"8px 18px",
                  color:"#00d4aa", fontSize:"12px",
                }}>
                  <span style={{ animation:"pulse 1s infinite" }}>●</span> Appearing on map now...
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:"60px", marginBottom:"16px" }}>📋</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:700, color:"var(--text)", marginBottom:"10px" }}>
                  Listing Submitted!
                </div>
                <div style={{
                  background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.25)",
                  borderRadius:"14px", padding:"16px 18px", marginBottom:"16px", textAlign:"left",
                }}>
                  <div style={{ color:"var(--gold)", fontSize:"12px", fontWeight:700, marginBottom:"10px" }}>
                    ⏳ PENDING UTR VERIFICATION
                  </div>
                  <div style={{ color:"var(--text3)", fontSize:"12px", lineHeight:1.8 }}>
                    <div>• UTR submitted: <strong style={{color:"var(--text)"}}>{utr.toUpperCase()}</strong></div>
                    <div>• Business: <strong style={{color:"var(--text)"}}>{form.name}</strong></div>
                    <div>• Plan: <strong style={{color:selectedPlan.color}}>{selectedPlan.name}</strong></div>
                  </div>
                </div>
                <p style={{ color:"var(--text3)", fontSize:"12px", lineHeight:1.7 }}>
                  Our team will verify your payment and activate your listing within
                  <strong style={{color:"var(--text2)"}}> 2–4 hours</strong>.
                  You'll see it live on the map once verified.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom:"22px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                <div style={{
                  width:38, height:38,
                  background:"linear-gradient(135deg, var(--gold), var(--gold2))",
                  borderRadius:"10px", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"20px", color:"#080810", fontWeight:900,
                }}>+</div>
                <div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"18px", fontWeight:700, color:"var(--text)" }}>
                    Add Your Business
                  </div>
                  <div style={{ color:"var(--text3)", fontSize:"11px", letterSpacing:"0.06em" }}>
                    STEP {Math.min(step,4)} OF {totalSteps} — {stepName}
                  </div>
                </div>
              </div>
              <div style={{ height:3, background:"var(--border)", borderRadius:2 }}>
                <div style={{
                  height:"100%", borderRadius:2,
                  background:"linear-gradient(90deg, var(--gold), var(--gold2))",
                  width:`${(Math.min(step,totalSteps)/totalSteps)*100}%`,
                  transition:"width 0.4s ease",
                }} />
              </div>
            </div>

            {/* ═══ STEP 1 — Details ═══ */}
            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <div>
                  {lbl("BUSINESS NAME *")}
                  <input type="text" placeholder="e.g. Sri Annapoorneswari Sweets"
                    value={form.name} onChange={e => set("name", e.target.value)}
                    style={inp} onFocus={fo} onBlur={bl} />
                </div>
                <div>
                  {lbl("CATEGORY")}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px" }}>
                    {CATEGORIES.map(c => (
                      <button key={c.key} onClick={() => set("category", c.key)} style={{
                        padding:"9px 6px",
                        background: form.category===c.key ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                        border:`1px solid ${form.category===c.key ? "var(--gold)" : "var(--border)"}`,
                        borderRadius:"8px", cursor:"pointer",
                        color: form.category===c.key ? "var(--gold)" : "var(--text2)",
                        fontSize:"12px", display:"flex", flexDirection:"column",
                        alignItems:"center", gap:"3px", transition:"all 0.15s",
                      }}>
                        <span style={{ fontSize:"18px" }}>{c.emoji}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  {lbl("ADDRESS *")}
                  <input type="text" placeholder="e.g. 5/A, 14th Cross, Banashankari"
                    value={form.address} onChange={e => set("address", e.target.value)}
                    style={inp} onFocus={fo} onBlur={bl} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    {lbl("PHONE")}
                    <input type="text" placeholder="+91 98765 43210"
                      value={form.phone} onChange={e => set("phone", e.target.value)}
                      style={inp} onFocus={fo} onBlur={bl} />
                  </div>
                  <div>
                    {lbl("OPENING HOURS")}
                    <input type="text" placeholder="8:00 AM - 10:00 PM"
                      value={form.openingHours} onChange={e => set("openingHours", e.target.value)}
                      style={inp} onFocus={fo} onBlur={bl} />
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    {lbl("PRICE LEVEL")}
                    <select value={form.priceLevel} onChange={e => set("priceLevel", e.target.value)}
                      style={{ ...inp, cursor:"pointer", colorScheme:"dark" }}>
                      <option value={1}>₹ Budget</option>
                      <option value={2}>₹₹ Moderate</option>
                      <option value={3}>₹₹₹ Expensive</option>
                      <option value={4}>₹₹₹₹ Luxury</option>
                    </select>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", paddingTop:"22px" }}>
                    <button onClick={() => set("isHiddenGem", !form.isHiddenGem)} style={{
                      width:36, height:20, borderRadius:"10px",
                      background: form.isHiddenGem ? "var(--gold)" : "var(--border2)",
                      border:"none", cursor:"pointer", position:"relative",
                      transition:"background 0.2s", flexShrink:0,
                    }}>
                      <div style={{
                        position:"absolute", top:2, left: form.isHiddenGem ? 18 : 2,
                        width:16, height:16, borderRadius:"50%",
                        background:"white", transition:"left 0.2s",
                      }} />
                    </button>
                    <span style={{ color:"var(--text2)", fontSize:"12px" }}>💎 Hidden Gem</span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 2 — Location ═══ */}
            {step === 2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <div style={{
                  background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.2)",
                  borderRadius:"12px", padding:"14px",
                }}>
                  <p style={{ color:"var(--text2)", fontSize:"12px", lineHeight:1.6 }}>
                    📍 Open <span style={{ color:"var(--gold)" }}>Google Maps</span>, find your business,
                    right-click → first number = <strong>latitude</strong>, second = <strong>longitude</strong>.
                  </p>
                </div>
                <button onClick={detectLocation} disabled={locating} style={{
                  padding:"11px",
                  background:"rgba(0,212,170,0.08)", border:"1px solid rgba(0,212,170,0.25)",
                  borderRadius:"10px", color:"var(--teal, #00d4aa)",
                  fontSize:"13px", cursor:"pointer", fontWeight:600,
                }}>
                  {locating ? "⏳ Detecting..." : "📍 Use My Current Location"}
                </button>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    {lbl("LATITUDE (e.g. 12.9716)")}
                    <input type="number" placeholder="12.9716" step="0.0001"
                      value={form.lat} onChange={e => set("lat", e.target.value)}
                      style={inp} onFocus={fo} onBlur={bl} />
                  </div>
                  <div>
                    {lbl("LONGITUDE (e.g. 77.5946)")}
                    <input type="number" placeholder="77.5946" step="0.0001"
                      value={form.lng} onChange={e => set("lng", e.target.value)}
                      style={inp} onFocus={fo} onBlur={bl} />
                  </div>
                </div>
                {form.lat && form.lng && (
                  <div style={{
                    background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.15)",
                    borderRadius:"10px", padding:"12px",
                    color:"var(--text2)", fontSize:"12px",
                    display:"flex", alignItems:"center", gap:"8px",
                  }}>
                    <span style={{ fontSize:"18px" }}>📌</span>
                    <div>
                      <div style={{ color:"var(--gold)", fontWeight:600 }}>{form.name}</div>
                      <div style={{ marginTop:"2px" }}>{form.lat}, {form.lng}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ STEP 3 — Choose Plan ═══ */}
            {step === 3 && (
              <div>
                <div style={{ textAlign:"center", marginBottom:"20px" }}>
                  <div style={{ fontSize:"28px", marginBottom:"6px" }}>🚀</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"16px", color:"var(--text)", fontWeight:700 }}>
                    How far do you want to reach?
                  </div>
                  <div style={{ color:"var(--text3)", fontSize:"12px", marginTop:"4px" }}>
                    Free listing goes live instantly. Upgrade for maximum visibility.
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"20px" }}>
                  {PLANS.map(plan => (
                    <div key={plan.key} onClick={() => set("plan", plan.key)} style={{
                      border:`2px solid ${form.plan===plan.key ? plan.color : "var(--border)"}`,
                      borderRadius:"16px", padding:"18px 14px",
                      background: form.plan===plan.key ? `${plan.color}12` : "rgba(255,255,255,0.02)",
                      cursor:"pointer", position:"relative",
                      transition:"all 0.2s",
                      transform: form.plan===plan.key ? "translateY(-3px)" : "none",
                      boxShadow: form.plan===plan.key ? `0 8px 24px ${plan.color}22` : "none",
                    }}>
                      {plan.badge && (
                        <div style={{
                          position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)",
                          background: plan.key === "premium"
                            ? "linear-gradient(135deg,#c9a84c,#e8c96e)"
                            : "linear-gradient(135deg,#a78bfa,#7c3aed)",
                          color: plan.key === "premium" ? "#080810" : "white",
                          fontSize:"8px", fontWeight:800, letterSpacing:"0.08em",
                          borderRadius:"10px", padding:"3px 9px", whiteSpace:"nowrap",
                        }}>{plan.badge}</div>
                      )}
                      <div style={{
                        fontFamily:"var(--font-display)", fontSize:"16px", fontWeight:700,
                        color: form.plan===plan.key ? plan.color : "var(--text)",
                        marginBottom:"4px", textAlign:"center",
                      }}>{plan.name}</div>
                      <div style={{ textAlign:"center", marginBottom:"12px" }}>
                        {plan.price === 0 ? (
                          <span style={{ color:"#00d4aa", fontSize:"20px", fontWeight:800 }}>Free</span>
                        ) : (
                          <div>
                            <span style={{ color:plan.color, fontSize:"22px", fontWeight:800, fontFamily:"var(--font-display)" }}>
                              ₹{plan.price}
                            </span>
                            <span style={{ color:"var(--text3)", fontSize:"10px" }}>/mo</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                        {plan.features.map((f,i) => (
                          <div key={i} style={{
                            fontSize:"11px",
                            color: f.startsWith("❌") ? "var(--text3)" : "var(--text2)",
                            lineHeight:1.4,
                          }}>{f}</div>
                        ))}
                      </div>
                      {form.plan === plan.key && (
                        <div style={{
                          position:"absolute", top:10, right:10,
                          width:18, height:18, borderRadius:"50%",
                          background:plan.color,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"10px", color: plan.key==="premium" ? "#080810" : "white",
                          fontWeight:900,
                        }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary bar */}
                <div style={{
                  background:"rgba(255,255,255,0.03)", border:"1px solid var(--border2)",
                  borderRadius:"12px", padding:"14px 16px",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <div>
                    <div style={{ color:"var(--text2)", fontSize:"12px" }}>Selected plan</div>
                    <div style={{ color:selectedPlan.color, fontWeight:700, fontSize:"15px", marginTop:"2px" }}>
                      {selectedPlan.name} {selectedPlan.price > 0 ? `— ₹${selectedPlan.price}/mo` : "— Free forever"}
                    </div>
                  </div>
                  <div style={{ fontSize:"28px" }}>
                    {form.plan==="elite" ? "👑" : form.plan==="premium" ? "⭐" : "🆓"}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 4 — Payment ═══ */}
            {step === 4 && (
              <div>
                {payStep === "upi" && (
                  <>
                    {/* ── Order Summary ── */}
                    <div style={{
                      background:`${selectedPlan.color}10`,
                      border:`1px solid ${selectedPlan.color}33`,
                      borderRadius:"14px", padding:"16px 18px", marginBottom:"18px",
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                        <div style={{ color:"var(--text)", fontWeight:700, fontSize:"14px" }}>{form.name}</div>
                        <div style={{
                          background:`${selectedPlan.color}20`, border:`1px solid ${selectedPlan.color}44`,
                          borderRadius:"6px", padding:"3px 10px",
                          color:selectedPlan.color, fontSize:"11px", fontWeight:700,
                        }}>{selectedPlan.name} Plan</div>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", color:"var(--text3)", fontSize:"12px", marginBottom:"6px" }}>
                        <span>Monthly listing fee</span><span>₹{selectedPlan.price}</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", color:"var(--text3)", fontSize:"12px", marginBottom:"10px" }}>
                        <span>GST (18%)</span><span>₹{Math.round(selectedPlan.price * 0.18)}</span>
                      </div>
                      <div style={{
                        borderTop:"1px solid var(--border2)", paddingTop:"10px",
                        display:"flex", justifyContent:"space-between",
                        color:selectedPlan.color, fontWeight:800, fontSize:"20px",
                        fontFamily:"var(--font-display)",
                      }}>
                        <span>Total</span>
                        <span>₹{Math.round(selectedPlan.price * 1.18)}</span>
                      </div>
                    </div>

                    {/* ── Pay To Box ── */}
                    <div style={{
                      background:"rgba(255,255,255,0.04)", border:"1px solid var(--border2)",
                      borderRadius:"12px", padding:"14px 16px", marginBottom:"16px",
                    }}>
                      <div style={{ color:"var(--text3)", fontSize:"10px", letterSpacing:"0.1em", marginBottom:"10px" }}>PAY TO</div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                          <div style={{ color:"var(--text)", fontSize:"15px", fontWeight:700 }}>CityLens</div>
                          <div style={{ color:"var(--gold)", fontSize:"13px", fontWeight:600, marginTop:"3px" }}>9686795546@omni</div>
                        </div>
                        <button onClick={() => {
                          navigator.clipboard?.writeText("9686795546@omni");
                          alert("UPI ID copied!");
                        }} style={{
                          background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.3)",
                          borderRadius:"8px", padding:"8px 14px",
                          color:"var(--gold)", fontSize:"12px", cursor:"pointer", fontWeight:600,
                        }}>📋 Copy UPI</button>
                      </div>
                    </div>

                    {/* ── Mobile: UPI App buttons ── */}
                    {typeof navigator !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent) && (
                      <div style={{ marginBottom:"16px" }}>
                        {lbl("TAP TO OPEN UPI APP")}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                          {UPI_APPS.map(app => (
                            <button key={app.id}
                              onClick={() => { setSelectedUpi(app.id); handleOpenUPI(app.id); }}
                              style={{
                                padding:"12px", borderRadius:"12px",
                                background: selectedUpi === app.id ? `${app.color}20` : "rgba(255,255,255,0.03)",
                                border:`1px solid ${selectedUpi === app.id ? app.color : "var(--border2)"}`,
                                display:"flex", alignItems:"center", gap:"10px",
                                cursor:"pointer", transition:"all 0.15s",
                                color:"var(--text)", fontSize:"13px", fontWeight:600,
                              }}
                            >
                              <span style={{ fontSize:"22px" }}>{app.emoji}</span>
                              <span>{app.name}</span>
                            </button>
                          ))}
                        </div>
                        <div style={{ color:"var(--text3)", fontSize:"11px", marginTop:"10px", textAlign:"center" }}>
                          Tap an app → pay → come back here → enter UTR
                        </div>
                      </div>
                    )}

                    {/* ── Desktop: Manual instruction ── */}
                    {typeof navigator !== "undefined" && !/Android|iPhone|iPad/i.test(navigator.userAgent) && (
                      <div style={{
                        background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.2)",
                        borderRadius:"12px", padding:"14px 16px", marginBottom:"16px",
                      }}>
                        <div style={{ color:"var(--gold)", fontSize:"12px", fontWeight:700, marginBottom:"8px" }}>
                          📱 How to pay from desktop:
                        </div>
                        <div style={{ color:"var(--text3)", fontSize:"12px", lineHeight:2 }}>
                          <div>1. Open <strong style={{color:"var(--text2)"}}>GPay / PhonePe / Paytm</strong> on your phone</div>
                          <div>2. Send <strong style={{color:"var(--text2)"}}>₹{Math.round(selectedPlan.price * 1.18)}</strong> to UPI: <strong style={{color:"var(--gold)"}}>9686795546@omni</strong></div>
                          <div>3. Note: <strong style={{color:"var(--text2)"}}>CityLens {selectedPlan.name} - {form.name}</strong></div>
                          <div>4. Come back here → click <strong style={{color:"var(--text2)"}}>I've Paid</strong> → enter UTR</div>
                        </div>
                      </div>
                    )}

                    <div style={{ display:"flex", alignItems:"center", gap:"8px", color:"var(--text3)", fontSize:"11px" }}>
                      <span>🔒</span>
                      <span>Your listing goes live after our team verifies the payment (2–4 hrs).</span>
                    </div>
                  </>
                )}

                {/* ── Step: Enter UTR after paying ── */}
                {payStep === "enter_utr" && (
                  <div>
                    <div style={{
                      background:"rgba(0,212,170,0.07)", border:"1px solid rgba(0,212,170,0.25)",
                      borderRadius:"14px", padding:"16px 18px", marginBottom:"20px",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                        <span style={{ fontSize:"22px" }}>✅</span>
                        <div>
                          <div style={{ color:"#00d4aa", fontSize:"13px", fontWeight:700 }}>Payment sent? Great!</div>
                          <div style={{ color:"var(--text3)", fontSize:"11px", marginTop:2 }}>Now enter your UTR / Transaction ID to confirm</div>
                        </div>
                      </div>
                    </div>

                    {/* How to find UTR */}
                    <div style={{
                      background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.2)",
                      borderRadius:"12px", padding:"12px 15px", marginBottom:"18px",
                    }}>
                      <div style={{ color:"var(--gold)", fontSize:"11px", fontWeight:700, marginBottom:"8px" }}>📍 WHERE TO FIND YOUR UTR</div>
                      <div style={{ color:"var(--text3)", fontSize:"11px", lineHeight:1.8 }}>
                        <div>• <strong style={{color:"var(--text2)"}}>GPay</strong> → Transaction → Tap payment → See "UTR No."</div>
                        <div>• <strong style={{color:"var(--text2)"}}>PhonePe</strong> → History → Tap transaction → "Transaction ID"</div>
                        <div>• <strong style={{color:"var(--text2)"}}>Paytm</strong> → Passbook → Tap payment → "UTR Number"</div>
                        <div>• Any UPI app → Payment receipt → 12-digit number</div>
                      </div>
                    </div>

                    {/* UTR input */}
                    <div style={{ marginBottom:"6px" }}>
                      <div style={{ color:"var(--text3)", fontSize:"10px", letterSpacing:"0.1em", marginBottom:"8px" }}>
                        ENTER UTR / TRANSACTION ID
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 425612345678 or T2506XXXXXXX"
                        value={utr}
                        onChange={e => { setUtr(e.target.value); setUtrError(""); }}
                        style={{
                          ...inp,
                          fontSize:"15px", letterSpacing:"0.06em", fontWeight:600,
                          textTransform:"uppercase",
                        }}
                        onFocus={fo} onBlur={bl}
                      />
                      {utrError && (
                        <div style={{ color:"#ef4444", fontSize:"11px", marginTop:"6px" }}>{utrError}</div>
                      )}
                    </div>

                    <div style={{ color:"var(--text3)", fontSize:"10px", marginTop:"10px", lineHeight:1.6 }}>
                      🔒 Your business will go live within <strong style={{color:"var(--text2)"}}>2–4 hours</strong> after UTR is verified by our team.
                    </div>
                  </div>
                )}

                {payStep === "processing" && (
                  <div style={{ textAlign:"center", padding:"44px 20px" }}>
                    <div style={{ fontSize:"52px", marginBottom:"16px", animation:"pulse 0.8s infinite" }}>⏳</div>
                    <div style={{ color:"var(--text)", fontSize:"15px", fontWeight:600, marginBottom:"8px" }}>
                      Submitting your listing...
                    </div>
                    <div style={{ color:"var(--text3)", fontSize:"12px" }}>Please wait</div>
                    <div style={{ marginTop:"24px", display:"flex", justifyContent:"center", gap:"6px" }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width:8, height:8, borderRadius:"50%", background:"var(--gold)",
                          animation:`pulse 1s infinite ${i*0.2}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Error ── */}
            {error && (
              <div style={{
                marginTop:"12px", padding:"10px 14px", borderRadius:"8px",
                background:"rgba(255,107,107,0.08)", border:"1px solid rgba(255,107,107,0.2)",
                color:"#ff6b6b", fontSize:"12px",
              }}>⚠ {error}</div>
            )}

            {/* ── Nav Buttons ── */}
            {payStep !== "processing" && payStep !== "done" && (
              <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
                {step > 1 && (
                  <button onClick={() => { setStep(s => s-1); setError(""); }} style={{
                    flex:1, padding:"12px",
                    background:"var(--glass)", border:"1px solid var(--border2)",
                    borderRadius:"10px", color:"var(--text2)",
                    fontSize:"13px", cursor:"pointer",
                  }}>← Back</button>
                )}

                {step === 1 && (
                  <button onClick={() => {
                    if (!form.name.trim()) return setError("Business name is required");
                    if (!form.address.trim()) return setError("Address is required");
                    setStep(2);
                  }} style={{
                    flex:2, padding:"12px",
                    background:"linear-gradient(135deg,var(--gold),var(--gold2))",
                    border:"none", borderRadius:"10px",
                    color:"#080810", fontSize:"13px", fontWeight:700, cursor:"pointer",
                  }}>NEXT → LOCATION</button>
                )}

                {step === 2 && (
                  <button onClick={() => {
                    if (!form.lat || !form.lng) return setError("Please add location coordinates");
                    setStep(3);
                  }} style={{
                    flex:2, padding:"12px",
                    background:"linear-gradient(135deg,var(--gold),var(--gold2))",
                    border:"none", borderRadius:"10px",
                    color:"#080810", fontSize:"13px", fontWeight:700, cursor:"pointer",
                  }}>NEXT → CHOOSE PLAN</button>
                )}

                {step === 3 && (
                  <button onClick={() => form.plan === "free" ? handleSubmit() : setStep(4)}
                    disabled={loading} style={{
                      flex:2, padding:"12px",
                      background: form.plan === "elite"
                        ? "linear-gradient(135deg,#a78bfa,#7c3aed)"
                        : form.plan === "premium"
                          ? "linear-gradient(135deg,var(--gold),var(--gold2))"
                          : "linear-gradient(135deg,#00d4aa,#00b894)",
                      border:"none", borderRadius:"10px",
                      color: form.plan === "premium" ? "#080810" : "white",
                      fontSize:"13px", fontWeight:800,
                      cursor: loading ? "wait" : "pointer",
                      letterSpacing:"0.03em",
                    }}>
                    {loading ? "ADDING..." : form.plan === "free"
                      ? "🗺️ GO LIVE FREE"
                      : `PROCEED TO PAY ₹${Math.round(selectedPlan.price * 1.18)} →`}
                  </button>
                )}

                {/* Step 4 — Open UPI app button */}
                {step === 4 && payStep === "upi" && (
                  <button onClick={() => setPayStep("enter_utr")} style={{
                    flex:2, padding:"14px",
                    background: selectedPlan.key === "premium"
                      ? "linear-gradient(135deg,var(--gold),var(--gold2))"
                      : "linear-gradient(135deg,#a78bfa,#7c3aed)",
                    border:"none", borderRadius:"12px",
                    color: selectedPlan.key === "premium" ? "#080810" : "white",
                    fontSize:"14px", fontWeight:800, cursor:"pointer",
                    letterSpacing:"0.04em",
                    boxShadow: selectedPlan.key === "premium"
                      ? "0 6px 20px rgba(201,168,76,0.4)"
                      : "0 6px 20px rgba(124,58,237,0.4)",
                    transition:"all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.filter="brightness(1.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.filter="none"; }}
                  >
                    ✅ I've Paid — Enter UTR →
                  </button>
                )}

                {/* Step 4 — Submit UTR after paying */}
                {step === 4 && payStep === "enter_utr" && (
                  <button onClick={handleUTRSubmit} disabled={loading || utr.trim().length < 10} style={{
                    flex:2, padding:"14px",
                    background: utr.trim().length >= 10
                      ? "linear-gradient(135deg,#00d4aa,#00b894)"
                      : "var(--glass)",
                    border: utr.trim().length >= 10 ? "none" : "1px solid var(--border2)",
                    borderRadius:"12px",
                    color: utr.trim().length >= 10 ? "#080810" : "var(--text3)",
                    fontSize:"14px", fontWeight:800,
                    cursor: loading || utr.trim().length < 10 ? "not-allowed" : "pointer",
                    letterSpacing:"0.04em", transition:"all 0.2s",
                    boxShadow: utr.trim().length >= 10 ? "0 6px 20px rgba(0,212,170,0.35)" : "none",
                  }}>
                    {loading ? "⏳ Submitting..." : "✅ CONFIRM & SUBMIT UTR"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        /* Force white text in all modal inputs — fixes invisible text on dark bg */
        input[type="text"], input[type="number"], input[type="tel"], textarea, select {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          color-scheme: dark;
        }
        input::placeholder { color: rgba(255,255,255,0.3) !important; }
        /* Fix number input spinner color */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          filter: invert(1);
        }
      `}</style>
    </>
  );
}