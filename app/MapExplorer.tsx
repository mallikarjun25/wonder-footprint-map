"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Location } from "./locations";

type GeoLocation = Location & { latitude: number; longitude: number };

export default function MapExplorer({ locations }: { locations: GeoLocation[] }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [state, setState] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GeoLocation | null>(null);

  const states = useMemo(() => [...new Set(locations.map((l) => l.state))].sort(), [locations]);
  const visible = useMemo(() => locations.filter((l) =>
    (state === "ALL" || l.state === state) &&
    `${l.name} ${l.address}`.toLowerCase().includes(query.toLowerCase())
  ), [locations, state, query]);

  useEffect(() => {
    let active = true;
    import("leaflet").then((L) => {
      if (!active || !mapNode.current || mapRef.current) return;
      const map = L.map(mapNode.current, { zoomControl: false, attributionControl: true });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      map.setView([40.25, -74.15], 6);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
    });
    return () => { active = false; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    import("leaflet").then((L) => {
      layerRef.current.clearLayers();
      const bounds: [number, number][] = [];
      visible.forEach((loc) => {
        const marker = L.circleMarker([loc.latitude, loc.longitude], {
          radius: selected?.slug === loc.slug ? 9 : 6,
          color: loc.status === "renovation" ? "#ef7d32" : "#0a4d3c",
          weight: 2,
          fillColor: loc.status === "renovation" ? "#fff3e8" : "#f8f1e6",
          fillOpacity: 1,
        }).addTo(layerRef.current);
        marker.bindTooltip(loc.name, { direction: "top", offset: [0, -7] });
        marker.on("click", () => setSelected(loc));
        bounds.push([loc.latitude, loc.longitude]);
      });
      if (bounds.length) mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: state === "ALL" ? 7 : 10 });
    });
  }, [visible, state, selected?.slug]);

  const focus = (loc: GeoLocation) => {
    setSelected(loc);
    mapRef.current?.flyTo([loc.latitude, loc.longitude], 12, { duration: .8 });
  };

  return (
    <section className="explorer" aria-label="Wonder location explorer">
      <aside className="side-panel">
        <div className="controls">
          <label className="search-label">
            <span className="sr-only">Search locations</span>
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city or address" />
          </label>
          <div className="state-row" aria-label="Filter by state">
            <button className={state === "ALL" ? "active" : ""} onClick={() => setState("ALL")}>All</button>
            {states.map((s) => <button key={s} className={state === s ? "active" : ""} onClick={() => setState(s)}>{s}</button>)}
          </div>
        </div>
        <div className="result-head"><strong>{visible.length}</strong> locations <span>•</span> {state === "ALL" ? "Northeast network" : state}</div>
        <div className="location-list">
          {visible.map((loc) => (
            <button key={loc.slug} className={`location-card ${selected?.slug === loc.slug ? "selected" : ""}`} onClick={() => focus(loc)}>
              <span className="pin-dot" />
              <span><strong>{loc.name}</strong><small>{loc.address}</small>{loc.status === "renovation" && <em>Closed for renovations</em>}</span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="map-wrap">
        <div ref={mapNode} className="map" />
        <div className="map-key"><span className="open-dot" /> Open <span className="reno-dot" /> Renovation</div>
        {selected && <div className="detail-card">
          <button className="close" onClick={() => setSelected(null)} aria-label="Close location details">×</button>
          <span className="eyebrow">{selected.state} LOCATION</span>
          <h2>{selected.name}</h2>
          <p>{selected.address}</p>
          {selected.status === "renovation" && <div className="status-note">Temporarily closed for renovations</div>}
          <div className="detail-actions">
            <a href={`https://www.wonder.com/food-delivery-locations/${selected.slug}`} target="_blank" rel="noreferrer">View official location</a>
            <a className="outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer">Directions</a>
          </div>
        </div>}
      </div>
    </section>
  );
}

