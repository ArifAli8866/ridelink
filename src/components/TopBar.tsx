import { useState } from "react";
import {
  Compass, Route, Leaf, MessageSquare, User, Bell, Wallet, Plus, X,
  CheckCircle2, Coins,
} from "lucide-react";
import { useStore } from "../store";
import { Logo, Avatar } from "../ui";
import type { View } from "../types";
import { cn } from "../utils/cn";

const NAV: { view: View; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { view: "discover", label: "Discover", icon: Compass },
  { view: "trips", label: "Trips", icon: Route },
  { view: "impact", label: "Impact", icon: Leaf },
  { view: "messages", label: "Messages", icon: MessageSquare },
  { view: "profile", label: "Profile", icon: User },
];

const NOTI_ICON = { ride: CheckCircle2, payment: Coins, eco: Leaf, message: MessageSquare };

export function TopBar({ onPostRide }: { onPostRide: () => void }) {
  const { view, setView, profile, me, notifications, markNotificationsRead, conversations, activeTrip } = useStore();
  const [bellOpen, setBellOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const msgUnread = conversations.reduce((s, c) => s + c.unread, 0);

  const openBell = () => {
    setBellOpen((o) => {
      const next = !o;
      if (next) setTimeout(markNotificationsRead, 600);
      return next;
    });
  };

  if (!profile) return null;

  return (
    <header className="z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur sm:px-4">
      <Logo />

      <nav className="mx-auto hidden items-center gap-1 md:flex">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = view === n.view;
          return (
            <button key={n.view} onClick={() => setView(n.view)} className={cn("relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition", active ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700")}>
              <Icon size={16} />{n.label}
              {n.view === "messages" && msgUnread > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">{msgUnread}</span>}
              {n.view === "trips" && activeTrip && <span className="absolute right-2 top-1.5 h-2 w-2 animate-blink rounded-full bg-emerald-500" />}
            </button>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 lg:flex">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
          {me.granted ? "Live" : "Demo"}
        </span>

        <button onClick={() => setView("profile")} className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 hover:border-emerald-300 sm:flex">
          <Wallet size={15} className="text-emerald-500" /> ${profile.wallet.toFixed(2)}
        </button>

        <button onClick={() => (profile.role === "driver" ? onPostRide() : setView("discover"))} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition hover:shadow-lg sm:text-sm">
          <Plus size={15} /> <span className="hidden sm:inline">{profile.role === "driver" ? "Offer ride" : "Find ride"}</span>
        </button>

        <div className="relative">
          <button onClick={openBell} className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <Bell size={17} />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
          </button>
          {bellOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setBellOpen(false)} />
              <div className="animate-scale-in absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 p-3">
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
                </div>
                <div className="scroll-thin max-h-80 overflow-y-auto">
                  {notifications.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No notifications yet. Your activity shows up here.</p>}
                  {notifications.map((n) => {
                    const Icon = NOTI_ICON[n.type];
                    const tint = n.type === "eco" ? "bg-emerald-100 text-emerald-600" : n.type === "ride" ? "bg-sky-100 text-sky-600" : n.type === "payment" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600";
                    return (
                      <div key={n.id} className={cn("flex gap-3 border-b border-slate-50 p-3", !n.read && "bg-emerald-50/40")}>
                        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tint)}><Icon size={16} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500">{n.body}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{n.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={() => setView("profile")} className="shrink-0">
          <Avatar initials={profile.initials} gradient={profile.gradient} size={36} ring />
        </button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { view, setView, conversations, activeTrip } = useStore();
  const msgUnread = conversations.reduce((s, c) => s + c.unread, 0);
  return (
    <nav className="z-30 flex shrink-0 items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur md:hidden">
      {NAV.map((n) => {
        const Icon = n.icon;
        const active = view === n.view;
        return (
          <button key={n.view} onClick={() => setView(n.view)} className={cn("relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold transition", active ? "text-emerald-600" : "text-slate-400")}>
            <Icon size={20} />{n.label}
            {n.view === "messages" && msgUnread > 0 && <span className="absolute right-3 top-0 h-2 w-2 rounded-full bg-rose-500" />}
            {n.view === "trips" && activeTrip && <span className="absolute right-3 top-0 h-2 w-2 animate-blink rounded-full bg-emerald-500" />}
            {active && <span className="absolute -top-0.5 h-1 w-6 rounded-full bg-emerald-500" />}
          </button>
        );
      })}
    </nav>
  );
}
