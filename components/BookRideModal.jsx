"use client";
import { useState, useEffect, useRef } from "react";


// ── Metro Walking Directions Map ─────────────────────────
function MetroWalkMap({ destLat, destLng, metro, userLat, userLng }) {
  const mapRef      = useRef(null);
  const mapInstRef  = useRef(null);
  const initRef     = useRef(false);
  const [status, setStatus] = useState("🚶 Drawing walking route...");
  const [info, setInfo]     = useState(null);

  useEffect(() => {
    if (initRef.current || !mapRef.current) return;
    initRef.current = true;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then(L => {
      const leaflet = L.default;
      if (mapRef.current._leaflet_id) return;

      const map = leaflet.map(mapRef.current, {
        center: [metro.lat, metro.lng], zoom: 15,
        zoomControl: true,
      });
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);
      mapInstRef.current = map;

      // Metro station marker
      const metroIcon = leaflet.divIcon({
        className: "",
        html: `<div style="background:#4f9eff;border:3px solid white;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px #4f9eff66;">🚇</div>`,
        iconSize: [34,34], iconAnchor: [17,17],
      });
      leaflet.marker([metro.lat, metro.lng], { icon: metroIcon })
        .addTo(map)
        .bindPopup(`<b>${metro.name} Metro Station</b>`)
        .openPopup();

      // Destination marker
      const destIcon = leaflet.divIcon({
        className: "",
        html: `<div style="background:#c9a84c;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:30px;height:30px;box-shadow:0 4px 12px #c9a84c66;display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:14px;">📍</span></div>`,
        iconSize: [30,30], iconAnchor: [15,30],
      });
      leaflet.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup("<b>Destination</b>");

      // User location marker
      if (userLat && userLng) {
        const userIcon = leaflet.divIcon({
          className: "",
          html: `<div style="background:#00d4aa;border:3px solid white;border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 6px #00d4aa33;"></div>`,
          iconSize: [18,18], iconAnchor: [9,9],
        });
        leaflet.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup("📍 You are here");
      }

      // Draw walking route: user/dest → metro station using OSRM walking
      const fromLat = userLat || destLat;
      const fromLng = userLng || destLng;

      fetch(`https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${metro.lng},${metro.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes?.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            leaflet.polyline(coords, {
              color: "#4f9eff", weight: 4, opacity: 0.85,
              dashArray: "8, 6",
            }).addTo(map);

            const bounds = leaflet.latLngBounds([
              [fromLat, fromLng],
              [metro.lat, metro.lng],
              [destLat, destLng],
            ]).pad(0.15);
            map.fitBounds(bounds);

            const walkMins = Math.ceil(route.duration / 60);
            const walkKm   = (route.distance / 1000).toFixed(1);
            setStatus("🚶 Walking route ready");
            setInfo({ walkMins, walkKm });
          } else {
            setStatus("⚠️ Could not load route");
          }
        })
        .catch(() => setStatus("⚠️ Route unavailable"));
    });

    return () => {
      if (mapInstRef.current) {
        mapInstRef.current.remove();
        mapInstRef.current = null;
        initRef.current = false;
      }
    };
  }, []);

  return (
    <div style={{
      borderRadius:14, overflow:"hidden",
      border:"1px solid rgba(79,158,255,0.3)",
      marginBottom:14,
      animation:"fadeUp 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        background:"rgba(79,158,255,0.1)",
        padding:"10px 14px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:"1px solid rgba(79,158,255,0.2)",
      }}>
        <div>
          <div style={{ color:"#4f9eff", fontSize:12, fontWeight:700 }}>
            🚇 Walk to {metro.name} Station
          </div>
          <div style={{ color:"var(--text3)", fontSize:10, marginTop:2 }}>{status}</div>
        </div>
        {info && (
          <div style={{ display:"flex", gap:8 }}>
            <div style={{
              background:"rgba(79,158,255,0.15)", border:"1px solid rgba(79,158,255,0.3)",
              borderRadius:8, padding:"5px 10px", textAlign:"center",
            }}>
              <div style={{ color:"#4f9eff", fontWeight:700, fontSize:14 }}>{info.walkMins}m</div>
              <div style={{ color:"var(--text3)", fontSize:9 }}>walk</div>
            </div>
            <div style={{
              background:"rgba(79,158,255,0.1)", border:"1px solid rgba(79,158,255,0.25)",
              borderRadius:8, padding:"5px 10px", textAlign:"center",
            }}>
              <div style={{ color:"#4f9eff", fontWeight:700, fontSize:14 }}>{info.walkKm}km</div>
              <div style={{ color:"var(--text3)", fontSize:9 }}>dist</div>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ width:"100%", height:"240px" }} />

      {/* Legend */}
      <div style={{
        background:"rgba(79,158,255,0.05)", padding:"8px 14px",
        display:"flex", gap:16, fontSize:10, color:"var(--text3)",
        borderTop:"1px solid rgba(79,158,255,0.15)",
        flexWrap:"wrap",
      }}>
        <span>🟢 You</span>
        <span>🚇 {metro.name} Station</span>
        <span>📍 Destination</span>
        <span style={{ color:"#4f9eff" }}>― Dashed = Walking path</span>
      </div>
    </div>
  );
}

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const buildProviders = (uLat, uLng, dLat, dLng, destName, km) => {
  const enc     = encodeURIComponent(destName);
  const hasGPS  = uLat !== 0 && uLng !== 0;

  return [
    {
      id: "namma",
      name: "Namma Yatri",
      emoji: "🟡",
      tagColor: "#f59e0b",
      type: "Auto · Cab",
      eta: Math.floor(Math.random()*3)+2,
      fare: Math.round(km * 13 + 18),
      surge: false,
      // Namma Yatri deep link — works with lat/lng
      link: hasGPS
        ? `https://nammayatri.in/open?source=citylens&slat=${uLat}&slon=${uLng}&dlat=${dLat}&dlon=${dLng}&dname=${enc}`
        : `https://nammayatri.in/open?source=citylens&dlat=${dLat}&dlon=${dLng}&dname=${enc}`,
    },
    {
      id: "rapido",
      name: "Rapido",
      emoji: "⚡",
      tagColor: "#facc15",
      type: "Bike · Auto",
      eta: Math.floor(Math.random()*2)+1,
      fare: Math.round(km * 9 + 12),
      surge: km > 6,
      // Rapido supports drop lat/lng via web
      link: hasGPS
        ? `https://www.rapido.bike/book?pickup_lat=${uLat}&pickup_lng=${uLng}&drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${enc}`
        : `https://www.rapido.bike/book?drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${enc}`,
    },
    {
      id: "ola",
      name: "Ola",
      emoji: "🟢",
      tagColor: "#22c55e",
      type: "Auto · Mini · Prime",
      eta: Math.floor(Math.random()*4)+3,
      fare: Math.round(km * 16 + 28),
      surge: km > 9,
      // Ola confirmed working deep link
      link: hasGPS
        ? `https://book.olacabs.com/?pickup_lat=${uLat}&pickup_lng=${uLng}&drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${enc}&utm_source=citylens`
        : `https://book.olacabs.com/?drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${enc}&utm_source=citylens`,
    },
    {
      id: "uber",
      name: "Uber",
      emoji: "🖤",
      tagColor: "#94a3b8",
      type: "Auto · Go · Premier",
      eta: Math.floor(Math.random()*4)+4,
      fare: Math.round(km * 18 + 34),
      surge: false,
      // Uber deep link with full params
      link: hasGPS
        ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${uLat}&pickup[longitude]=${uLng}&pickup[nickname]=My+Location&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${enc}`
        : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${enc}`,
    },
  ].sort((a, b) => a.fare - b.fare);
};

// Bengaluru metro stations (simplified)
const METRO_STATIONS = [
  { name: "Jayanagar", lat: 12.9252, lng: 77.5938 },
  { name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
  { name: "MG Road", lat: 12.9756, lng: 77.6099 },
  { name: "Koramangala", lat: 12.9352, lng: 77.6245 },
  { name: "Whitefield", lat: 12.9698, lng: 77.7499 },
  { name: "Malleshwaram", lat: 13.003, lng: 77.567 },
];

const nearestMetro = (lat, lng) => {
  let best = null, bestDist = Infinity;
  METRO_STATIONS.forEach(s => {
    const d = haversineKm(lat, lng, s.lat, s.lng);
    if (d < bestDist) { bestDist = d; best = s; }
  });
  return bestDist < 1.5 ? { ...best, dist: bestDist } : null;
};

export default function BookRideModal({ business, onClose }) {
  const [phase, setPhase]           = useState("loading"); // loading | ready | denied
  const [pickup, setPickup]         = useState("");
  const [uLat, setULat]             = useState(null);
  const [uLng, setULng]             = useState(null);
  const [km, setKm]                 = useState(null);
  const [providers, setProviders]   = useState([]);
  const [shownCount, setShownCount] = useState(0);
  const [bookedId, setBookedId]     = useState(null);
  const [slideIn, setSlideIn]       = useState(false);
  const [metro, setMetro]           = useState(null);
  const [showMetroMap, setShowMetroMap] = useState(false);
  const metroMapRef                 = useRef(null);
  const metroMapInstanceRef         = useRef(null);
  const metroInitRef                = useRef(false);
  const pickupRef                   = useRef(null);

  const dLat = business.location.coordinates[1];
  const dLng = business.location.coordinates[0];

  const loadProviders = (la, lo, dist) => {
    // Metro is set separately after GPS is confirmed
    const p = buildProviders(la, lo, dLat, dLng, business.name, dist);
    setProviders(p);
    p.forEach((_, i) => setTimeout(() => setShownCount(n => n + 1), 300 + i * 130));
  };

  const requestLocation = () => {
    setPhase("loading");
    setProviders([]);
    setShownCount(0);
    if (!navigator.geolocation) {
      setPhase("denied");
      loadProviders(0, 0, 5);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: la, longitude: lo } = pos.coords;
        setULat(la); setULng(lo);
        setPickup("Current Location");
        const dist = haversineKm(la, lo, dLat, dLng);
        setKm(dist);
        loadProviders(la, lo, dist);
        // Calculate nearest metro from USER location (not destination)
        const m = nearestMetro(la, lo);
        if (m) setMetro(m);
        setPhase("ready");
      },
      (err) => {
        console.warn("Geo error:", err.code, err.message);
        setPhase("denied");
        loadProviders(0, 0, 5);
        // Fallback: show metro near destination when user location unavailable
        const m = nearestMetro(dLat, dLng);
        if (m) setMetro(m);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    setTimeout(() => setSlideIn(true), 20);
    requestLocation();
  }, []);

  const handleBook = (p) => {
    setBookedId(p.id);

    const enc        = encodeURIComponent(business.name);
    const pickupText = pickupRef.current?.value?.trim() || "";
    let link         = p.link; // already has GPS coords if available

    // If GPS denied but user typed a pickup area, append it to links
    if (!uLat && pickupText) {
      const encPickup = encodeURIComponent(pickupText);
      if (p.id === "uber") {
        link = `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encPickup}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${enc}`;
      } else if (p.id === "ola") {
        link = `https://book.olacabs.com/?pickup_name=${encPickup}&drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${enc}&utm_source=citylens`;
      } else if (p.id === "namma") {
        link = `https://nammayatri.in/open?source=citylens&dlat=${dLat}&dlon=${dLng}&dname=${enc}`;
      } else if (p.id === "rapido") {
        link = `https://www.rapido.bike/book?drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${enc}`;
      }
    }

    setTimeout(() => {
      window.open(link, "_blank");
      setBookedId(null);
    }, 400);
  };

  const handleClose = () => {
    setSlideIn(false);
    setTimeout(onClose, 340);
  };

  const cheapest = providers[0] ?? null;
  const fastest  = [...providers].sort((a,b) => a.eta - b.eta)[0] ?? null;
  const walkMins = km ? Math.round(km / 0.083) : null;

  return (
    <>
      {/* Blurred backdrop */}
      <div onClick={handleClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(10px)",
        zIndex: 1400,
        opacity: slideIn ? 1 : 0,
        transition: "opacity 0.3s ease",
      }} />

      {/* Bottom sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0,
        maxHeight: "86vh",
        background: "var(--bg2, #0d0d1a)",
        borderTop: "1px solid var(--border2)",
        borderRadius: "28px 28px 0 0",
        zIndex: 1500,
        overflowY: "auto",
        transform: slideIn ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
        boxShadow: "0 -30px 80px rgba(0,0,0,0.6)",
      }}>

        {/* Drag pill */}
        <div style={{ display:"flex", justifyContent:"center", paddingTop:14, paddingBottom:4 }}>
          <div style={{ width:44, height:4, borderRadius:2, background:"var(--border2)" }} />
        </div>

        <div style={{ padding:"12px 22px 36px" }}>

          {/* ── Header ── */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <div style={{
                  width:38, height:38, borderRadius:12, fontSize:20,
                  background:"linear-gradient(135deg,var(--gold),var(--gold2))",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 0 20px rgba(201,168,76,0.35)",
                }}>🚕</div>
                <div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:700, color:"var(--text)", lineHeight:1 }}>
                    Choose Your Ride
                  </div>
                  <div style={{ color:"var(--text3)", fontSize:11, marginTop:3, letterSpacing:"0.04em" }}>
                    Compare fares & arrival times instantly
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleClose} style={{
              background:"var(--glass)", border:"1px solid var(--border)",
              borderRadius:"50%", width:32, height:32, cursor:"pointer",
              color:"var(--text2)", fontSize:15,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            }}>✕</button>
          </div>

          {/* ── Route card ── */}
          <div style={{
            background:"var(--glass)", border:"1px solid var(--border2)",
            borderRadius:18, padding:"16px 18px", marginBottom:14,
          }}>
            <div style={{ display:"flex", gap:14 }}>
              {/* Timeline */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:2 }}>
                <div style={{ width:11, height:11, borderRadius:"50%", background:"#00d4aa", boxShadow:"0 0 10px #00d4aa88", flexShrink:0 }} />
                <div style={{ width:2, height:30, background:"linear-gradient(#00d4aa44,rgba(201,168,76,0.4))", margin:"4px 0" }} />
                <div style={{ width:11, height:11, borderRadius:"50%", background:"var(--gold)", boxShadow:"0 0 10px rgba(201,168,76,0.7)", flexShrink:0 }} />
              </div>

              <div style={{ flex:1 }}>
                {/* Pickup */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ color:"var(--text3)", fontSize:"10px", letterSpacing:"0.1em", marginBottom:4 }}>PICKUP</div>
                  {/* Pickup — always editable */}
                  {phase === "loading" && (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:"#00d4aa", animation:"pulse 1s infinite", flexShrink:0 }} />
                      <span style={{ color:"var(--text3)", fontSize:13 }}>Detecting your location...</span>
                    </div>
                  )}

                  {phase === "ready" && (
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:"#00d4aa", animation:"pulse 1.5s infinite", flexShrink:0 }} />
                        <span style={{ color:"#00d4aa", fontSize:12, fontWeight:600 }}>Auto-detected</span>
                        <span style={{ color:"var(--text3)", fontSize:11 }}>
                          {uLat ? `${uLat.toFixed(4)}, ${uLng.toFixed(4)}` : ""}
                        </span>
                      </div>
                      <input ref={pickupRef}
                        type="text"
                        defaultValue="Current Location"
                        placeholder="Or type a pickup area..."
                        style={{
                          background:"var(--glass)", border:"1px solid var(--border2)",
                          borderRadius:8, padding:"8px 10px",
                          color:"var(--text)", fontSize:13, outline:"none",
                          width:"100%", fontFamily:"var(--font-body)", boxSizing:"border-box",
                          transition:"border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor="var(--gold)"}
                        onBlur={e => e.target.style.borderColor="var(--border2)"}
                      />
                    </div>
                  )}

                  {phase === "denied" && (
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span style={{ color:"#ef4444", fontSize:11 }}>⚠ Location blocked</span>
                        <button onClick={requestLocation} style={{
                          background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)",
                          borderRadius:6, padding:"3px 10px",
                          color:"var(--gold)", fontSize:11, cursor:"pointer", fontWeight:600,
                        }}>↺ Retry</button>
                      </div>
                      <input ref={pickupRef}
                        type="text"
                        placeholder="e.g. Indiranagar, Bengaluru..."
                        style={{
                          background:"var(--glass)", border:"1px solid var(--border2)",
                          borderRadius:8, padding:"8px 10px",
                          color:"var(--text)", fontSize:13, outline:"none",
                          width:"100%", fontFamily:"var(--font-body)", boxSizing:"border-box",
                          transition:"border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor="var(--gold)"}
                        onBlur={e => e.target.style.borderColor="var(--border2)"}
                      />
                      <div style={{ color:"var(--text3)", fontSize:10, marginTop:5 }}>
                        💡 Type your area above — drop is already set to {business.name}
                      </div>
                    </div>
                  )}
                </div>

                {/* Drop — pre-filled, read only */}
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <div style={{ color:"var(--text3)", fontSize:"10px", letterSpacing:"0.1em" }}>DROP</div>
                    <span style={{
                      background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.25)",
                      borderRadius:4, padding:"1px 6px",
                      color:"var(--gold)", fontSize:"9px", fontWeight:700, letterSpacing:"0.05em",
                    }}>PRE-FILLED</span>
                  </div>
                  <div style={{
                    background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.2)",
                    borderRadius:8, padding:"8px 10px",
                  }}>
                    <div style={{ color:"var(--text)", fontSize:13, fontWeight:600 }}>📍 {business.name}</div>
                    <div style={{ color:"var(--text3)", fontSize:11, marginTop:2 }}>{business.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            {km && (
              <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
                <div style={{
                  background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.25)",
                  borderRadius:20, padding:"4px 11px",
                  color:"var(--gold)", fontSize:11, fontWeight:500,
                }}>📏 {km.toFixed(1)} km</div>
                {walkMins && (
                  <div style={{
                    background:"rgba(0,212,170,0.08)", border:"1px solid rgba(0,212,170,0.2)",
                    borderRadius:20, padding:"4px 11px",
                    color:"#00d4aa", fontSize:11, fontWeight:500,
                  }}>🚶 ~{walkMins} min walk</div>
                )}
                {km > 5 && (
                  <div style={{
                    background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                    borderRadius:20, padding:"4px 11px",
                    color:"#ef4444", fontSize:11, fontWeight:500,
                  }}>🚦 Peak hours — traffic likely</div>
                )}
              </div>
            )}
          </div>

          {/* ── Smart suggestions ── */}
          {km && km < 1.5 && (
            <div style={{
              background:"rgba(0,212,170,0.07)", border:"1px solid rgba(0,212,170,0.2)",
              borderRadius:12, padding:"11px 15px", marginBottom:12,
              display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{ fontSize:20 }}>🚶</span>
              <div>
                <div style={{ color:"#00d4aa", fontSize:12, fontWeight:600 }}>It's just {km.toFixed(1)} km away!</div>
                <div style={{ color:"var(--text3)", fontSize:11, marginTop:1 }}>A {walkMins}-min walk might be faster than waiting for a ride.</div>
              </div>
            </div>
          )}
          {metro && (
            <div
              onClick={() => setShowMetroMap(m => !m)}
              style={{
                background: showMetroMap ? "rgba(79,158,255,0.12)" : "rgba(79,158,255,0.07)",
                border:`1px solid ${showMetroMap ? "rgba(79,158,255,0.5)" : "rgba(79,158,255,0.2)"}`,
                borderRadius:12, padding:"11px 15px", marginBottom:12,
                display:"flex", alignItems:"center", gap:10,
                cursor:"pointer", transition:"all 0.2s",
              }}
            >
              <span style={{ fontSize:20 }}>🚇</span>
              <div style={{ flex:1 }}>
                <div style={{ color:"#4f9eff", fontSize:12, fontWeight:600 }}>Metro nearby: {metro.name} Station</div>
                <div style={{ color:"var(--text3)", fontSize:11, marginTop:1 }}>~{Math.round(metro.dist / 0.083)} min walk · Tap to see directions</div>
              </div>
              <span style={{
                color:"#4f9eff", fontSize:12,
                transform: showMetroMap ? "rotate(90deg)" : "rotate(0deg)",
                transition:"transform 0.2s",
              }}>▶</span>
            </div>
          )}

          {/* Metro walking map */}
          {metro && showMetroMap && (
            <MetroWalkMap
              destLat={dLat}
              destLng={dLng}
              metro={metro}
              userLat={uLat}
              userLng={uLng}
            />
          )}

          {/* ── Provider cards ── */}
          <div style={{ color:"var(--text3)", fontSize:"10px", letterSpacing:"0.1em", marginBottom:12 }}>
            AVAILABLE RIDES {providers.length > 0 && `· ${shownCount}/${providers.length} loaded`}
          </div>

          {shownCount === 0 && (
            <div style={{ textAlign:"center", padding:"32px 0", color:"var(--text3)" }}>
              <div style={{ fontSize:36, marginBottom:10, animation:"pulse 1s infinite" }}>🚕</div>
              <div style={{ fontSize:13 }}>Finding the best rides for you...</div>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {providers.slice(0, shownCount).map((p, i) => {
              const isOla     = p.id === "ola";
              const isCheap   = cheapest?.id === p.id && isOla;
              const isFast    = fastest?.id === p.id && fastest.id !== cheapest?.id && isOla;
              const isBooking = bookedId === p.id;
              const disabled  = !isOla;

              return (
                <div key={p.id} style={{
                  background: disabled
                    ? "rgba(255,255,255,0.02)"
                    : isCheap
                      ? "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))"
                      : "var(--glass)",
                  border:`1px solid ${disabled ? "var(--border)" : isCheap ? "rgba(201,168,76,0.4)" : "var(--border)"}`,
                  borderRadius:16, padding:"14px 16px",
                  display:"flex", alignItems:"center", gap:14,
                  animation:"rideCardIn 0.4s ease forwards",
                  opacity: disabled ? 0.5 : 1,
                  transition:"transform 0.2s, box-shadow 0.2s",
                  cursor: disabled ? "not-allowed" : "pointer",
                  position:"relative", overflow:"hidden",
                }}
                  onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=isCheap?"0 8px 30px rgba(201,168,76,0.15)":"0 6px 20px rgba(0,0,0,0.2)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                >
                  {/* Gold pulse for cheapest */}
                  {isCheap && (
                    <div style={{
                      position:"absolute", inset:0, borderRadius:16, pointerEvents:"none",
                      animation:"goldPulse 2.5s ease infinite",
                    }} />
                  )}

                  {/* Provider logo */}
                  <div style={{
                    width:48, height:48, borderRadius:14, flexShrink:0,
                    background: disabled ? "rgba(255,255,255,0.03)" : `${p.tagColor}15`,
                    border:`1px solid ${disabled ? "var(--border)" : p.tagColor+"33"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:24,
                    filter: disabled ? "grayscale(1)" : "none",
                  }}>{p.emoji}</div>

                  {/* Center info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ color: disabled ? "var(--text3)" : "var(--text)", fontSize:14, fontWeight:700 }}>{p.name}</span>
                      {/* Coming Soon badge for disabled */}
                      {disabled && (
                        <span style={{
                          background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                          color:"var(--text3)", fontSize:"9px", fontWeight:700,
                          borderRadius:5, padding:"2px 7px", letterSpacing:"0.07em",
                        }}>COMING SOON</span>
                      )}
                      {!disabled && isCheap && (
                        <span style={{
                          background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.35)",
                          color:"var(--gold)", fontSize:"9px", fontWeight:800,
                          borderRadius:5, padding:"2px 7px", letterSpacing:"0.07em",
                        }}>✦ BEST PRICE</span>
                      )}
                      {!disabled && isFast && (
                        <span style={{
                          background:"rgba(0,212,170,0.1)", border:"1px solid rgba(0,212,170,0.3)",
                          color:"#00d4aa", fontSize:"9px", fontWeight:800,
                          borderRadius:5, padding:"2px 7px", letterSpacing:"0.07em",
                        }}>⚡ FASTEST</span>
                      )}
                      {!disabled && p.surge && (
                        <span style={{
                          background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                          color:"#ef4444", fontSize:"9px", fontWeight:700,
                          borderRadius:5, padding:"2px 7px",
                        }}>🔥 HIGH DEMAND</span>
                      )}
                    </div>
                    <div style={{ color:"var(--text3)", fontSize:11, marginBottom:3 }}>{p.type}</div>
                    {!disabled && (
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:"#00d4aa", animation:"pulse 1.5s infinite" }} />
                        <span style={{ color:"#00d4aa", fontSize:11, fontWeight:500 }}>{p.eta} min away</span>
                      </div>
                    )}
                    {disabled && (
                      <div style={{ color:"var(--text3)", fontSize:11 }}>Integration coming soon</div>
                    )}
                  </div>

                  {/* Fare + Book */}
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ textAlign:"right", marginBottom:8 }}>
                      <div style={{
                        fontFamily:"var(--font-display)", fontSize:22, fontWeight:800,
                        color: disabled ? "var(--text3)" : "var(--text)", lineHeight:1,
                      }}>~₹{p.fare}</div>
                      <div style={{ color:"var(--text3)", fontSize:9, marginTop:2, letterSpacing:"0.05em" }}>ESTIMATE</div>
                    </div>
                    {isOla ? (
                      <button
                        onClick={() => handleBook(p)}
                        style={{
                          background: isBooking
                            ? "var(--border2)"
                            : "linear-gradient(135deg, var(--gold), var(--gold2))",
                          border:"none",
                          borderRadius:9, padding:"8px 18px",
                          color: isBooking ? "var(--text3)" : "#080810",
                          fontSize:12, fontWeight:700,
                          cursor: isBooking ? "wait" : "pointer",
                          transition:"all 0.2s", letterSpacing:"0.04em",
                          minWidth:70,
                          boxShadow: isBooking ? "none" : "0 4px 14px rgba(201,168,76,0.35)",
                        }}
                      >
                        {isBooking ? "⏳" : "Book →"}
                      </button>
                    ) : (
                      <div style={{
                        background:"rgba(255,255,255,0.04)",
                        border:"1px solid var(--border)",
                        borderRadius:9, padding:"8px 14px",
                        color:"var(--text3)", fontSize:11,
                        cursor:"not-allowed", letterSpacing:"0.03em",
                      }}>Soon</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer disclaimer */}
          {shownCount === providers.length && providers.length > 0 && (
            <div style={{
              marginTop:18,
              background:"rgba(255,255,255,0.03)",
              border:"1px solid var(--border)",
              borderRadius:12, padding:"12px 14px",
            }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>ℹ️</span>
                <div>
                  <div style={{ color:"var(--text2)", fontSize:12, fontWeight:600, marginBottom:4 }}>
                    About fare estimates
                  </div>
                  <div style={{ color:"var(--text3)", fontSize:11, lineHeight:1.7 }}>
                    Fares shown are <strong style={{color:"var(--text2)"}}>estimates only</strong> based on distance.
                    Actual price may vary by ₹10–₹40 due to real-time traffic, surge pricing, and ride type.
                    Final fare is always confirmed inside the provider app before you book.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes rideCardIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: inset 0 0 0 1px rgba(201,168,76,0.1); }
          50%      { box-shadow: inset 0 0 0 1px rgba(201,168,76,0.4), 0 0 30px rgba(201,168,76,0.08); }
        }
      `}</style>
    </>
  );
}