"use client";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import BookRideModal from "./BookRideModal";

const CLOUDINARY_CLOUD = "dylenkxkp";
const CLOUDINARY_PRESET = "citylens";

const COLORS = {
  cafe: "#ff6b35", restaurant: "#4ecdc4", sweet_shop: "#ffd23f",
  street_food: "#ff6b9d", nightlife: "#9b59b6", shopping: "#3498db",
};
const EMOJIS = {
  cafe: "☕", restaurant: "🍽️", sweet_shop: "🍮",
  street_food: "🌮", nightlife: "🍻", shopping: "🛍️",
};
const PRICE = ["", "₹ Budget", "₹₹ Moderate", "₹₹₹ Expensive", "₹₹₹₹ Luxury"];

function Stars({ rating, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map((star) => (
        <span key={star}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            fontSize: interactive ? "28px" : "16px",
            color: star <= (hover || rating) ? "#ffd23f" : "#444",
            cursor: interactive ? "pointer" : "default",
            transition: "color 0.1s",
          }}
        >★</span>
      ))}
      {!interactive && (
        <span style={{ color: "var(--muted)", marginLeft: "6px", fontSize: "13px" }}>{rating}/5</span>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div style={{
      background: "var(--surface2)", borderRadius: "10px",
      padding: "14px", marginBottom: "10px", border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <div style={{
          width: 36, height: 36, background: "var(--accent)", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: 700, color: "white",
        }}>{review.userId?.name?.[0] || "U"}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>{review.userId?.name || "User"}</div>
          <Stars rating={review.rating} />
        </div>
        <div style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "11px" }}>
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.6 }}>{review.comment}</p>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div style={{
      background: "var(--surface2)", borderRadius: "10px",
      padding: "14px", marginBottom: "10px", border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div style={{
          width: 36, height: 36, background: "#4ecdc4", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: 700, color: "white",
        }}>{post.userId?.name?.[0] || "U"}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>{post.userId?.name || "User"}</div>
          <div style={{ color: "var(--muted)", fontSize: "11px" }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post" style={{
          width: "100%", borderRadius: "8px", marginBottom: "8px",
          maxHeight: "200px", objectFit: "cover",
        }} />
      )}
      {post.caption && (
        <p style={{ color: "var(--text)", fontSize: "13px", lineHeight: 1.6 }}>{post.caption}</p>
      )}
      <div style={{ marginTop: "8px", color: "var(--muted)", fontSize: "12px" }}>
        ❤️ {post.likes?.length || 0} likes
      </div>
    </div>
  );
}

function ImageUploader({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, formData
      );
      onUploaded(res.data.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} style={{ display: "none" }} />
      {preview ? (
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <img src={preview} alt="preview" style={{
            width: "100%", borderRadius: "10px", maxHeight: "180px", objectFit: "cover",
          }} />
          {uploading && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
              borderRadius: "10px", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontSize: "13px", fontWeight: 600,
            }}>⏳ Uploading...</div>
          )}
          {!uploading && (
            <button onClick={() => { setPreview(null); onUploaded(""); fileRef.current.value = ""; }}
              style={{
                position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)",
                border: "none", borderRadius: "50%", width: 28, height: 28,
                color: "white", cursor: "pointer", fontSize: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
          )}
        </div>
      ) : (
        <div onClick={() => fileRef.current.click()} style={{
          border: "2px dashed var(--border)", borderRadius: "10px",
          padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: "10px",
          transition: "border-color 0.2s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <div style={{ fontSize: "28px", marginBottom: "6px" }}>📷</div>
          <div style={{ color: "var(--muted)", fontSize: "13px" }}>Click to upload a photo</div>
          <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "4px" }}>JPG, PNG, WEBP supported</div>
        </div>
      )}
    </div>
  );
}

