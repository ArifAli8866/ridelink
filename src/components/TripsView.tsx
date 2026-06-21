import { Star, Clock, MapPin, Car, Leaf, Navigation, CheckCircle2, Users, Wallet, X } from "lucide-react";
import { useStore } from "../store";
import { Avatar, Stars, Progress } from "../ui";
import { fmtKm } from "../data";

export default function TripsView() {
  const { activeTrip, completeActiveTrip, trips, rateTrip, postedRides, cancelPostedRide } = useStore();
  const upcoming = trips.filter((t) => t.status === "upcoming");
  const completed = trips.filter((t) => t.status === "completed" || t.status === "active");
  const hasActivity = activeTrip || trips.length > 0;

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
        {!hasActivity && (
          <div className="grid place-items-center rounded-3xl border border-dashed border-slate-200 bg-white/50 py-14 text-center">
            <div className="mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-500"><Navigation size={24} /></div>
            <p className="text-sm font-bold text-slate-700">No trips yet</p>
            <p className="text-xs text-slate-400">Find a ride on the Discover map, or offer one as a driver.</p>
          </div>
        )}

        {activeTrip && (
          <div className="animate-slide-up overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-white">
              <span className="flex items-center gap-2 text-sm font-bold">
                <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" /></span>
                Live trip in progress
              </span>
              <span className="text-xs font-semibold text-emerald-50">{activeTrip.driverName}</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar initials={activeTrip.initials} gradient={activeTrip.gradient} size={48} ring />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{activeTrip.vehicle}</p>
                  <p className="text-xs text-slate-400">{activeTrip.passengers} sharing · {activeTrip.eco ? "Eco ride" : "Standard"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">ETA</p>
                  <p className="text-lg font-extrabold text-emerald-600">{Math.ceil(activeTrip.departIn ?? 0)}m</p>
                </div>
              </div>
              <div className="my-4 flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <span className="my-1 h-7 w-0.5 border-l-2 border-dashed border-slate-300" />
                  <MapPin size={15} className="text-rose-500" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-slate-800">{activeTrip.from}</p>
                  <p className="mt-3 font-semibold text-slate-800">{activeTrip.to}</p>
                </div>
              </div>
              <Progress value={activeTrip.progress ?? 0} className="h-2.5" />
              <p className="mt-1.5 text-center text-xs font-medium text-slate-400">{Math.round((activeTrip.progress ?? 0) * 100)}% complete</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Mini icon={<Wallet size={13} />} value={`$${activeTrip.moneySaved.toFixed(1)}`} label="saved" />
                <Mini icon={<Leaf size={13} />} value={`${activeTrip.co2SavedKg} kg`} label="CO₂" />
                <Mini icon={<Navigation size={13} />} value={fmtKm(activeTrip.distanceKm)} label="shared" />
              </div>
              <button onClick={completeActiveTrip} className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800">Complete trip</button>
            </div>
          </div>
        )}

        {postedRides.length > 0 && (
          <div>
            <h3 className="mb-2 px-1 text-sm font-bold text-slate-700">Rides you offered</h3>
            <div className="space-y-2">
              {postedRides.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-lg">🚗</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{r.origin} → {r.destination}</p>
                    <p className="text-xs text-slate-400">{r.vehicle} · {r.seats} seats · ${r.price} · departs in {r.departIn}m {r.eco && "🌿"}</p>
                  </div>
                  <button onClick={() => cancelPostedRide(r.id)} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500"><X size={15} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <h3 className="mb-2 px-1 text-sm font-bold text-slate-700">Upcoming</h3>
            <div className="space-y-2">
              {upcoming.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                  <Avatar initials={t.initials} gradient={t.gradient} size={42} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{t.from} → {t.to}</p>
                    <p className="text-xs text-slate-400">{t.vehicle} · {t.date}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{t.departIn ? `${t.departIn}m` : "Open"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h3 className="mb-2 px-1 text-sm font-bold text-slate-700">History</h3>
            <div className="space-y-2">
              {completed.map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Avatar initials={t.initials} gradient={t.gradient} size={42} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{t.from} → {t.to}</p>
                        <span className="text-sm font-extrabold text-emerald-600">${t.price}</span>
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1"><Car size={11} /> {t.vehicle}</span>
                        <span className="inline-flex items-center gap-1"><Clock size={11} /> {t.date}</span>
                        <span className="inline-flex items-center gap-1"><Users size={11} /> {t.passengers}</span>
                        {t.eco && <span className="inline-flex items-center gap-1 text-emerald-600"><Leaf size={11} /> eco</span>}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                    <div className="flex gap-3 text-xs">
                      <span className="font-semibold text-emerald-600">−{t.co2SavedKg} kg CO₂</span>
                      <span className="font-semibold text-teal-600">+${t.moneySaved.toFixed(1)} saved</span>
                    </div>
                    {t.rating === undefined ? (
                      <div className="flex items-center gap-1">
                        <span className="mr-1 text-[11px] text-slate-400">Rate:</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => rateTrip(t.id, s)}>
                            <Star size={16} className="text-slate-300 transition hover:fill-amber-400 hover:text-amber-400" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-600"><CheckCircle2 size={13} className="text-emerald-500" /> <Stars value={t.rating} size={12} /></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Mini({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2">
      <p className="flex items-center justify-center gap-1 text-sm font-extrabold text-slate-800">{icon} {value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}
