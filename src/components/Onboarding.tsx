import { useState } from "react";
import { Navigation, Wallet, Leaf, Users, MapPin, Car, ShieldCheck, Loader2, User as UserIcon } from "lucide-react";
import { useStore } from "../store";
import { Logo } from "../ui";
import { NEIGHBORHOODS, VEHICLES, initialsOf, pickGradient } from "../data";
import type { Role } from "../types";
import { cn } from "../utils/cn";

export default function Onboarding() {
  const { createProfile } = useStore();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [destination, setDestination] = useState(NEIGHBORHOODS[2]);
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finish = (lat: number | undefined, lng: number | undefined, granted: boolean) => {
    const trimmed = name.trim() || "Guest";
    createProfile({
      name: trimmed,
      initials: initialsOf(trimmed),
      gradient: pickGradient(trimmed.length + (role === "driver" ? 3 : 0)),
      role: role ?? "rider",
      rating: 5,
      rides: 0,
      wallet: 50,
      vehicle: role === "driver" ? VEHICLES[vehicleIdx].name : undefined,
      eco: role === "driver" ? VEHICLES[vehicleIdx].eco : undefined,
      joined: new Date().toLocaleDateString([], { month: "short", year: "numeric" }),
      destination,
      lat,
      lng,
    });
    // tiny delay so the LIVE marker appears smoothly
    setTimeout(() => setLoading(false), 200);
    if (!granted) setError("Location was blocked — showing a placeholder until you enable it.");
  };

  const enableLocation = () => {
    if (!role) {
      setError("Pick whether you're a rider or a driver first.");
      return;
    }
    setError("");
    setLoading(true);
    if (!("geolocation" in navigator)) {
      finish(undefined, undefined, false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => finish(pos.coords.latitude, pos.coords.longitude, true),
      () => finish(undefined, undefined, false),
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-400/40 blur-3xl" />
        <div className="animate-blob absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/30 blur-3xl" style={{ animationDelay: "4s" }} />
        <div className="animate-blob absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" style={{ animationDelay: "8s" }} />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <div className="animate-slide-up rounded-3xl bg-white/95 p-7 shadow-2xl shadow-emerald-900/30 backdrop-blur-xl sm:p-8">
          <Logo />
          <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
            Share the ride.<br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Save money. Cut carbon.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Create your profile and share your live location to see real people heading your way. Fresh start — no fake data. 🌍
          </p>

          {/* name */}
          <div className="mt-6">
            <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400"><UserIcon size={12} /> Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Carter"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* role */}
          <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">I want to…</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setRole("rider")}
              className={cn("rounded-2xl border-2 p-4 text-left transition-all", role === "rider" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300")}
            >
              <div className={cn("mb-2 grid h-10 w-10 place-items-center rounded-xl", role === "rider" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")}><MapPin size={18} /></div>
              <p className="text-sm font-bold text-slate-900">Find a ride</p>
              <p className="text-[11px] text-slate-400">I'm a rider</p>
            </button>
            <button
              onClick={() => setRole("driver")}
              className={cn("rounded-2xl border-2 p-4 text-left transition-all", role === "driver" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300")}
            >
              <div className={cn("mb-2 grid h-10 w-10 place-items-center rounded-xl", role === "driver" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")}><Car size={18} /></div>
              <p className="text-sm font-bold text-slate-900">Offer a ride</p>
              <p className="text-[11px] text-slate-400">I'm driving</p>
            </button>
          </div>

          {/* destination */}
          <div className="mt-5">
            <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400"><Navigation size={12} /> Where do you usually go?</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 focus:bg-white"
            >
              {NEIGHBORHOODS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>

          {/* vehicle (driver only) */}
          {role === "driver" && (
            <div className="animate-slide-up mt-5">
              <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400"><Car size={12} /> Your vehicle</label>
              <div className="flex flex-wrap gap-1.5">
                {VEHICLES.map((v, i) => (
                  <button
                    key={v.name}
                    onClick={() => setVehicleIdx(i)}
                    className={cn("inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition", vehicleIdx === i ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300")}
                  >
                    {v.name} {v.eco && <span>🌿</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={enableLocation}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl disabled:opacity-70"
          >
            {loading ? <><Loader2 size={17} className="animate-spin" /> Getting your location…</> : <><Navigation size={17} /> Allow live location & start</>}
          </button>
          {error && <p className="mt-2 text-center text-[11px] text-amber-600">{error}</p>}
          <p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-slate-400"><ShieldCheck size={12} /> Location is stored only on your device & shared while the app is open.</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-white/90">
          <Prop icon={<Wallet size={15} />} label="Split fuel costs" />
          <Prop icon={<Leaf size={15} />} label="Cut CO₂" />
          <Prop icon={<Users size={15} />} label="Meet locals" />
        </div>
      </div>
    </div>
  );
}

function Prop({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-white/85">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">{icon}</span>
      {label}
    </div>
  );
}
