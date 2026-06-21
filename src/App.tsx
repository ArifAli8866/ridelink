import { useState } from "react";
import { AppProvider, useStore } from "./store";
import Onboarding from "./components/Onboarding";
import { TopBar, BottomNav } from "./components/TopBar";
import MapView from "./components/MapView";
import NearbyPanel from "./components/NearbyPanel";
import TripsView from "./components/TripsView";
import ImpactDashboard from "./components/ImpactDashboard";
import MessagesView from "./components/MessagesView";
import ProfileView from "./components/ProfileView";
import RideDetailModal from "./components/RideDetailModal";
import PostRideModal from "./components/PostRideModal";

function Discover() {
  return (
    <div className="h-full">
      <div className="grid h-full grid-rows-[42vh_1fr] gap-3 p-3 md:grid-cols-[380px_1fr] md:grid-rows-1 md:p-4">
        <div className="min-h-0 md:order-2">
          <MapView />
        </div>
        <div className="min-h-0 md:order-1">
          <NearbyPanel />
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const { view, profile } = useStore();
  const [postOpen, setPostOpen] = useState(false);

  if (!profile) return <Onboarding />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <TopBar onPostRide={() => setPostOpen(true)} />
      <main className="relative min-h-0 flex-1">
        {view === "discover" && <Discover />}
        {view === "trips" && <TripsView />}
        {view === "impact" && <ImpactDashboard />}
        {view === "messages" && <MessagesView />}
        {view === "profile" && <ProfileView />}
      </main>
      <BottomNav />
      <RideDetailModal />
      {postOpen && <PostRideModal onClose={() => setPostOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
