import { X, ShieldCheck, Leaf, Clock, MapPin, Car, Users, CheckCircle2, Loader2, Navigation, Wallet, Zap, Route, MessageSquare } from "lucide-react";
import { useStore } from "../store";
import { Avatar, Stars } from "../ui";
import { co2For, moneyFor, fmtKm } from "../data";

export default function RideDetailModal() {
  const { selected, requestState, startRequest, confirmBooking, resetRequest, select, setView, profile, openConversation } = useStore();
  if (!selected || !profile) return null;
  const u = selected;
  const youSave = moneyFor(u.distanceKm);
  const co2 = co2For(u.distanceKm);
  const youDrive = profile.role === "driver";

  const close = () => {
    resetRequest();
    select(null);
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:place-items-center sm:p-4" onClick={() => requestState !== "searching" && close()}>
      <div className="animate-scale-in flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
          <button onClick={close} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"><X size={16} /></button>
          <div className="flex items-center gap-3">
            <Avatar initials={u.initials} gradient={u.gradient} size={52} ring online={u.online} />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-lg font-bold">{u.name}</p>
                {u.verified && <ShieldCheck size={15} className="text-emerald-400" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 font-semibold text-emerald-300">{u.role === "driver" ? <Car size={11} /> : <Users size={11} />} {u.role}</span>
                <Stars value={u.rating} size={12} /><span className="font-semibold">{u.rating}</span><span>· {u.rides} trips</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-thin overflow-y-auto p-5">
          {requestState === "idle" && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400"><Route size={13} /> Route</div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <span className="my-1 h-8 w-0.5 border-l-2 border-dashed border-slate-300" />
                    <MapPin size={16} className="text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{u.origin}</p>
                    <p className="my-1 text-[11px] text-slate-400">pickup · {fmtKm(u.distanceKm)} from you</p>
                    <p className="text-sm font-semibold text-slate-800">{u.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">departs</p>
                    <p className="text-sm font-bold text-slate-900">{u.departIn}m</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {u.role === "driver" ? <Info icon={<Car size={15} />} label="Vehicle" value={u.vehicle} /> : <Info icon={<Users size={15} />} label="Looking for" value="A driver" />}
                <Info icon={<Clock size={15} />} label="ETA" value={`${u.departIn} min`} />
                {u.role === "driver" && <Info icon={<Users size={15} />} label="Seats left" value={`${u.seats}`} />}
                <Info icon={u.eco ? <Leaf size={15} /> : <Zap size={15} />} label="Fuel" value={u.eco ? "EV / Hybrid" : "Petrol"} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><Wallet size={12} /> You save</div>
                  <p className="text-xl font-extrabold text-emerald-700">${youSave.toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-600/70">vs riding alone</p>
                </div>
                <div className="rounded-2xl bg-teal-50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-teal-700"><Leaf size={12} /> CO₂ saved</div>
                  <p className="text-xl font-extrabold text-teal-700">{co2} kg</p>
                  <p className="text-[10px] text-teal-600/70">by sharing</p>
                </div>
              </div>
            </div>
          )}

          {requestState === "searching" && (
            <div className="animate-fade-in grid place-items-center py-8">
              <div className="relative grid h-40 w-40 place-items-center">
                {[0, 0.6, 1.2].map((d) => <span key={d} className="animate-radar absolute h-28 w-28 rounded-full border-2 border-emerald-400" style={{ animationDelay: `${d}s` }} />)}
                <div className="relative"><span className="absolute -inset-3 animate-ping rounded-full bg-emerald-400/30" /><Avatar initials={u.initials} gradient={u.gradient} size={64} ring /></div>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-800"><Loader2 size={15} className="animate-spin text-emerald-500" /> Finding your perfect match…</p>
              <p className="mt-1 text-xs text-slate-400">Scanning people heading to {u.destination}</p>
            </div>
          )}

          {requestState === "matched" && (
            <div className="animate-fade-in py-2 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={30} /></div>
              <p className="text-lg font-extrabold text-slate-900">Match found! 🎉</p>
              <p className="mt-1 text-sm text-slate-500">{u.name} is on the way and arrives in <span className="font-bold text-emerald-600">{u.departIn} min</span>.</p>
              <div className="mt-4 flex items-center justify-center gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="font-semibold text-slate-700">{fmtKm(u.distanceKm)}</span><span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-700">${u.price}</span><span className="text-slate-300">·</span>
                <span className="font-semibold text-emerald-600">{co2} kg CO₂</span>
              </div>
            </div>
          )}

          {requestState === "booked" && (
            <div className="animate-fade-in py-2 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={30} /></div>
              <p className="text-lg font-extrabold text-slate-900">Ride booked! 🚗💨</p>
              <p className="mt-1 text-sm text-slate-500">{youDrive ? "Passenger notified — head to pickup." : `${u.name} will pick you up in ${u.departIn} min.`}</p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><Leaf size={15} /> You just saved {co2} kg of CO₂!</div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4">
          {requestState === "idle" && (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button onClick={startRequest} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl">
                <Navigation size={16} />{u.role === "driver" ? `Request a seat · $${u.price}` : "Offer to share this ride"}
              </button>
              <button onClick={() => { openConversation(u); close(); }} className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"><MessageSquare size={18} /></button>
            </div>
          )}
          {requestState === "matched" && (
            <button onClick={confirmBooking} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl">
              <Wallet size={16} /> Confirm & Book · ${u.price}
            </button>
          )}
          {requestState === "booked" && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={close} className="rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Done</button>
              <button onClick={() => { setView("trips"); close(); }} className="rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800">View live trip</button>
            </div>
          )}
          {requestState === "searching" && (
            <button disabled className="w-full cursor-wait rounded-2xl bg-slate-200 py-3.5 text-sm font-bold text-slate-400">Matching in progress…</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">{icon} {label}</div>
      <p className="truncate text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
