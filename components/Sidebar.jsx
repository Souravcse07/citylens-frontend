"use client";

const COLORS = {
  cafe: "#c9a84c", restaurant: "#00d4aa", sweet_shop: "#ff9f43",
  street_food: "#ff6b9d", nightlife: "#a855f7", shopping: "#3b82f6",
};
const EMOJIS = {
  cafe: "☕", restaurant: "🍽", sweet_shop: "🍮",
  street_food: "🌮", nightlife: "🍻", shopping: "🛍",
};
const PRICE = ["", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];

export default function Sidebar({ businesses, selected, onSelect, loading }) {
  return (
    <div style={{
      width: "300px", flexShrink: 0,
      // FIX: was hardcoded rgba(8,8,16,0.92) — now uses CSS var
      background: "var(--bg2)",
      backdropFilter: "blur(24px)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        padding: "16px 18px 12px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "13px", color: "var(--text)",
          letterSpacing: "0.06em", fontWeight: 700,
        }}>NEARBY PLACES</div>
        <div style={{ color: "var(--text3)", fontSize: "11px", marginTop: "2px" }}>
          {businesses.length} results
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1, padding: "10px 10px" }}>
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{
              height: "80px", marginBottom: "8px", borderRadius: "12px",
              animationDelay: `${i * 0.1}s`,
            }} />
          ))
        ) : businesses.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            color: "var(--text3)",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px", opacity: 0.4 }}>◎</div>
            <p style={{ fontSize: "13px" }}>No places found</p>
          </div>
        ) : (
          businesses.map((biz, i) => {
            const isSelected = selected?._id === biz._id;
            const color = COLORS[biz.category] || "var(--gold)";
            return (
              <div key={biz._id} onClick={() => onSelect(biz)}
                className="fade-up"
                style={{
                  padding: "12px 14px",
                  marginBottom: "6px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  background: isSelected
                    ? `linear-gradient(135deg, ${color}18, ${color}08)`
                    : "var(--glass)",
                  border: `1px solid ${isSelected ? color + "44" : "var(--border)"}`,
                  transition: "all 0.2s",
                  animationDelay: `${i * 0.04}s`,
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "var(--glass2)";
                    e.currentTarget.style.borderColor = "var(--border2)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "var(--glass)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
              >
                {/* Left accent */}
                {isSelected && (
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: "3px", background: color, borderRadius: "3px 0 0 3px",
                  }} />
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    background: `${color}18`,
                    border: `1px solid ${color}33`,
                    borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px",
                  }}>{EMOJIS[biz.category] || "📍"}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <span style={{
                        color: "var(--text)", fontSize: "13px", fontWeight: 600,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        flex: 1,
                      }}>{biz.name}</span>
                      {biz.isHiddenGem && (
                        <span style={{
                          fontSize: "9px", color: "var(--gold)",
                          border: "1px solid rgba(201,168,76,0.3)",
                          borderRadius: "4px", padding: "1px 5px",
                          background: "rgba(201,168,76,0.1)",
                          flexShrink: 0,
                        }}>GEM</span>
                      )}
                    </div>

                    {/* Address */}
                    <div style={{
                      color: "var(--text3)", fontSize: "11px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      marginBottom: "6px",
                    }}>{biz.address}</div>

                    {/* Stats row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#f59e0b", fontSize: "11px" }}>
                        ★ {biz.rating}
                      </span>
                      <span style={{ color: "var(--text3)", fontSize: "10px" }}>
                        {PRICE[biz.priceLevel]}
                      </span>
                      <span style={{
                        marginLeft: "auto",
                        color: "var(--text3)", fontSize: "10px",
                        display: "flex", alignItems: "center", gap: "3px",
                      }}>
                        <span style={{ color: color }}>▲</span> {biz.popularityScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}