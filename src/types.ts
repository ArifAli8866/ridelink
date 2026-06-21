export type Role = "rider" | "driver";

export type View = "discover" | "trips" | "impact" | "messages" | "profile";

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Another person on the map (a real user in multiplayer mode, or a preview sample). */
export interface NearbyUser {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  role: Role;
  rating: number;
  rides: number;
  destination: string;
  origin: string;
  departIn: number; // minutes
  price: number;
  seats: number; // seats available (driver) or 0 (rider)
  vehicle: string;
  eco: boolean;
  distanceKm: number;
  lat: number;
  lng: number;
  verified: boolean;
  online: boolean;
}

/** A ride the current user (as a driver) has published. */
export interface PostedRide {
  id: string;
  origin: string;
  originLat: number;
  originLng: number;
  destination: string;
  destLat: number;
  destLng: number;
  price: number;
  seats: number;
  vehicle: string;
  eco: boolean;
  departIn: number;
  createdAt: number;
}

export interface Trip {
  id: string;
  driverName: string;
  initials: string;
  gradient: string;
  vehicle: string;
  eco: boolean;
  from: string;
  to: string;
  date: string;
  distanceKm: number;
  price: number;
  co2SavedKg: number;
  moneySaved: number;
  status: "completed" | "active" | "upcoming";
  rating?: number;
  passengers: number;
  progress?: number;
  departIn?: number;
}

export interface ChatMessage {
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  role: Role;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "ride" | "payment" | "eco" | "message";
  read: boolean;
}

export interface CurrentUser {
  name: string;
  initials: string;
  gradient: string;
  role: Role;
  rating: number;
  rides: number;
  wallet: number;
  vehicle?: string;
  eco?: boolean;
  joined: string;
  destination: string;
  lat?: number;
  lng?: number;
}

export interface Filters {
  query: string;
  maxDistance: number;
  maxPrice: number;
  minRating: number;
  ecoOnly: boolean;
}

export interface BadgeDef {
  name: string;
  icon: string;
  desc: string;
}
