import { useState } from "react";
import { X, Car, MapPin, Users, Clock, Leaf, Check } from "lucide-react";
import { useStore } from "../store";
import { NEIGHBORHOODS, VEHICLES } from "../data";
import { offsetLatLng } from "../lib/geo";
import { cn } from "../utils/cn";

export default function PostRideModal({ onClose }: { onClose: () => void }) {
  const { postRide, setView, profile, me } = useStore();
  const [from, setFrom] = useState("Current location");
  const [to, setTo] = useState(profile?.destination ?? NEIGHBORHOODS[2]);
  const [price, setPrice] = useState(6);
  const [seats, setSeats] = useState(2);
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [departIn, setDepartIn] = useState(10);
  const [done, setDone] = useState(false);

  const submit = () => {
    const base = me.lat != null && me.lng != null ? { lat: me.lat, lng: me.lng } : { lat: 0, lng: 0 };
    const dest = offsetLatLng(base.lat, base.lng, Math.max(3, departIn * 0.7), 37);
    postRide({
      origin: from,
      originLat: base.lat,
      originLng: base.lng,
      destination: to,
      destLat: dest.lat,
      destLng: dest.lng,
      price,
      seats,
      vehicle: VEHICLES[vehicleIdx].name,
      eco: VEHICLES[vehicleIdx].eco,
      departIn,
    });
    setDone(true);
    setTimeout(() => { onClose(); setView("trips"); }, 1300);
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:place-items-center sm:p-4" onClick={onClose}>
      <div className="animate-scale-in flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Offer a ride 🚗</h3>
            <p className="text-xs text-slate-400">Fill empty seats, earn & cut carbon.</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={16} /></button>
        </div>

        {done ? (
          <div className="grid place-items-center px-6 py-14 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Check size={30} /></div>
            <p className="text-lg font-extrabold text-slate-900">Your ride is live! 🟢</p>
            <p className="mt-1 text-sm text-slate-500">It's pinned on your map. Riders can now request you.</p>
          </div>
        ) : (
          <div className="scroll-thin space-y-4 overflow-y-auto p-5">
            <div className="grid grid-cols-2 gap-2">
              <Field label="From">
                <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 focus:bg-white">
                  <option>Current location</option>
                  {NEIGHBORHOODS.map((n) => <option key={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="To">
                <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 focus:bg-white">
                  {NEIGHBORHOODS.map((n) => <option key={n}>{n}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Vehicle" icon={<Car size={13} />}>
              <div className="flex flex-wrap gap-1.5">
                {VEHICLES.map((v, i) => (
                  <button key={v.name} onClick={() => setVehicleIdx(i)} className={cn("rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition", vehicleIdx === i ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300")}>
                    {v.name} {v.eco && "🌿"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Seats available" icon={<Users size={13} />}>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <button key={s} onClick={() => setSeats(s)} className={cn("h-10 flex-1 rounded-xl border text-sm font-bold transition", seats === s ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300")}>{s}</button>
                ))}
              </div>
            </Field>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Price per seat</span><span className="text-emerald-600">${price.toFixed(0)}</span></div>
              <input type="range" min={2} max={20} step={1} value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full accent-emerald-500" />
              <p className="mt-1 text-[11px] text-slate-400">~${(price / seats).toFixed(1)}/person fuel split.</p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500"><span className="flex items-center gap-1"><Clock size={12} /> Departs in</span><span className="text-emerald-600">{departIn} min</span></div>
              <input type="range" min={5} max={60} step={5} value={departIn} onChange={(e) => setDepartIn(+e.target.value)} className="w-full accent-emerald-500" />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white">
              <div>
                <p className="text-[11px] text-white/60">Estimated earnings</p>
                <p className="text-xl font-extrabold">${(price * seats).toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300"><Leaf size={13} /> {VEHICLES[vehicleIdx].eco ? "Eco ride" : "Standard"}</div>
            </div>
          </div>
        )}

        {!done && (
          <div className="border-t border-slate-100 p-4">
            <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl">
              <MapPin size={16} /> Publish ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-500">{icon} {label}</p>
      {children}
    </div>
  );
}
