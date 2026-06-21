import type { NearbyUser } from "../types";
import { pickGradient, initialsOf } from "../data";
import { haversineKm } from "./geo";

export interface DbUser {
  id: string;
  name: string;
  role: "rider" | "driver";
  destination?: string | null;
  vehicle?: string | null;
  eco?: boolean | null;
  lat: number;
  lng: number;
}

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
};
const rangeFromHash = (h: number, min: number, max: number) => {
  const r = (Math.abs(Math.sin(h)) * 9999) % 1;
  return Math.floor(min + r * (max - min));
};

/** Convert a DB user row into the shape the map/list expects. */
export function mapDbUser(row: DbUser, meLat: number, meLng: number): NearbyUser {
  const h = hashStr(row.id);
  const distanceKm = +haversineKm(meLat, meLng, row.lat, row.lng).toFixed(2);
  const isDriver = row.role === "driver";
  return {
    id: row.id,
    name: row.name,
    initials: initialsOf(row.name),
    gradient: pickGradient(h),
    role: row.role,
    rating: 5,
    rides: 0,
    destination: row.destination || "Nearby",
    origin: "Live spot",
    departIn: rangeFromHash(h, 5, 30),
    price: Math.max(2, +(distanceKm * 0.7 + 1).toFixed(0)),
    seats: isDriver ? rangeFromHash(h, 1, 4) : 0,
    vehicle: row.vehicle || "—",
    eco: !!row.eco,
    distanceKm,
    lat: row.lat,
    lng: row.lng,
    verified: false,
    online: true,
  };
}

/** POST the caller's live location/profile. Returns false if no backend yet. */
export async function heartbeat(p: {
  id: string;
  name: string;
  role: "rider" | "driver";
  destination: string;
  vehicle?: string;
  eco?: boolean;
  lat: number;
  lng: number;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** GET nearby online users. Returns null if no backend yet. */
export async function fetchNearby(p: {
  lat: number;
  lng: number;
  exclude: string;
}): Promise<DbUser[] | null> {
  try {
    const res = await fetch(`/api/nearby?lat=${p.lat}&lng=${p.lng}&exclude=${encodeURIComponent(p.exclude)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as DbUser[]) : null;
  } catch {
    return null;
  }
}
