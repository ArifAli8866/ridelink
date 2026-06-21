import type { GeoPoint, NearbyUser } from "../types";
import {
  FIRST_NAMES,
  LAST_NAMES,
  VEHICLES,
  NEIGHBORHOODS,
  pickGradient,
  co2For,
} from "../data";

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in km. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Destination point given a start, distance (km) and bearing (deg). */
export function offsetLatLng(
  lat: number,
  lng: number,
  distKm: number,
  bearingDeg: number
): GeoPoint {
  const R = 6371;
  const br = toRad(bearingDeg);
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distKm / R) +
      Math.cos(lat1) * Math.sin(distKm / R) * Math.cos(br)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(distKm / R) * Math.cos(lat1),
      Math.cos(distKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: toDeg(lat2), lng: toDeg(lng2) };
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate preview sample riders positioned around a real coordinate.
 * These are clearly labeled "preview" — they exist only to demonstrate the
 * matching flow on a solo device. In real multi-user mode they are replaced
 * by genuine nearby users from the database.
 */
export function generateSampleRiders(center: GeoPoint, count = 8): NearbyUser[] {
  const out: NearbyUser[] = [];
  const usedNames = new Set<string>();
  for (let i = 0; i < count; i++) {
    let name = "";
    for (let tries = 0; tries < 5; tries++) {
      name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      if (!usedNames.has(name)) break;
    }
    usedNames.add(name);

    const isDriver = Math.random() > 0.4;
    const distance = +rand(0.4, 3.2).toFixed(1);
    const bearing = rand(0, 360);
    const pos = offsetLatLng(center.lat, center.lng, distance, bearing);
    const vehicle = isDriver ? pick(VEHICLES) : { name: "—", eco: false };
    const dest = pick(NEIGHBORHOODS);
    const origin = pick(NEIGHBORHOODS);

    out.push({
      id: `sample-${Date.now()}-${i}`,
      name,
      initials: name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join(""),
      gradient: pickGradient(i * 7 + name.length),
      role: isDriver ? "driver" : "rider",
      rating: +rand(4.4, 5).toFixed(1),
      rides: Math.floor(rand(5, 220)),
      destination: dest,
      origin,
      departIn: Math.floor(rand(5, 30)),
      price: +(distance * rand(2.2, 3.4)).toFixed(2),
      seats: isDriver ? Math.floor(rand(1, 4)) : 0,
      vehicle: vehicle.name,
      eco: vehicle.eco,
      distanceKm: distance,
      lat: +pos.lat.toFixed(6),
      lng: +pos.lng.toFixed(6),
      verified: Math.random() > 0.3,
      online: Math.random() > 0.25,
    });
  }
  return out;
}

export { co2For };