// ── In-app Directions Map ─────────────────────────────────
function DirectionsMap({ business, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const initializedRef = useRef(false);
  const [status, setStatus] = useState("📍 Getting your location...");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const destLat = business.location.coordinates[1];
    const destLng = business.location.coordinates[0];

    // Add leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      const leaflet = L.default;
      if (mapRef.current._leaflet_id) mapRef.current._leaflet_id = null;

      const map = leaflet.map(mapRef.current, {
        center: [destLat, destLng],
        zoom: 14,
      });

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;

      // Destination marker
      const destIcon = leaflet.divIcon({
        className: "",
        html: `<div style="background:#ff6b35;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:36px;height:36px;box-shadow:0 4px 15px #ff6b3588;display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:16px">${EMOJIS[business.category] || "📍"}</span></div>`,
        iconSize: [36, 36], iconAnchor: [18, 36],
      });

      leaflet.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>${business.name}</b><br>${business.address}`)
        .openPopup();

      // Get user location
      if (!navigator.geolocation) {
        setStatus("⚠️ Geolocation not supported");
        return;
      }

      // refs to update without re-initializing map
      let userMarker = null;
      let routeLine = null;
      let firstFix = true;

      const userIcon = leaflet.divIcon({
        className: "",
        html: `<div style="background:#4ecdc4;border:3px solid white;border-radius:50%;width:20px;height:20px;box-shadow:0 0 0 6px #4ecdc444;"></div>`,
        iconSize: [20, 20], iconAnchor: [10, 10],
      });

      const drawRoute = async (userLat, userLng) => {
        // Move or create user marker
        if (userMarker) {
          userMarker.setLatLng([userLat, userLng]);
        } else {
          userMarker = leaflet.marker([userLat, userLng], { icon: userIcon })
            .addTo(map)
            .bindPopup("📍 You are here");
        }

        // Fit bounds only on first fix
        if (firstFix) {
          map.fitBounds(leaflet.latLngBounds([
            [userLat, userLng], [destLat, destLng],
          ]).pad(0.2));
          firstFix = false;
        }

        setStatus("🔍 Updating route...");

        // Fetch route from OSRM
        try {
          const routeRes = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`
          );
          const routeData = await routeRes.json();

          if (routeData.routes && routeData.routes.length > 0) {
            const route = routeData.routes[0];
            const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

            // Remove old route line and draw new one
            if (routeLine) routeLine.remove();
            routeLine = leaflet.polyline(coords, {
              color: "#ff6b35", weight: 5, opacity: 0.8,
            }).addTo(map);

            const km = (route.distance / 1000).toFixed(1);
            const mins = Math.ceil(route.duration / 60);
            setStatus("📍 Live tracking active");
            setInfo({ km, mins });
          } else {
            setStatus("⚠️ No route found");
          }
        } catch {
          setStatus("⚠️ Could not load route");
        }
      };

      // First try getCurrentPosition for immediate fix
      navigator.geolocation.getCurrentPosition(
        (pos) => drawRoute(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn("GPS error:", err.code, err.message);
          if (err.code === 1) {
            // PERMISSION_DENIED
            setStatus("❌ Location blocked — allow in browser settings & retry");
          } else if (err.code === 2) {
            // POSITION_UNAVAILABLE
            setStatus("⚠️ Location unavailable — check GPS signal");
          } else {
            setStatus("⚠️ Location timed out — retrying...");
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );

      // watchPosition = live updates as user moves
      const watchId = navigator.geolocation.watchPosition(
        (pos) => drawRoute(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          if (err.code === 1) {
            setStatus("❌ Location blocked — tap 🔒 in address bar → Allow Location → refresh");
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      // Store watchId so we can clear it on unmount
      mapInstanceRef.watchId = watchId;
    });

    return () => {
      // Stop live tracking when modal closes
      if (mapInstanceRef.watchId !== undefined) {
        navigator.geolocation.clearWatch(mapInstanceRef.watchId);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        zIndex: 1100, backdropFilter: "blur(4px)",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "640px", maxWidth: "95vw",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "20px", zIndex: 1200,
        overflow: "hidden", animation: "fadeUp 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--surface2)",
        }}>
          <div>
            <h3 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700,
              fontSize: "16px", color: "var(--text)",
            }}>🗺️ Directions to {business.name}</h3>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:"2px" }}>
              <p style={{ color: status.startsWith("❌") ? "#ef4444" : "var(--muted)", fontSize: "12px" }}>{status}</p>
              {status.startsWith("❌") && (
                <button onClick={() => {
                  setStatus("🔍 Retrying location...");
                  navigator.geolocation.getCurrentPosition(
                    () => setStatus("✅ Location found! Loading route..."),
                    () => setStatus("❌ Still blocked — allow in browser 🔒"),
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                  );
                }} style={{
                  background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.3)",
                  borderRadius:6, padding:"2px 8px",
                  color:"var(--gold)", fontSize:10, cursor:"pointer", fontWeight:700,
                  whiteSpace:"nowrap",
                }}>↺ Retry</button>
              )}
            </div>
          </div>
          {info && (
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{
                background: "#ff6b3522", border: "1px solid #ff6b3544",
                borderRadius: "10px", padding: "8px 14px", textAlign: "center",
              }}>
                <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: "16px" }}>{info.km} km</div>
                <div style={{ color: "var(--muted)", fontSize: "11px" }}>Distance</div>
              </div>
              <div style={{
                background: "#4ecdc422", border: "1px solid #4ecdc444",
                borderRadius: "10px", padding: "8px 14px", textAlign: "center",
              }}>
                <div style={{ color: "#4ecdc4", fontWeight: 700, fontSize: "16px" }}>{info.mins} min</div>
                <div style={{ color: "var(--muted)", fontSize: "11px" }}>Drive time</div>
              </div>
            </div>
          )}
          <button onClick={onClose} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
            color: "var(--text)", fontSize: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ width: "100%", height: "420px" }} />

        {/* Legend */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid var(--border)",
          display: "flex", gap: "20px", fontSize: "12px", color: "var(--muted)",
          background: "var(--surface2)",
        }}>
          <span>🔵 Your location</span>
          <span>🟠 {business.name}</span>
          <span>🟠 Orange line = Route</span>
        </div>
      </div>
    </>
  );
}

