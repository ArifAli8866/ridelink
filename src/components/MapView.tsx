import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, Locate, Navigation, Footprints, Users } from "lucide-react";
import { useStore } from "../store";
import { GRAD_HEX } from "../data";
import type { NearbyUser } from "../types";

const meIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:22px;height:22px;">
    <span style="position:absolute;inset:0;border-radius:9999px;background:#10b981;opacity:.35;animation:mepl 2s ease-out infinite"></span>
    <span style="position:absolute;inset:3px;border-radius:9999px;background:#10b981;border:3px solid #fff;box-shadow:0 1px 8px rgba(0,0,0,.45)"></span>
  </div>
  <style>@keyframes mepl{0%{transform:scale(.6);opacity:.5}100%{transform:scale(2.6);opacity:0}}</style>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function userIcon(u: NearbyUser, selected: boolean) {
  const [a, b] = GRAD_HEX[u.gradient] ?? ["#34d399", "#0d9488"];
  const ring = selected ? "box-shadow:0 0 0 4px rgba(16,185,129,.35),0 4px 10px rgba(0,0,0,.3)" : "box-shadow:0 3px 8px rgba(0,0,0,.25)";
  const size = selected ? 44 : 38;
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;text-align:center;font-family:Inter,system-ui,sans-serif;">
      <div style="width:${size}px;height:${size}px;border-radius:9999px;background:linear-gradient(135deg,${a},${b});border:3px solid #fff;${ring};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:${selected ? 15 : 13}px;">${u.initials}</div>
      <span style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:9999px;background:#fff;border:2px solid ${u.role === "driver" ? "#10b981" : "#0ea5e9"}"></span>
      ${u.eco ? '<span style="position:absolute;bottom:-1px;left:-3px;font-size:10px">🌿</span>' : ""}
      <div style="margin-top:3px;background:#0f172a;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;display:inline-block">$${u.price}</div>
    </div>`,
    iconSize: [48, 56],
    iconAnchor: [24, 19],
  });
}

function rideIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;text-align:center;font-family:Inter,system-ui,sans-serif;">
      <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#10b981,#0d9488);border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px">🚗</div>
      <div style="margin-top:2px;background:#065f46;color:#d1fae5;font-size:8px;font-weight:700;padding:1px 5px;border-radius:6px;display:inline-block">YOUR RIDE</div>
    </div>`,
    iconSize: [44, 50],
    iconAnchor: [22, 17],
  });
}

