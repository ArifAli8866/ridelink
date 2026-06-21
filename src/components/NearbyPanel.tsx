import { useState } from "react";
import { Search, SlidersHorizontal, Car, Users, Leaf, Clock, MapPin, X, Sparkles } from "lucide-react";
import { useStore } from "../store";
import { Avatar, Stars, Chip } from "../ui";
import { fmtKm } from "../data";
import { cn } from "../utils/cn";

export default function NearbyPanel() {
  const { filtered, filters, setFilter, select, selectedId, nearby, profile, previewOn, togglePreview, liveMode } = useStore();
  const [showFilters, setShowFilters] = useState(false);

  const drivers = nearby.filter((u) => u.role === "driver").length;
  const riders = nearby.filter((u) => u.role === "rider").length;
  const matching = profile ? nearby.filter((u) => u.destination === profile.destination).length : 0;

  const statusText = liveMode
    ? nearby.length === 0
      ? "🟢 Live · no other riders nearby yet"
      : `🟢 Live · ${drivers} drivers · ${riders} riders nearby`
    : nearby.length === 0
    ? "Preview off · turn on to see sample riders"
    : `${drivers} drivers · ${riders} riders · ${matching} to ${profile?.destination ?? "destination"}`;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">People near you</h2>
            <p className="text-xs text-slate-400">{statusText}</p>
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn("grid h-9 w-9 place-items-center rounded-xl border transition", showFilters ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-500 hover:bg-slate-50")}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className="relative mb-2.5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.query}
            onChange={(e) => setFilter({ query: e.target.value })}
            placeholder="Search destination, name…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
          {filters.query && (
            <button onClick={() => setFilter({ query: "" })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={15} /></button>
          )}
        </div>

        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {liveMode ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" /></span>
              Live · connected to database
            </span>
          ) : (
            <Chip active={previewOn} onClick={togglePreview} className="shrink-0">
              <Sparkles size={12} /> {previewOn ? "Preview on" : "Preview mode"}
            </Chip>
          )}
          {["Tech Park", "Midtown", "University", "Airport"].map((d) => (
            <Chip key={d} active={filters.query === d} onClick={() => setFilter({ query: filters.query === d ? "" : d })}>
              <MapPin size={12} /> {d}
            </Chip>
          ))}
        </div>

        {showFilters && (
          <div className="animate-slide-up mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-500"><span>Max distance</span><span className="text-emerald-600">{filters.maxDistance.toFixed(1)} km</span></div>
              <input type="range" min={0.5} max={5} step={0.1} value={filters.maxDistance} onChange={(e) => setFilter({ maxDistance: +e.target.value })} className="w-full accent-emerald-500" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-500"><span>Max price</span><span className="text-emerald-600">${filters.maxPrice.toFixed(0)}</span></div>
              <input type="range" min={3} max={20} step={1} value={filters.maxPrice} onChange={(e) => setFilter({ maxPrice: +e.target.value })} className="w-full accent-emerald-500" />
            </div>
            <div className="flex gap-1.5">
              <Chip active={filters.minRating >= 4.5} onClick={() => setFilter({ minRating: filters.minRating >= 4.5 ? 0 : 4.5 })}><Stars value={5} size={11} /> 4.5+</Chip>
              <Chip active={filters.ecoOnly} onClick={() => setFilter({ ecoOnly: !filters.ecoOnly })}><Leaf size={12} /> Eco only</Chip>
            </div>
          </div>
        )}
      </div>

      <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-3">
        {nearby.length === 0 && (
          <div className="grid place-items-center px-4 py-14 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-500"><Users size={26} /></div>
            {liveMode ? (
              <>
                <p className="text-sm font-bold text-slate-700">No other riders nearby yet</p>
                <p className="mt-1 text-xs text-slate-400">You're live and connected. Invite friends to open the app nearby — they'll appear on your map instantly.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-700">You're the first one here!</p>
                <p className="mb-4 mt-1 text-xs text-slate-400">No other riders yet. Turn on preview mode to see how ride-matching works around your live location.</p>
                <button onClick={togglePreview} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/30 hover:shadow-lg">
                  <Sparkles size={13} /> {previewOn ? "Turn off preview" : "Turn on preview mode"}
                </button>
              </>
            )}
          </div>
        )}

        {nearby.length > 0 && filtered.length === 0 && (
          <div className="grid place-items-center py-12 text-center">
            <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Search size={20} /></div>
            <p className="text-sm font-medium text-slate-600">No matches for your filters</p>
            <p className="text-xs text-slate-400">Try widening distance or price.</p>
          </div>
        )}

        <div className="stagger space-y-2">
          {filtered.map((u) => {
            const isSel = u.id === selectedId;
            return (
              <button key={u.id} onClick={() => select(u.id)} className={cn("w-full rounded-2xl border p-3 text-left transition-all", isSel ? "border-emerald-400 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-200" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm")}>
                <div className="flex items-start gap-3">
                  <Avatar initials={u.initials} gradient={u.gradient} size={44} online={u.online} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">{u.name}</p>
                      <span className="shrink-0 text-sm font-extrabold text-emerald-600">${u.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold", u.role === "driver" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700")}>{u.role === "driver" ? <Car size={11} /> : <Users size={11} />} {u.role}</span>
                      <Stars value={u.rating} size={11} /><span className="font-semibold text-slate-600">{u.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium text-slate-500">{u.origin}</span>
                  <span className="flex-1 border-t border-dashed border-slate-300" />
                  <Clock size={11} className="text-slate-400" /><span className="whitespace-nowrap">{u.departIn}m</span>
                  <span className="flex-1 border-t border-dashed border-slate-300" />
                  <span className="font-semibold text-slate-700">{u.destination}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {u.role === "driver" && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{u.vehicle}</span>}
                    {u.eco && <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700"><Leaf size={10} /> Eco</span>}
                    {u.role === "driver" && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{u.seats} seats</span>}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{fmtKm(u.distanceKm)} away</span>
                </div>
              </button>
            );
          })}
        </div>
        {previewOn && filtered.length > 0 && (
          <p className="px-1 py-2 text-center text-[11px] text-slate-400">
            <Sparkles size={11} className="mr-1 inline" /> Preview riders are sample people around you. Connect a database for real users.
          </p>
        )}
      </div>
    </div>
  );
}
