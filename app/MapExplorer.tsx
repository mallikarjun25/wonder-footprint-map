"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Location } from "./locations";

type GeoLocation = Location & { latitude: number; longitude: number; distance?: number };
type UserPosition = { latitude: number; longitude: number };

function milesBetween(a: UserPosition, b: UserPosition) {
  const radius = 3958.8;
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

export default function MapExplorer({ locations }: { locations: GeoLocation[] }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [state, setState] = useState("ALL");
  const [status, setStatus] = useState<"ALL" | "OPEN" | "COMING">("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GeoLocation | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [nearMode, setNearMode] = useState(false);
  const [locationState, setLocationState] = useState<"idle" | "locating" | "denied" | "unavailable">("idle");

  const states = useMemo(() => [...new Set(locations.map((l) => l.state))].sort(), [locations]);
  const filtered = useMemo(() => locations.filter((location) =>
    (state === "ALL" || location.state === state) &&
    (status === "ALL" || (status === "COMING" ? location.status === "coming-soon" : location.status !== "coming-soon")) &&
    `${location.name} ${location.address}`.toLowerCase().includes(query.toLowerCase())
  ), [locations, state, status, query]);

  const nearby = useMemo(() => {
    if (!userPosition) return [];
    return locations
      .filter((location) => !location.status)
      .map((location) => ({ ...location, distance: milesBetween(userPosition, location) }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 12);
  }, [locations, userPosition]);

  const visible = nearMode ? nearby : filtered;

  useEffect(() => {
    let active = true;
    import("leaflet").then((L) => {
      if (!active || !mapNode.current || mapRef.current) return;
      const map = L.map(mapNode.current, {
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      map.setView([40.25, -74.15], 6);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    });
    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !layerRef.current) return;
    import("leaflet").then((L) => {
      layerRef.current.clearLayers();
      const bounds: [number, number][] = [];
      visible.forEach((location) => {
        const marker = L.circleMarker([location.latitude, location.longitude], {
          radius: location.status === "coming-soon" ? 6.5 : 6,
          color: location.status === "coming-soon" || location.status === "renovation" ? "#d8783d" : "#044123",
          weight: 2,
          fillColor: location.status === "coming-soon" ? "#d8783d" : "#fcf7ed",
          fillOpacity: location.status === "coming-soon" ? .9 : 1,
          dashArray: location.status === "renovation" ? "3 3" : undefined,
        }).addTo(layerRef.current);
        marker.bindTooltip(location.name, { direction: "top", offset: [0, -7] });
        marker.on("click", () => focusLocation(location));
        bounds.push([location.latitude, location.longitude]);
      });
      if (bounds.length && !nearMode) {
        mapRef.current.flyToBounds(bounds, { padding: [42, 42], maxZoom: state === "ALL" ? 7 : 10, duration: 1.1 });
      }
    });
  }, [mapReady, visible, nearMode, state]);

  useEffect(() => {
    if (!mapReady || !userPosition || !userLayerRef.current) return;
    import("leaflet").then((L) => {
      userLayerRef.current.clearLayers();
      L.circleMarker([userPosition.latitude, userPosition.longitude], {
        radius: 9,
        color: "#044123",
        weight: 3,
        fillColor: "#ffffff",
        fillOpacity: 1,
      }).bindTooltip("Your location", { permanent: false, direction: "top" }).addTo(userLayerRef.current);
    });
  }, [mapReady, userPosition]);

  useEffect(() => {
    if (!mapReady || !nearMode || !userPosition || !nearby.length) return;
    const bounds: [number, number][] = [
      [userPosition.latitude, userPosition.longitude],
      ...nearby.slice(0, 6).map((location) => [location.latitude, location.longitude] as [number, number]),
    ];
    mapRef.current.flyToBounds(bounds, { padding: [58, 58], maxZoom: 11, duration: 1.25 });
  }, [mapReady, nearMode, userPosition, nearby]);

  const focusLocation = (location: GeoLocation) => {
    setSelected(location);
    mapRef.current?.flyTo([location.latitude, location.longitude], 13, { duration: 1.15, easeLinearity: .22 });
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      return;
    }
    setLocationState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition({ latitude: coords.latitude, longitude: coords.longitude });
        setNearMode(true);
        setState("ALL");
        setStatus("OPEN");
        setQuery("");
        setSelected(null);
        setLocationState("idle");
      },
      (error) => setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  };

  const resetNearMe = () => {
    setNearMode(false);
    setState("ALL");
    setStatus("ALL");
    setSelected(null);
  };

  const changeFilter = (callback: () => void) => {
    setNearMode(false);
    callback();
  };

  return (
    <section className="explorer" aria-label="Wonder location explorer">
      <aside className="side-panel">
        <div className="controls">
          <label className="search-label">
            <span className="sr-only">Search locations</span>
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => changeFilter(() => setQuery(event.target.value))} placeholder="Search city or address" />
          </label>
          <button className={`near-button ${nearMode ? "active" : ""}`} onClick={nearMode ? resetNearMe : locateMe} disabled={locationState === "locating"}>
            <span className="locate-icon" aria-hidden="true">◎</span>
            {locationState === "locating" ? "Finding your location…" : nearMode ? "Showing locations near you" : "Find locations near me"}
            <span aria-hidden="true">→</span>
          </button>
          {(locationState === "denied" || locationState === "unavailable") && <p className="location-message">{locationState === "denied" ? "Location access was declined. You can enable it in your browser settings." : "We couldn’t determine your location. Try searching by city or address."}</p>}
          <div className="state-row" aria-label="Filter by state">
            <button className={state === "ALL" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => setState("ALL"))}>All</button>
            {states.map((item) => <button key={item} className={state === item && !nearMode ? "active" : ""} onClick={() => changeFilter(() => setState(item))}>{item}</button>)}
          </div>
          <div className="status-row" aria-label="Filter by operating status">
            <button className={status === "ALL" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => setStatus("ALL"))}>All locations</button>
            <button className={status === "OPEN" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => setStatus("OPEN"))}>Open</button>
            <button className={status === "COMING" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => setStatus("COMING"))}>Coming soon</button>
          </div>
        </div>
        <div className="result-head"><strong>{visible.length}</strong> {nearMode ? "nearest open locations" : "locations"} <span>•</span> {nearMode ? "sorted by distance" : state === "ALL" ? "Northeast network" : state}</div>
        <div className="location-list">
          {visible.map((location) => (
            <button key={location.slug} className={`location-card ${selected?.slug === location.slug ? "selected" : ""}`} onClick={() => focusLocation(location)}>
              <span className={`pin-dot ${location.status === "coming-soon" ? "planned" : ""}`} />
              <span><strong>{location.name}</strong><small>{location.address}</small>{location.distance !== undefined && <em className="distance">{location.distance.toFixed(1)} miles away</em>}{location.status === "renovation" && <em>Closed for renovations</em>}{location.status === "coming-soon" && <em>Coming {location.plannedFor}</em>}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="map-wrap">
        <div ref={mapNode} className="map" />
        <div className="map-key"><span className="open-dot" /> Open <span className="reno-dot hollow" /> Renovation <span className="reno-dot" /> Coming soon</div>
        {!mapReady && <div className="map-loading">Loading locations…</div>}
        {selected && <div className="detail-card">
          <button className="close" onClick={() => setSelected(null)} aria-label="Close location details">×</button>
          <span className="eyebrow">{selected.state} LOCATION</span>
          <h2>{selected.name}</h2>
          <p>{selected.address}</p>
          {selected.distance !== undefined && <p className="distance-copy">Approximately {selected.distance.toFixed(1)} miles from you</p>}
          {selected.status === "renovation" && <div className="status-note">Temporarily closed for renovations</div>}
          {selected.status === "coming-soon" && <div className="status-note">Announced for {selected.plannedFor} · exact address not yet published</div>}
          <div className="detail-actions">
            <a href={`https://www.wonder.com/food-delivery-locations/${selected.slug}`} target="_blank" rel="noreferrer">View official listing</a>
            {selected.status !== "coming-soon" && <a className="outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer">Directions</a>}
          </div>
        </div>}
      </div>
    </section>
  );
}