/** Auto behaviors that need the live map instance. */
function AutoMove({
  me,
  selectedId,
  nearby,
  recenterKey,
}: {
  me: { lat: number | null; lng: number | null };
  selectedId: string | null;
  nearby: NearbyUser[];
  recenterKey: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (me.lat != null && me.lng != null)
      map.setView([me.lat, me.lng], Math.max(map.getZoom(), 15), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.lat, me.lng]);
  useEffect(() => {
    if (selectedId) {
      const u = nearby.find((n) => n.id === selectedId);
      if (u) map.flyTo([u.lat, u.lng], 16, { duration: 0.8 });
    }
  }, [selectedId, nearby, map]);
  useEffect(() => {
    if (recenterKey > 0 && me.lat != null && me.lng != null)
      map.flyTo([me.lat, me.lng], 16, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterKey]);
  return null;
}

export default function MapView() {
  const { me, nearby, selectedId, select, postedRides, previewOn, togglePreview } = useStore();
  const mapRef = useRef<LeafletMap | null>(null);
  const [recenterKey, setRecenterKey] = useState(0);

  const ready = me.lat != null && me.lng != null;
  const center: [number, number] = ready ? [me.lat!, me.lng!] : [20, 0];
  const rideIconCached = useMemo(() => rideIcon(), []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={ready ? 15 : 2}
        zoomControl={false}
        attributionControl
        style={{ height: "100%", width: "100%", background: "#e9eef3" }}
        worldCopyJump
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {ready && (
          <>
            <Circle
              center={[me.lat!, me.lng!]}
              radius={me.accuracy > 0 ? me.accuracy : 25}
              pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.12, weight: 1 }}
            />
            <Marker position={[me.lat!, me.lng!]} icon={meIcon} />
          </>
        )}

        {postedRides.map((r) => (
          <Marker key={r.id} position={[r.originLat, r.originLng]} icon={rideIconCached} />
        ))}

        {nearby.map((u) => (
          <Marker
            key={u.id}
            position={[u.lat, u.lng]}
            icon={userIcon(u, u.id === selectedId)}
            eventHandlers={{ click: () => select(u.id) }}
          />
        ))}

        {ready && selectedId &&
          (() => {
            const u = nearby.find((n) => n.id === selectedId);
            if (!u) return null;
            return (
              <Polyline
                positions={[[me.lat!, me.lng!], [u.lat, u.lng]]}
                pathOptions={{ color: "#10b981", weight: 4, opacity: 0.8, dashArray: "8 8" }}
              />
            );
          })()}

        <AutoMove me={me} selectedId={selectedId} nearby={nearby} recenterKey={recenterKey} />
      </MapContainer>

      {/* waiting for GPS */}
      {!ready && (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-slate-900/30 backdrop-blur-[2px]">
          <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-xl">
            <Navigation size={22} className="mx-auto mb-1 animate-spin text-emerald-500" />
            <p className="text-sm font-bold text-slate-800">Waiting for your location…</p>
            <p className="text-xs text-slate-400">Allow location access to see the live map.</p>
          </div>
        </div>
      )}

      {/* live HUD */}
      <div className="pointer-events-none absolute left-3 top-3 z-[600] flex flex-col gap-2">
        <div className="glass pointer-events-auto flex items-center gap-2 rounded-full border border-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          {ready ? `LIVE · ${me.accuracy.toFixed(0)}m accuracy` : "DEMO"}
        </div>
        <div className="glass pointer-events-auto hidden items-center gap-3 rounded-xl border border-white/60 px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm sm:flex">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Driver</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" /> Rider</span>
          <span className="flex items-center gap-1"><Footprints size={11} /> you</span>
        </div>
      </div>

      {/* empty-state prompt for solo users */}
      {ready && nearby.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-[600] w-[88%] max-w-sm -translate-x-1/2">
          <div className="glass pointer-events-auto rounded-2xl border border-white/70 p-3 text-center shadow-lg">
            <p className="text-sm font-bold text-slate-800">No other riders nearby yet</p>
            <p className="mb-2 text-xs text-slate-500">
              You're the first here! Turn on <b>preview mode</b> to see how matching works around you, or offer a ride.
            </p>
            <button
              onClick={togglePreview}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-600"
            >
              <Users size={13} /> {previewOn ? "Hide preview" : "Show sample riders"}
            </button>
          </div>
        </div>
      )}

      {/* zoom + recenter controls */}
      <div className="absolute bottom-3 right-3 z-[600] flex flex-col gap-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="glass grid h-9 w-9 place-items-center rounded-xl border border-white/60 text-slate-700 shadow-sm transition hover:text-emerald-600"
        >
          <Plus size={17} />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="glass grid h-9 w-9 place-items-center rounded-xl border border-white/60 text-slate-700 shadow-sm transition hover:text-emerald-600"
        >
          <Minus size={17} />
        </button>
        <button
          onClick={() => setRecenterKey((k) => k + 1)}
          className="glass grid h-9 w-9 place-items-center rounded-xl border border-white/60 text-emerald-600 shadow-sm transition hover:bg-emerald-50"
        >
          <Locate size={16} />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[600] hidden items-center gap-1.5 rounded-full bg-slate-900/70 px-2.5 py-1 text-[10px] font-medium text-white/90 sm:flex">
        <Navigation size={11} /> drag to pan · scroll to zoom
      </div>
    </div>
  );
}
