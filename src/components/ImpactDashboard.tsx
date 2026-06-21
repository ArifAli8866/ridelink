import { useState, useMemo } from "react";
import { Leaf, Wallet, Route, Users, TreePine, Fuel, CarFront, Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { useStore } from "../store";
import { Stat, Donut, Bars } from "../ui";
import { ECO_TIPS, CO2_PER_TREE, CO2_PER_LITRE, monthLabel } from "../data";
import { cn } from "../utils/cn";

export default function ImpactDashboard() {
  const { impact, trips } = useStore();
  const [metric, setMetric] = useState<"co2" | "money">("co2");
  const hasData = impact.rides > 0 || impact.km > 0;

  const goal = 200;
  const trees = Math.round(impact.co2 / CO2_PER_TREE);
  const litres = Math.round(impact.co2 / CO2_PER_LITRE);

  // build last 6 months of data from REAL trips
  const monthly = useMemo(() => {
    const buckets: { label: string; co2: number; money: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: monthLabel(d), co2: 0, money: 0 });
    }
    // distribute this month's real trips into the last bucket
    buckets[buckets.length - 1].co2 = +trips.reduce((s, t) => s + t.co2SavedKg, 0).toFixed(1);
    buckets[buckets.length - 1].money = +trips.reduce((s, t) => s + t.moneySaved, 0).toFixed(2);
    return buckets;
  }, [trips]);

  const chartData = monthly.map((m) => ({ label: m.label, value: metric === "co2" ? m.co2 : m.money }));

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        <div className="animate-slide-up overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 text-white shadow-xl shadow-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-100">
            <Leaf size={18} /><span className="text-sm font-semibold uppercase tracking-wide">Your green impact</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-extrabold tracking-tight">{impact.co2}<span className="text-2xl"> kg</span></p>
              <p className="text-sm text-emerald-100">CO₂ kept out of the atmosphere</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
              <p className="text-2xl font-extrabold">${impact.money.toFixed(0)}</p>
              <p className="text-[11px] text-emerald-100">total saved</p>
            </div>
          </div>
          {hasData ? (
            <p className="mt-3 text-xs text-emerald-100/90">🌱 Equivalent to planting <b>{trees} trees</b>. Keep going!</p>
          ) : (
            <p className="mt-3 text-xs text-emerald-100/90">Share your first ride to start tracking CO₂ & money saved.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Leaf size={18} />} label="CO₂ saved" value={`${impact.co2} kg`} sub={hasData ? "great start!" : "no rides yet"} tint="emerald" />
          <Stat icon={<Wallet size={18} />} label="Money saved" value={`$${impact.money.toFixed(0)}`} sub="vs riding alone" tint="teal" />
          <Stat icon={<Route size={18} />} label="Km shared" value={`${impact.km}`} sub="not driven solo" tint="sky" />
          <Stat icon={<Users size={18} />} label="Rides shared" value={`${impact.rides}`} sub="cars off the road" tint="amber" />
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500" /><h3 className="font-bold text-slate-900">Monthly impact</h3></div>
              <div className="flex rounded-full bg-slate-100 p-1">
                {(["co2", "money"] as const).map((m) => (
                  <button key={m} onClick={() => setMetric(m)} className={cn("rounded-full px-3 py-1 text-xs font-bold transition", metric === m ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>{m === "co2" ? "CO₂ (kg)" : "Saved ($)"}</button>
                ))}
              </div>
            </div>
            {hasData ? (
              <Bars data={chartData} accent={metric === "co2" ? "#10b981" : "#0d9488"} format={(n) => (metric === "co2" ? `${n} kg` : `$${n}`)} />
            ) : (
              <div className="grid h-[150px] place-items-center text-center text-sm text-slate-400">
                <div>
                  <TrendingUp size={26} className="mx-auto mb-2 text-slate-300" />
                  No data yet — your chart fills as you take rides.
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm">
            <h3 className="mb-3 font-bold text-slate-900">Next milestone</h3>
            <Donut
              segments={[{ value: impact.co2, color: "#10b981" }, { value: Math.max(0, goal - impact.co2), color: "#e2e8f0" }]}
              center={<div><p className="text-2xl font-extrabold text-slate-900">{Math.round((impact.co2 / goal) * 100)}%</p><p className="text-[11px] text-slate-400">to {goal} kg</p></div>}
            />
            <p className="mt-3 text-xs text-slate-500"><b className="text-emerald-600">{Math.max(0, goal - impact.co2).toFixed(0)} kg</b> to unlock <b>Road Legend</b> 🏆</p>
          </div>
        </div>

        {hasData && (
          <div>
            <h3 className="mb-3 font-bold text-slate-900">What your impact equals</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Equiv icon={<TreePine size={20} />} value={`${trees}`} label="trees planted" tint="emerald" />
              <Equiv icon={<CarFront size={20} />} value={`${impact.rides}`} label="cars off road" tint="sky" />
              <Equiv icon={<Fuel size={20} />} value={`${litres} L`} label="fuel saved" tint="amber" />
              <Equiv icon={<Route size={20} />} value={`${impact.km}`} label="km not driven" tint="teal" />
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><Sparkles size={18} className="text-emerald-500" /><h3 className="font-bold text-slate-900">Invite friends to go live</h3></div>
            <p className="text-sm text-slate-500">Right now this is your personal tracker. Once you connect a database (Neon/Postgres) and share the app, you'll see a real-time leaderboard of everyone cutting carbon near you.</p>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
              <Users size={16} /> More riders = more matches, more savings, more CO₂ cut.
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
            <div className="mb-3 flex items-center gap-2"><Lightbulb size={18} className="text-amber-400" /><h3 className="font-bold">Eco tips</h3></div>
            <div className="space-y-2.5">
              {ECO_TIPS.map((t, i) => (
                <div key={i} className="flex gap-2.5 rounded-2xl bg-white/5 p-3 text-sm text-white/80"><Leaf size={15} className="mt-0.5 shrink-0 text-emerald-400" /><span>{t}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Equiv({ icon, value, label, tint }: { icon: React.ReactNode; value: string; label: string; tint: string }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
      <div className={cn("mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl", map[tint])}>{icon}</div>
      <p className="text-xl font-extrabold text-slate-900">{value}</p>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
    </div>
  );
}
