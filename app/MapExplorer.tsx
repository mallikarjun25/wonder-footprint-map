"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Location } from "./locations";

type GeoLocation = Location & { latitude: number; longitude: number; distance?: number };
type UserPosition = { latitude: number; longitude: number };
type Availability = "ALL" | "OPEN_NOW" | "CLOSED_NOW";

function localMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  return Number(parts.find((part) => part.type === "hour")?.value) * 60 + Number(parts.find((part) => part.type === "minute")?.value);
}

function isOpenAt(location: Location, minutes: number) {
  if (location.status || location.opensAt === undefined || location.closesAt === undefined) return false;
  return location.closesAt > location.opensAt ? minutes >= location.opensAt && minutes < location.closesAt : minutes >= location.opensAt || minutes < location.closesAt;
}

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
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const userLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [state, setState] = useState("ALL");
  const [status, setStatus] = useState<"ALL" | "COMING" | "RENOVATION">("ALL");
  const [availability, setAvailability] = useState<Availability>("ALL");
  const [now, setNow] = useState(() => new Date());
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GeoLocation | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [nearMode, setNearMode] = useState(false);
  const [locationState, setLocationState] = useState<"idle" | "locating" | "denied" | "unavailable">("idle");

  const states = useMemo(() => [...new Set(locations.map((l) => l.state))].sort(), [locations]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(() => locations.filter((location) =>
    (state === "ALL" || location.state === state) &&
    (status === "ALL" || (status === "COMING" ? location.status === "coming-soon" : location.status === "renovation")) &&
    (availability === "ALL" || (location.status !== "coming-soon" && (availability === "OPEN_NOW" ? isOpenAt(location, localMinutes(now, location.timeZone)) : !isOpenAt(location, localMinutes(now, location.timeZone))))) &&
    `${location.name} ${location.address}`.toLowerCase().includes(query.toLowerCase())
  ), [locations, state, status, availability, query, now]);

  const nearby = useMemo(() => {
    if (!userPosition) return [];
    return locations
      .filter((location) => !location.status)
      .map((location) => ({ ...location, distance: milesBetween(userPosition, location) }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 12);
  }, [locations, userPosition]);

  const visible = nearMode ? nearby : filtered;

  const focusLocation = useCallback((location: GeoLocation) => {
    setSelected(location);
    mapRef.current?.flyTo([location.latitude, location.longitude], 13, { duration: 1.15, easeLinearity: .22 });
  }, []);

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
        markerZoomAnimation: false,
      });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Esri, HERE, Garmin, OpenStreetMap contributors, and the GIS user community',
        maxZoom: 16,
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
    const layer = layerRef.current;
    if (!mapReady || !mapRef.current || !layer) return;
    import("leaflet").then((L) => {
      layer.clearLayers();
      visible.forEach((location) => {
        const classes = [
          "wonder-map-pin",
          location.status === "coming-soon" ? "planned" : "",
          location.status === "renovation" ? "renovation" : "",
          selected?.slug === location.slug ? "selected" : "",
        ].filter(Boolean).join(" ");
        const marker = L.marker([location.latitude, location.longitude], {
          icon: L.divIcon({ className: "wonder-pin-shell", html: `<span class="${classes}"></span>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
          riseOnHover: true,
          riseOffset: 500,
        }).addTo(layer);
        marker.bindTooltip(location.name, { direction: "top", offset: [0, -7] });
        marker.on("click", () => focusLocation(location));
      });
    });
  }, [mapReady, visible, selected?.slug, focusLocation]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || nearMode || !visible.length) return;
    const bounds: [number, number][] = visible.map((location) => [location.latitude, location.longitude]);
    mapRef.current.flyToBounds(bounds, { padding: [42, 42], maxZoom: state === "ALL" ? 7 : 10, duration: 1.05 });
  }, [mapReady, visible, nearMode, state]);

  useEffect(() => {
    const userLayer = userLayerRef.current;
    if (!mapReady || !userPosition || !userLayer) return;
    import("leaflet").then((L) => {
      userLayer.clearLayers();
      L.marker([userPosition.latitude, userPosition.longitude], {
        icon: L.divIcon({ className: "wonder-user-shell", html: '<span class="wonder-user-pin"><b>🍽</b></span>', iconSize: [42, 48], iconAnchor: [21, 46] }),
        zIndexOffset: 1000,
      }).bindTooltip("You’re hungry here", { permanent: false, direction: "top", offset: [0, -38] }).addTo(userLayer);
    });
  }, [mapReady, userPosition]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !nearMode || !userPosition || !nearby.length) return;
    const bounds: [number, number][] = [
      [userPosition.latitude, userPosition.longitude],
      ...nearby.slice(0, 6).map((location) => [location.latitude, location.longitude] as [number, number]),
    ];
    mapRef.current.flyToBounds(bounds, { padding: [58, 58], maxZoom: 11, duration: 1.25 });
  }, [mapReady, nearMode, userPosition, nearby]);

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
        setStatus("ALL");
        setAvailability("ALL");
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
    setAvailability("ALL");
    setSelected(null);
  };

  const showFullNetwork = () => {
    setNearMode(false);
    setState("ALL");
    setStatus("ALL");
    setAvailability("ALL");
    setQuery("");
    setSelected(null);
    const bounds: [number, number][] = locations.map((location) => [location.latitude, location.longitude]);
    mapRef.current?.flyToBounds(bounds, { padding: [42, 42], maxZoom: 7, duration: 1.15 });
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
          <span className="filter-group-label">STATUS</span>
          <div className="status-row" aria-label="Filter by location status">
            <button className={status === "ALL" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => { setStatus("ALL"); setAvailability("ALL"); })}>All locations</button>
            <button className={status === "COMING" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => { setStatus("COMING"); setAvailability("ALL"); })}>Coming soon</button>
            <button className={status === "RENOVATION" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => { setStatus("RENOVATION"); setAvailability("ALL"); })}>Renovation</button>
          </div>
          <span className={`filter-group-label hours-label ${status !== "ALL" ? "disabled" : ""}`}>HOURS</span>
          <div className={`availability-row ${status !== "ALL" ? "disabled" : ""}`} aria-label="Filter by current hours" aria-disabled={status !== "ALL"}>
            <button disabled={status !== "ALL"} className={availability === "ALL" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => setAvailability("ALL"))}>Any time</button>
            <button disabled={status !== "ALL"} className={availability === "OPEN_NOW" && !nearMode ? "active open-now" : ""} onClick={() => changeFilter(() => setAvailability("OPEN_NOW"))}>Open now</button>
            <button disabled={status !== "ALL"} className={availability === "CLOSED_NOW" && !nearMode ? "active" : ""} onClick={() => changeFilter(() => setAvailability("CLOSED_NOW"))}>Closed now</button>
          </div>
        </div>
        <div className="result-head"><strong>{visible.length}</strong> {nearMode ? `nearest open ${visible.length === 1 ? "location" : "locations"}` : visible.length === 1 ? "location" : "locations"} <span>•</span> {nearMode ? "sorted by distance" : state === "ALL" ? "Wonder network" : state}</div>
        <div className="location-list">
          {visible.map((location) => (
            <button key={location.slug} className={`location-card ${selected?.slug === location.slug ? "selected" : ""}`} onClick={() => focusLocation(location)}>
              <span className={`pin-dot ${location.status === "coming-soon" ? "planned" : ""}`} />
              <span><strong>{location.name}</strong><small>{location.address}</small>{location.distance !== undefined && <em className="distance">{location.distance.toFixed(1)} miles away</em>}{!location.status && <em className={isOpenAt(location, localMinutes(now, location.timeZone)) ? "live-open" : "live-closed"}>{isOpenAt(location, localMinutes(now, location.timeZone)) ? "Open now" : "Closed now"}</em>}{location.status === "renovation" && <em>Closed for renovations</em>}{location.status === "coming-soon" && <em>Coming {location.plannedFor}</em>}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="map-wrap">
        <div ref={mapNode} className="map" />
        <button className="map-home-button" onClick={showFullNetwork} aria-label="Show all locations" title="Show all locations">
          <span className="home-glyph" aria-hidden="true" />
        </button>
        <div className="map-key"><span className="open-dot" /> Open <span className="reno-dot hollow" /> Renovation <span className="reno-dot" /> Coming soon</div>
        {!mapReady && <div className="map-loading">Loading locations…</div>}
        {selected && <div className="detail-card">
          <button className="close" onClick={() => setSelected(null)} aria-label="Close location details">×</button>
          <span className="eyebrow">{selected.state} LOCATION</span>
          <h2>{selected.name}</h2>
          <p>{selected.address}</p>
          {selected.distance !== undefined && <p className="distance-copy">Approximately {selected.distance.toFixed(1)} miles from you</p>}
          {!selected.status && <div className={`hours-panel ${isOpenAt(selected, localMinutes(now, selected.timeZone)) ? "is-open" : "is-closed"}`}><span>{isOpenAt(selected, localMinutes(now, selected.timeZone)) ? "Open now" : "Closed now"}</span><strong>{selected.hoursLabel}</strong><small>Published schedule · local time · confirm on the official listing</small></div>}
          {selected.status === "renovation" && <div className="status-note">Temporarily closed for renovations</div>}
          {selected.status === "coming-soon" && <div className="status-note">Announced for {selected.plannedFor}</div>}
          <div className="detail-actions">
            <a href={`https://www.wonder.com/food-delivery-locations/${selected.slug}`} target="_blank" rel="noreferrer">View official listing</a>
            {selected.status !== "coming-soon" && <a className="outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer">Directions</a>}
            <a className="outline" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selected.latitude}%2C${selected.longitude}`} target="_blank" rel="noreferrer">Street View</a>
          </div>
        </div>}
      </div>
    </section>
  );
}
