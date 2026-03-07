"use client";
import { useEffect, useRef } from "react";

const COLORS = {
  cafe: "#ff6b35",
  restaurant: "#4ecdc4",
  sweet_shop: "#ffd23f",
  street_food: "#ff6b9d",
  nightlife: "#9b59b6",
  shopping: "#3498db",
};

const EMOJIS = {
  cafe: "☕",
  restaurant: "🍽️",
  sweet_shop: "🍮",
  street_food: "🌮",
  nightlife: "🍻",
  shopping: "🛍️",
};

const PRICE = ["", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];

export default function Map({ businesses, selected, onSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const initializedRef = useRef(false);

  // Initialize map once
  useEffect(() => {
    if (initializedRef.current) return;
    if (!mapRef.current) return;
    initializedRef.current = true;

    // Add leaflet CSS from CDN
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      const leaflet = L.default;
      leafletRef.current = leaflet;

      // Destroy any existing map on this element
      if (mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }

      const map = leaflet.map(mapRef.current, {
        center: [12.9716, 77.5946],
        zoom: 12,
      });

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  // Update markers when businesses change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    businesses.forEach((biz) => {
      if (!biz.location?.coordinates) return;
      const [lng, lat] = biz.location.coordinates;
      const color = COLORS[biz.category] || "#ff6b35";
      const emoji = EMOJIS[biz.category] || "📍";
      const isSelected = selected?._id === biz._id;
      const size = isSelected ? 44 : 36;

      const icon = leaflet.divIcon({
        className: "",
        html: `
          <div style="
            width:${size}px;height:${size}px;
            background:${color};
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 4px 15px ${color}88;
            display:flex;align-items:center;justify-content:center;
          ">
            <span style="transform:rotate(45deg);font-size:${isSelected ? 18 : 14}px">${emoji}</span>
          </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      });

      const marker = leaflet.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${emoji} ${biz.name}</div>
            <div style="color:#666;font-size:12px;margin-bottom:6px">📌 ${biz.address}</div>
            <div style="font-size:12px;display:flex;gap:8px">
              <span>⭐ ${biz.rating}</span>
              <span>${PRICE[biz.priceLevel] || ""}</span>
              ${biz.isHiddenGem ? "<span>💎 Hidden Gem</span>" : ""}
            </div>
            <div style="margin-top:4px;font-size:11px;color:#888">🕐 ${biz.openingHours}</div>
          </div>
        `);

      marker.on("click", () => onSelect(biz));
      markersRef.current.push(marker);
    });
  }, [businesses, selected]);

  // Fly to selected business
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selected?.location?.coordinates) return;
    const [lng, lat] = selected.location.coordinates;
    map.flyTo([lat, lng], 16, { duration: 1.2 });
  }, [selected]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}