export default function BusinessPanel({ business, onClose, currentUser, onLoginRequired }) {
  const [tab, setTab] = useState("info");
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [showRide, setShowRide]             = useState(false);


  const [showPostForm, setShowPostForm] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postingPost, setPostingPost] = useState(false);
  const [postMsg, setPostMsg] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [postingReview, setPostingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    if (tab === "posts") {
      setLoadingPosts(true);
      axios.get(`${API}/api/posts/business/${business._id}`)
        .then((res) => { setPosts(res.data); setLoadingPosts(false); })
        .catch(() => setLoadingPosts(false));
    }
    if (tab === "reviews") {
      setLoadingReviews(true);
      axios.get(`${API}/api/reviews/${business._id}`)
        .then((res) => { setReviews(res.data); setLoadingReviews(false); })
        .catch(() => setLoadingReviews(false));
    }
  }, [tab, business]);

  const handlePost = async () => {
    if (!currentUser) { onLoginRequired(); return; }
    if (!postCaption.trim()) return;
    setPostingPost(true);
    try {
      const res = await axios.post(`${API}/api/posts`, {
        userId: currentUser._id, businessId: business._id,
        caption: postCaption, imageUrl: postImageUrl,
      });
      setPosts([res.data, ...posts]);
      setPostCaption(""); setPostImageUrl("");
      setShowPostForm(false);
      setPostMsg("✅ Post shared!");
      setTimeout(() => setPostMsg(""), 3000);
    } catch { setPostMsg("❌ Failed to post"); }
    finally { setPostingPost(false); }
  };

  const handleReview = async () => {
    if (!currentUser) { onLoginRequired(); return; }
    if (!reviewRating || !reviewComment.trim()) return;
    setPostingReview(true);
    try {
      const res = await axios.post(`${API}/api/reviews`, {
        userId: currentUser._id, businessId: business._id,
        rating: reviewRating, comment: reviewComment,
      });
      setReviews([res.data, ...reviews]);
      setReviewRating(0); setReviewComment("");
      setShowReviewForm(false);
      setReviewMsg("✅ Review posted!");
      setTimeout(() => setReviewMsg(""), 3000);
    } catch { setReviewMsg("❌ Failed to post review"); }
    finally { setPostingReview(false); }
  };

  if (!business) return null;
  const color = COLORS[business.category] || "#ff6b35";
  const emoji = EMOJIS[business.category] || "📍";

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 999,
      }} />

      <div style={{
        position: "fixed",
        top: typeof window !== "undefined" && window.innerWidth < 768 ? 0 : 64,
        right: 0, bottom: 0,
        width: typeof window !== "undefined" && window.innerWidth < 768 ? "100vw" : "420px",
        background: "var(--surface)", borderLeft: "1px solid var(--border)",
        zIndex: 1000, display: "flex", flexDirection: "column",
        animation: "slideIn 0.3s ease", overflowY: "auto",
      }}>
        {/* Hero */}
        <div style={{
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          borderBottom: `3px solid ${color}`,
          padding: "24px", position: "relative", flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: "50%", width: 32, height: 32,
            cursor: "pointer", color: "var(--text)", fontSize: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: `${color}22`, border: `1px solid ${color}44`,
            borderRadius: "20px", padding: "4px 12px",
            fontSize: "12px", color, marginBottom: "12px", textTransform: "capitalize",
          }}>{emoji} {business.category.replace("_", " ")}</div>

          <h2 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "22px",
            color: "var(--text)", marginBottom: "8px", paddingRight: "40px",
          }}>{business.name}</h2>

          {business.isHiddenGem && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#ffd23f22", border: "1px solid #ffd23f44",
              borderRadius: "20px", padding: "4px 12px",
              fontSize: "12px", color: "#ffd23f", marginBottom: "12px",
            }}>💎 Hidden Gem</div>
          )}

          <Stars rating={business.rating} />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
            <div style={{ color: "var(--muted)", fontSize: "13px" }}>📌 {business.address}</div>
            <div style={{ color: "var(--muted)", fontSize: "13px" }}>🕐 {business.openingHours}</div>
            {business.phone && <div style={{ color: "var(--muted)", fontSize: "13px" }}>📞 {business.phone}</div>}
            <div style={{ color: "var(--muted)", fontSize: "13px" }}>💰 {PRICE[business.priceLevel]}</div>
          </div>

          {/* Action Buttons - Premium */}
          <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowDirections(true)} style={{
                flex: 1, padding: "12px 10px",
                background: "var(--glass)", border: "1px solid var(--border2)",
                borderRadius: "12px", color: "var(--text)",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="var(--text2)"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.transform="translateY(0)"; }}
              >🗺️ Directions</button>

              <button onClick={() => setShowRide(true)} style={{
                flex: 1, padding: "12px 10px",
                background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                border: "none", borderRadius: "12px", color: "#080810",
                fontSize: "13px", fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
                transition: "all 0.2s", letterSpacing: "0.02em",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(201,168,76,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(201,168,76,0.4)"; }}
              >🚕 Book Ride</button>
            </div>

            {business.phone ? (
              <a href={`tel:${business.phone}`} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                padding: "10px", background: "transparent",
                border: "1px solid var(--border)", borderRadius: "12px",
                color: "var(--text2)", fontSize: "13px", fontWeight: 500,
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.color=color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text2)"; }}
              >📞 Call {business.name.split(" ")[0]}</a>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                padding: "10px", border: "1px solid var(--border)",
                borderRadius: "12px", color: "var(--text3)", fontSize: "13px",
              }}>📞 No phone listed</div>
            )}

          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {["info", "reviews", "posts"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "14px", background: "transparent", border: "none",
              borderBottom: tab === t ? `2px solid ${color}` : "2px solid transparent",
              color: tab === t ? color : "var(--muted)",
              fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}>
              {t === "info" ? "ℹ️ Info" : t === "reviews" ? `⭐ Reviews (${reviews.length})` : `📸 Posts (${posts.length})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "20px", flex: 1 }}>

          {/* INFO */}
          {tab === "info" && (
            <div style={{
              background: "var(--surface2)", borderRadius: "12px",
              padding: "16px", border: "1px solid var(--border)",
            }}>
              {[
                { label: "Category", value: business.category.replace("_", " "), emoji: "🏷️" },
                { label: "Address", value: business.address, emoji: "📌" },
                { label: "Hours", value: business.openingHours, emoji: "🕐" },
                { label: "Phone", value: business.phone || "Not listed", emoji: "📞" },
                { label: "Price", value: PRICE[business.priceLevel], emoji: "💰" },
                { label: "Rating", value: `${business.rating} / 5`, emoji: "⭐" },
                { label: "Popularity", value: `${business.popularityScore} check-ins`, emoji: "🔥" },
                { label: "Hidden Gem", value: business.isHiddenGem ? "Yes 💎" : "No", emoji: "✨" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: "13px",
                }}>
                  <span style={{ color: "var(--muted)" }}>{item.emoji} {item.label}</span>
                  <span style={{ color: "var(--text)", fontWeight: 500, textTransform: "capitalize" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* REVIEWS */}
          {tab === "reviews" && (
            <div>
              {!showReviewForm ? (
                <button onClick={() => {
                  if (!currentUser) { onLoginRequired(); return; }
                  setShowReviewForm(true);
                }} style={{
                  width: "100%", padding: "12px",
                  background: `${color}22`, border: `1px solid ${color}44`,
                  borderRadius: "12px", color, fontSize: "14px",
                  fontWeight: 600, cursor: "pointer", marginBottom: "16px",
                }}>⭐ Write a Review</button>
              ) : (
                <div style={{
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: "12px", padding: "16px", marginBottom: "16px",
                }}>
                  <p style={{ color: "var(--text)", fontSize: "13px", marginBottom: "10px", fontWeight: 600 }}>
                    Tap stars to rate:
                  </p>
                  <Stars rating={reviewRating} interactive onRate={setReviewRating} />
                  <textarea
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%", marginTop: "12px",
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: "10px", padding: "12px",
                      color: "var(--text)", fontSize: "13px",
                      resize: "vertical", outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button onClick={handleReview}
                      disabled={postingReview || !reviewRating || !reviewComment.trim()}
                      style={{
                        flex: 1, padding: "10px",
                        background: reviewRating && reviewComment.trim() ? color : "var(--border)",
                        border: "none", borderRadius: "10px",
                        color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                      }}>{postingReview ? "Posting..." : "Post Review"}</button>
                    <button onClick={() => setShowReviewForm(false)} style={{
                      padding: "10px 16px", background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: "10px",
                      color: "var(--muted)", fontSize: "13px", cursor: "pointer",
                    }}>Cancel</button>
                  </div>
                </div>
              )}
              {reviewMsg && (
                <div style={{
                  padding: "10px 14px", borderRadius: "10px", marginBottom: "12px",
                  background: reviewMsg.includes("✅") ? "#4ecdc422" : "#ff6b3522",
                  color: reviewMsg.includes("✅") ? "#4ecdc4" : "var(--accent)", fontSize: "13px",
                }}>{reviewMsg}</div>
              )}
              {loadingReviews ? (
                <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px" }}>Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>⭐</div>
                  <p>No reviews yet. Be the first!</p>
                </div>
              ) : reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
            </div>
          )}

          {/* POSTS */}
          {tab === "posts" && (
            <div>
              {!showPostForm ? (
                <button onClick={() => {
                  if (!currentUser) { onLoginRequired(); return; }
                  setShowPostForm(true);
                }} style={{
                  width: "100%", padding: "12px",
                  background: `${color}22`, border: `1px solid ${color}44`,
                  borderRadius: "12px", color, fontSize: "14px",
                  fontWeight: 600, cursor: "pointer", marginBottom: "16px",
                }}>📸 Share a Photo</button>
              ) : (
                <div style={{
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: "12px", padding: "16px", marginBottom: "16px",
                }}>
                  <ImageUploader onUploaded={(url) => setPostImageUrl(url)} />
                  <textarea
                    placeholder="Write something about this place..."
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%", background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: "10px",
                      padding: "12px", color: "var(--text)", fontSize: "13px",
                      resize: "vertical", outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button onClick={handlePost}
                      disabled={postingPost || !postCaption.trim()}
                      style={{
                        flex: 1, padding: "10px",
                        background: postCaption.trim() ? color : "var(--border)",
                        border: "none", borderRadius: "10px",
                        color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                      }}>{postingPost ? "Sharing..." : "Share Post"}</button>
                    <button onClick={() => setShowPostForm(false)} style={{
                      padding: "10px 16px", background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: "10px",
                      color: "var(--muted)", fontSize: "13px", cursor: "pointer",
                    }}>Cancel</button>
                  </div>
                </div>
              )}
              {postMsg && (
                <div style={{
                  padding: "10px 14px", borderRadius: "10px", marginBottom: "12px",
                  background: postMsg.includes("✅") ? "#4ecdc422" : "#ff6b3522",
                  color: postMsg.includes("✅") ? "#4ecdc4" : "var(--accent)", fontSize: "13px",
                }}>{postMsg}</div>
              )}
              {loadingPosts ? (
                <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px" }}>Loading posts...</div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📸</div>
                  <p>No posts yet. Be the first!</p>
                </div>
              ) : posts.map((p) => <PostCard key={p._id} post={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* In-app directions modal */}
      {showDirections && (
        <DirectionsMap business={business} onClose={() => setShowDirections(false)} />
      )}

      {/* Book Ride modal */}
      {showRide && (
        <BookRideModal business={business} onClose={() => setShowRide(false)} />
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}