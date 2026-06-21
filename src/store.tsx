import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type {
  CurrentUser,
  NearbyUser,
  PostedRide,
  Trip,
  Conversation,
  AppNotification,
  View,
  Filters,
  GeoPoint,
} from "./types";
import { co2For, moneyFor, nowTime, pickGradient } from "./data";
import { generateSampleRiders, haversineKm } from "./lib/geo";
import { load, save, KEYS, getDeviceId } from "./lib/storage";
import { heartbeat, fetchNearby, mapDbUser } from "./lib/api";
import { useRef } from "react";

export interface Me {
  granted: boolean;
  lat: number | null;
  lng: number | null;
  accuracy: number;
  address: string;
}

interface Store {
  profile: CurrentUser | null;
  me: Me;
  createProfile: (p: CurrentUser) => void;
  updateProfile: (p: Partial<CurrentUser>) => void;
  resetAll: () => void;

  view: View;
  setView: (v: View) => void;

  nearby: NearbyUser[];
  previewOn: boolean;
  togglePreview: () => void;
  liveMode: boolean;
  selectedId: string | null;
  selected: NearbyUser | null;
  select: (id: string | null) => void;
  filtered: NearbyUser[];

  filters: Filters;
  setFilter: (p: Partial<Filters>) => void;

  requestState: "idle" | "searching" | "matched" | "booked";
  startRequest: () => void;
  resetRequest: () => void;
  confirmBooking: () => void;

  activeTrip: Trip | null;
  completeActiveTrip: () => void;
  rateTrip: (id: string, rating: number) => void;

  trips: Trip[];
  postedRides: PostedRide[];
  postRide: (p: Omit<PostedRide, "id" | "createdAt">) => void;
  cancelPostedRide: (id: string) => void;

  conversations: Conversation[];
  openConversation: (u: NearbyUser) => void;
  sendMessage: (id: string, text: string) => void;

  notifications: AppNotification[];
  markNotificationsRead: () => void;
  pushNotification: (n: Omit<AppNotification, "id" | "read" | "time">) => void;

  impact: { co2: number; money: number; rides: number; km: number };
}

