import {
  ShieldCheck, Star, Car, Leaf, Scissors, Coins, Trophy, Zap, Check,
  Route, Wallet, Users, MapPin, LogOut,
} from "lucide-react";
import { useStore } from "../store";
import { Avatar, Stars } from "../ui";
import { BADGES } from "../data";
import { cn } from "../utils/cn";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Leaf, Scissors, Coins, ShieldCheck, Trophy, Zap,
};

export default function ProfileView() {
  const { profile, impact, updateProfile, resetAll, trips } = useStore();
  if (!profile) return null;

  // achievements earned from REAL stats
  const earned: Record<string, boolean> = {
    "Eco Warrior": impact.co2 >= 100,
    "Carbon Cutter": impact.rides >= 30,
    "Gold Saver": impact.money >= 500,
    "Trusted Rider": true,
    "Road Legend": impact.rides >= 100,
    "EV Pioneer": trips.filter((t) => t.eco).length >= 10,
  };
  const rated = trips.filter((t) => t.rating != null);

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
        <div className="animate-slide-up overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600" />
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end justify-between">
              <Avatar initials={profile.initials} gradient={profile.gradient} size={80} ring />
              <button onClick={resetAll} className="mb-1 inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50">
                <LogOut size={13} /> Reset & start over
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{profile.name}</h2>
              <ShieldCheck size={17} className="text-emerald-500" />
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <Star size={11} className="fill-amber-400 text-amber-400" /> {profile.rating}
              </span>
            </div>
            <p className="text-sm text-slate-400">Member since {profile.joined} · {profile.rides} rides completed</p>

            <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
              {(["rider", "driver"] as const).map((r) => (
                <button key={r} onClick={() => updateProfile({ role: r, vehicle: r === "driver" ? profile.vehicle ?? "Toyota Prius" : profile.vehicle, eco: r === "driver" ? profile.eco ?? true : profile.eco })} className={cn("flex-1 rounded-lg py-2 text-xs font-bold transition", profile.role === r ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                  {r === "rider" ? "🧍 I'm a rider" : "🚗 I'm driving"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Wallet size={17} />} value={`$${profile.wallet.toFixed(2)}`} label="Wallet" tint="emerald" />
          <StatCard icon={<Leaf size={17} />} value={`${impact.co2} kg`} label="CO₂ saved" tint="teal" />
          <StatCard icon={<Route size={17} />} value={`${impact.km}`} label="Km shared" tint="sky" />
          <StatCard icon={<Coins size={17} />} value={`$${impact.money.toFixed(0)}`} label="Money saved" tint="amber" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><Car size={13} /> Vehicle</p>
            {profile.role === "driver" ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{profile.vehicle}</p>
                  <p className="text-xs text-slate-400">{profile.eco ? "Eco (EV / hybrid)" : "Petrol"}</p>
                </div>
                {profile.eco && <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"><Leaf size={12} /> Eco</span>}
              </div>
            ) : (
              <p className="text-sm text-slate-500">You ride as a passenger. Switch to driver to list your car.</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><MapPin size={13} /> Usual destination</p>
            <p className="text-sm font-bold text-slate-900">{profile.destination}</p>
            <p className="text-xs text-slate-400">We surface rides heading here first.</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 px-1 text-sm font-bold text-slate-700">Achievements</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {BADGES.map((b) => {
              const Icon = ICONS[b.icon] ?? Trophy;
              const got = earned[b.name];
              return (
                <div key={b.name} className={cn("rounded-2xl border p-3.5 transition", got ? "border-amber-200 bg-amber-50/50" : "border-slate-100 bg-slate-50 opacity-60")}>
                  <div className={cn("mb-2 grid h-10 w-10 place-items-center rounded-xl", got ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-slate-200 text-slate-400")}><Icon size={18} /></div>
                  <div className="flex items-center gap-1"><p className="text-xs font-bold text-slate-800">{b.name}</p>{got && <Check size={12} className="text-emerald-500" />}</div>
                  <p className="text-[11px] text-slate-400">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-2 px-1 text-sm font-bold text-slate-700">Reviews ({rated.length})</h3>
          {rated.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/50 py-10 text-center">
              <div className="mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Star size={20} /></div>
              <p className="text-sm font-medium text-slate-600">No reviews yet</p>
              <p className="text-xs text-slate-400">Complete rides and you'll be rated here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rated.map((t) => (
                <div key={t.id} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <Avatar initials={t.initials} gradient={t.gradient} size={38} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{t.driverName}</p>
                      <Stars value={t.rating ?? 0} size={12} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{t.from} → {t.to}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 pb-4 pt-2 text-xs text-slate-400">
          <Users size={13} /> Your data is saved on this device · <ShieldCheck size={13} /> Connect a database to go multi-user live
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, tint }: { icon: React.ReactNode; value: string; label: string; tint: string }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={cn("mb-2 grid h-9 w-9 place-items-center rounded-xl", map[tint])}>{icon}</div>
      <p className="text-lg font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
