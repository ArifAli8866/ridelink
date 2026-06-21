/** Tiny localStorage-backed persistence. All "real" app data lives here. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

export const KEYS = {
  profile: "ridelink:profile:v1",
  trips: "ridelink:trips:v1",
  postedRides: "ridelink:postedRides:v1",
  conversations: "ridelink:conversations:v1",
  notifications: "ridelink:notifications:v1",
  preview: "ridelink:preview:v1",
  device: "ridelink:deviceId:v1",
} as const;

/** A stable per-device id so the same user keeps the same row in the database. */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(KEYS.device);
    if (!id) {
      id = `u_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      localStorage.setItem(KEYS.device, id);
    }
    return id;
  } catch {
    return `u_${Math.random().toString(36).slice(2, 10)}`;
  }
}