const Ctx = createContext<Store | null>(null);
let idc = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${idc++}`;

const DEFAULT_ME: Me = {
  granted: false,
  lat: null,
  lng: null,
  accuracy: 0,
  address: "Locating…",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CurrentUser | null>(() =>
    load<CurrentUser | null>(KEYS.profile, null)
  );
  const [me, setMe] = useState<Me>(() => {
    const p = load<CurrentUser | null>(KEYS.profile, null);
    return p && p.lat != null && p.lng != null
      ? { ...DEFAULT_ME, lat: p.lat, lng: p.lng, address: "Last known spot" }
      : DEFAULT_ME;
  });

  const [view, setView] = useState<View>("discover");

  const [previewOn, setPreviewOn] = useState<boolean>(() =>
    load<boolean>(KEYS.preview, false)
  );
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false);

  // refs to avoid restarting the polling interval on every GPS fix
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const liveModeRef = useRef(false);
  useEffect(() => {
    liveModeRef.current = liveMode;
  }, [liveMode]);

  const [filters, setFilters] = useState<Filters>({
    query: "",
    maxDistance: 5,
    maxPrice: 20,
    minRating: 0,
    ecoOnly: false,
  });
  const [requestState, setRequestState] = useState<Store["requestState"]>("idle");
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const [trips, setTrips] = useState<Trip[]>(() => load<Trip[]>(KEYS.trips, []));
  const [postedRides, setPostedRides] = useState<PostedRide[]>(() =>
    load<PostedRide[]>(KEYS.postedRides, [])
  );
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    load<Conversation[]>(KEYS.conversations, [])
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    load<AppNotification[]>(KEYS.notifications, [])
  );

  /* ---- persistence ---- */
  useEffect(() => void save(KEYS.trips, trips), [trips]);
  useEffect(() => void save(KEYS.postedRides, postedRides), [postedRides]);
  useEffect(() => void save(KEYS.conversations, conversations), [conversations]);
  useEffect(() => void save(KEYS.notifications, notifications), [notifications]);
  useEffect(() => void save(KEYS.preview, previewOn), [previewOn]);

  /* ---- live GPS tracking (real watchPosition) ---- */
  useEffect(() => {
    if (!profile) return;
    if (!("geolocation" in navigator)) {
      setMe((m) => ({ ...m, address: "Geolocation not supported" }));
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        coordsRef.current = { lat: latitude, lng: longitude };
        setMe({
          granted: true,
          lat: latitude,
          lng: longitude,
          accuracy,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
        setNearby((prev) =>
          prev.map((u) => ({
            ...u,
            distanceKm: +haversineKm(latitude, longitude, u.lat, u.lng).toFixed(2),
          }))
        );
      },
      () =>
        setMe((m) => ({
          ...m,
          granted: false,
          address: m.lat ? "Live updates paused · showing last spot" : "Location permission denied",
        })),
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile != null]);

  /* ---- generate preview riders once GPS is known (only when NOT live) ---- */
  useEffect(() => {
    if (liveMode) return;
    if (!previewOn || nearby.length > 0 || me.lat == null || me.lng == null) return;
    setNearby(generateSampleRiders({ lat: me.lat, lng: me.lng }, 9));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOn, me.lat, me.lng, nearby.length, liveMode]);

  /* ---- LIVE MULTI-USER: heartbeat + poll nearby from Neon ---- */
  useEffect(() => {
    if (!profile) return;
    const deviceId = getDeviceId();
    let cancelled = false;

    const tick = async () => {
      const c = coordsRef.current;
      if (!c) return;
      const ok = await heartbeat({
        id: deviceId,
        name: profile.name,
        role: profile.role,
        destination: profile.destination,
        vehicle: profile.vehicle,
        eco: profile.eco,
        lat: c.lat,
        lng: c.lng,
      });
      if (!ok || cancelled) return;
      if (!liveModeRef.current) setLiveMode(true);
      const rows = await fetchNearby({ lat: c.lat, lng: c.lng, exclude: deviceId });
      if (cancelled || !rows) return;
      setNearby(rows.map((r) => mapDbUser(r, c.lat, c.lng)));
    };

    tick();
    const id = setInterval(tick, 7000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.name, profile?.role]);

  /* ---- live ticking: depart countdowns + sample drift + active trip ---- */
  useEffect(() => {
    const t = setInterval(() => {
      setNearby((prev) =>
        prev.map((u) => ({
          ...u,
          departIn: Math.max(1, u.departIn - 0.5),
        }))
      );
      setActiveTrip((tr) =>
        tr && tr.status === "active"
          ? {
              ...tr,
              progress: Math.min(1, (tr.progress ?? 0.05) + 0.014),
              departIn: Math.max(0, (tr.departIn ?? 0) - 0.4),
            }
          : tr
      );
      setPostedRides((prev) =>
        prev.map((r) => ({ ...r, departIn: Math.max(1, r.departIn - 0.5) }))
      );
    }, 1500);
    return () => clearInterval(t);
  }, []);

  /* ---- request flow ---- */
  useEffect(() => {
    if (requestState !== "searching") return;
    const t = setTimeout(() => setRequestState("matched"), 2600);
    return () => clearTimeout(t);
  }, [requestState]);

  const pushNotification = useCallback(
    (n: Omit<AppNotification, "id" | "read" | "time">) => {
      setNotifications((prev) => [
        { ...n, id: uid("n"), read: false, time: "just now" },
        ...prev,
      ]);
    },
    []
  );

  const createProfile = useCallback((p: CurrentUser) => {
    setProfile(p);
    void save(KEYS.profile, p);
    const la = p.lat;
    const ln = p.lng;
    if (la != null && ln != null)
      setMe((m) => ({ ...m, lat: la, lng: ln, granted: true }));
  }, []);

  const updateProfile = useCallback((p: Partial<CurrentUser>) => {
    setProfile((cur) => {
      if (!cur) return cur;
      const next = { ...cur, ...p };
      void save(KEYS.profile, next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setProfile(null);
    setMe(DEFAULT_ME);
    setTrips([]);
    setPostedRides([]);
    setConversations([]);
    setNotifications([]);
    setNearby([]);
    setPreviewOn(false);
    setLiveMode(false);
    setSelectedId(null);
    setActiveTrip(null);
    setView("discover");
  }, []);

  const togglePreview = useCallback(() => {
    setPreviewOn((on) => {
      const next = !on;
      if (!next) setNearby([]);
      return next;
    });
  }, []);

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
    setRequestState("idle");
  }, []);

  const setFilter = useCallback((p: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...p }));
  }, []);

  const selected = useMemo(
    () => nearby.find((u) => u.id === selectedId) ?? null,
    [nearby, selectedId]
  );

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return nearby
      .filter((u) => {
        if (filters.ecoOnly && !u.eco) return false;
        if (u.rating < filters.minRating) return false;
        if (u.distanceKm > filters.maxDistance) return false;
        if (u.price > filters.maxPrice) return false;
        if (q && !`${u.destination} ${u.origin} ${u.name}`.toLowerCase().includes(q))
          return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [nearby, filters]);

  const startRequest = useCallback(() => setRequestState("searching"), []);
  const resetRequest = useCallback(() => setRequestState("idle"), []);

  const confirmBooking = useCallback(() => {
    if (!selected || !profile) return;
    const u = selected;
    const youDrive = profile.role === "driver";
    const trip: Trip = {
      id: uid("t"),
      driverName: youDrive ? profile.name : u.name,
      initials: youDrive ? profile.initials : u.initials,
      gradient: youDrive ? profile.gradient : u.gradient,
      vehicle: youDrive ? profile.vehicle ?? "Your car" : u.vehicle,
      eco: youDrive ? !!profile.eco : u.eco,
      from: u.origin,
      to: u.destination,
      date: "Today · live",
      distanceKm: u.distanceKm,
      price: u.price,
      co2SavedKg: co2For(u.distanceKm),
      moneySaved: moneyFor(u.distanceKm),
      status: "active",
      passengers: youDrive ? 1 : 2,
      progress: 0.06,
      departIn: u.departIn,
    };
    setActiveTrip(trip);
    setTrips((prev) => [trip, ...prev]);
    updateProfile({
      rides: profile.rides + 1,
      wallet: +(profile.wallet - (youDrive ? 0 : u.price)).toFixed(2),
    });
    setRequestState("booked");
    pushNotification({
      title: "Ride confirmed 🚗",
      body: `${trip.driverName} is heading your way · ETA ${Math.ceil(u.departIn)} min`,
      type: "ride",
    });
  }, [selected, profile, updateProfile, pushNotification]);

  const completeActiveTrip = useCallback(() => {
    setActiveTrip((cur) => {
      if (!cur) return null;
      setTrips((prev) =>
        prev.map((t) =>
          t.id === cur.id ? { ...t, status: "completed", rating: undefined, date: "Just now" } : t
        )
      );
      pushNotification({
        title: "Trip completed 🎉",
        body: `You saved ${cur.co2SavedKg} kg CO₂ and $${cur.moneySaved.toFixed(2)}.`,
        type: "eco",
      });
      return null;
    });
    setRequestState("idle");
    setSelectedId(null);
  }, [pushNotification]);

  const rateTrip = useCallback((id: string, rating: number) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, rating, status: "completed" } : t
      )
    );
  }, []);

  const postRide = useCallback(
    (p: Omit<PostedRide, "id" | "createdAt">) => {
      const ride: PostedRide = { ...p, id: uid("r"), createdAt: Date.now() };
      setPostedRides((prev) => [ride, ...prev]);
      const trip: Trip = {
        id: uid("t"),
        driverName: profile?.name ?? "You",
        initials: profile?.initials ?? "U",
        gradient: profile?.gradient ?? pickGradient(1),
        vehicle: p.vehicle,
        eco: p.eco,
        from: p.origin,
        to: p.destination,
        date: `Departs in ${p.departIn} min`,
        distanceKm: +(p.departIn * 0.7).toFixed(1),
        price: p.price,
        co2SavedKg: co2For(p.departIn * 0.7),
        moneySaved: moneyFor(p.departIn * 0.7),
        status: "upcoming",
        passengers: 1,
        departIn: p.departIn,
      };
      setTrips((prev) => [trip, ...prev]);
      pushNotification({
        title: "Your ride is live 🟢",
        body: `Offered ${p.origin} → ${p.destination} · ${p.seats} seat(s).`,
        type: "ride",
      });
    },
    [profile, pushNotification]
  );

  const cancelPostedRide = useCallback((id: string) => {
    setPostedRides((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const openConversation = useCallback(
    (u: NearbyUser) => {
      setConversations((prev) => {
        if (prev.some((c) => c.id === u.id)) return prev;
        return [
          {
            id: u.id,
            name: u.name,
            initials: u.initials,
            gradient: u.gradient,
            role: u.role,
            lastMessage: "Hi! I'm interested in the shared ride.",
            time: "now",
            unread: 1,
            online: u.online,
            messages: [
              { from: "them", text: "Hi! I'm interested in the shared ride.", time: nowTime() },
            ],
          },
          ...prev,
        ];
      });
      setView("messages");
    },
    [setView]
  );

  const sendMessage = useCallback((id: string, text: string) => {
    const t = nowTime();
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              lastMessage: text,
              time: "now",
              unread: 0,
              messages: [...c.messages, { from: "me", text, time: t }],
            }
          : c
      )
    );
    setTimeout(() => {
      const replies = [
        "Sounds good! 👍",
        "See you soon 🚗",
        "Perfect, on my way!",
        "Great, thanks for sharing 🌱",
        "Works for me!",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                lastMessage: reply,
                time: "now",
                messages: [...c.messages, { from: "them", text: reply, time: nowTime() }],
              }
            : c
        )
      );
    }, 1500);
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const impact = useMemo(
    () =>
      trips.reduce(
        (acc, t) => ({
          co2: +(acc.co2 + t.co2SavedKg).toFixed(1),
          money: +(acc.money + t.moneySaved).toFixed(2),
          rides: acc.rides + (t.status === "completed" || t.status === "active" ? 1 : 0),
          km: +(acc.km + t.distanceKm).toFixed(1),
        }),
        { co2: 0, money: 0, rides: 0, km: 0 }
      ),
    [trips]
  );

  const value: Store = {
    profile,
    me,
    createProfile,
    updateProfile,
    resetAll,
    view,
    setView,
    nearby,
    previewOn,
    togglePreview,
    liveMode,
    selectedId,
    selected,
    select,
    filtered,
    filters,
    setFilter,
    requestState,
    startRequest,
    resetRequest,
    confirmBooking,
    activeTrip,
    completeActiveTrip,
    rateTrip,
    trips,
    postedRides,
    postRide,
    cancelPostedRide,
    conversations,
    openConversation,
    sendMessage,
    notifications,
    markNotificationsRead,
    pushNotification,
    impact,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within AppProvider");
  return v;
}

export type { GeoPoint };
