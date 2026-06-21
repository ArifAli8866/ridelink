import type { BadgeDef } from "./types";

/* ---- Impact math (real formulas) ---- */
/** kg CO2 emitted by an average car per km (EPA ~171 g/km). */
export const CO2_PER_KM = 0.171;
/** Approx. $ saved per km shared vs. riding alone (fuel + wear + parking). */
export const MONEY_PER_KM = 1.1;

export const fmtMoney = (n: number) => `$${n.toFixed(2)}`;
export const fmtKg = (n: number) => `${n.toFixed(1)} kg`;
export const fmtKm = (n: number) => `${n.toFixed(1)} km`;

export const co2For = (km: number, riders = 1) => +(CO2_PER_KM * km * riders).toFixed(1);
export const moneyFor = (km: number) => +(MONEY_PER_KM * km).toFixed(2);

/** A tree absorbs ~21 kg CO2 per year. */
export const CO2_PER_TREE = 21;
/** ~2.3 kg CO2 per litre of petrol. */
export const CO2_PER_LITRE = 2.3;

/* ---- Constants (not user data) ---- */
export const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-lime-400 to-green-600",
  "from-cyan-400 to-sky-600",
  "from-fuchsia-400 to-pink-600",
  "from-indigo-400 to-blue-600",
  "from-teal-400 to-emerald-600",
];

/** gradient -> hex stops, used for real Leaflet map markers (inline styled). */
export const GRAD_HEX: Record<string, [string, string]> = {
  "from-emerald-400 to-teal-600": ["#34d399", "#0d9488"],
  "from-sky-400 to-blue-600": ["#38bdf8", "#2563eb"],
  "from-violet-400 to-purple-600": ["#a78bfa", "#9333ea"],
  "from-amber-400 to-orange-600": ["#fbbf24", "#ea580c"],
  "from-rose-400 to-pink-600": ["#fb7185", "#db2777"],
  "from-lime-400 to-green-600": ["#a3e635", "#16a34a"],
  "from-cyan-400 to-sky-600": ["#22d3ee", "#0284c7"],
  "from-fuchsia-400 to-pink-600": ["#e879f9", "#db2777"],
  "from-indigo-400 to-blue-600": ["#818cf8", "#2563eb"],
  "from-teal-400 to-emerald-600": ["#2dd4bf", "#059669"],
  "from-sky-400 to-indigo-600": ["#38bdf8", "#4f46e5"],
};

export const pickGradient = (seed: number) =>
  AVATAR_GRADIENTS[Math.abs(Math.floor(seed)) % AVATAR_GRADIENTS.length];

export const NEIGHBORHOODS = [
  "Downtown",
  "Riverside",
  "Tech Park",
  "Old Town",
  "Greenfield",
  "Lakeside",
  "Hillcrest",
  "Harbor Point",
  "Sunset Blvd",
  "Midtown",
  "Northgate",
  "University",
  "Airport",
  "Stadium",
  "Market Square",
];

export const FIRST_NAMES = [
  "Aarav", "Priya", "Daniel", "Sofia", "Marcus", "Emma", "Liam", "Olivia",
  "Noah", "Ethan", "Mia", "Lucas", "Ava", "Leo", "Zoe", "Arjun", "Hana", "Diego",
];

export const LAST_NAMES = [
  "Sharma", "Nair", "Kim", "Rossi", "Lee", "Wilson", "Carter", "Brown",
  "Patel", "Clark", "Garcia", "Müller", "Silva", "Khan", "Nguyen", "Rossi",
];

export const VEHICLES = [
  { name: "Tesla Model 3", eco: true },
  { name: "Hyundai Ioniq 5", eco: true },
  { name: "Kia EV6", eco: true },
  { name: "MG ZS EV", eco: true },
  { name: "BYD Atto 3", eco: true },
  { name: "Toyota Prius", eco: true },
  { name: "Honda City", eco: false },
  { name: "Hyundai Creta", eco: false },
  { name: "Maruti Swift", eco: false },
  { name: "VW Golf", eco: false },
];

export const ECO_TIPS = [
  "Sharing one ride removes a full car's worth of CO₂ from the road.",
  "An EV carpool can cut your trip emissions by up to 80%.",
  "4 people in one car = 75% less fuel than 4 solo trips.",
  "Every 10 km shared saves about 1.7 kg of CO₂.",
];

export const BADGES: BadgeDef[] = [
  { name: "Eco Warrior", icon: "Leaf", desc: "100+ kg CO₂ saved" },
  { name: "Carbon Cutter", icon: "Scissors", desc: "30+ shared rides" },
  { name: "Gold Saver", icon: "Coins", desc: "$500+ saved" },
  { name: "Trusted Rider", icon: "ShieldCheck", desc: "Complete your profile" },
  { name: "Road Legend", icon: "Trophy", desc: "Reach 100 rides" },
  { name: "EV Pioneer", icon: "Zap", desc: "10 EV rides" },
];

export const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** title-case initials from a name. */
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("") || "U";

export const monthLabel = (d: Date) =>
  d.toLocaleDateString([], { month: "short" });
