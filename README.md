<div align="center">

# 🌿 RideLink

### *Share rides. Save money. Cut carbon.*

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ridelink--mu.vercel.app-22c55e?style=for-the-badge)](https://ridelink-mu.vercel.app)
[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Powered by Neon](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E699?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

<br/>

> **A real-time carpooling platform** — live GPS, instant ride matching, and CO₂ impact tracking. Built for a greener, cheaper commute.

<br/>

```
🗺️ Real Map  ·  🔴 Live GPS  ·  🤝 Ride Matching  ·  📊 Impact Dashboard  ·  💬 Messages
```

</div>

---

## ✨ Features at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        RIDELINK FEATURES                        │
├─────────────────┬───────────────────────────────────────────────┤
│  🗺️  Live Map    │  OpenStreetMap + Leaflet, real GPS dot        │
│  🔴  Multi-User  │  See other riders on your map in real time   │
│  🤝  Ride Flow   │  Post → Request → Match → Book → Rate        │
│  📊  Impact      │  CO₂ saved, money saved, trips counted       │
│  🚗  Post a Ride │  Set origin, destination, seats & price      │
│  💬  Messages    │  In-app chat between riders and drivers      │
│  👤  Profile     │  Persistent device identity, no signup       │
│  🔔  Alerts      │  Real-time ride request notifications        │
│  📱  Responsive  │  Mobile + desktop, works everywhere          │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## 🖥️ Screenshots

> Open the live app at **[ridelink-mu.vercel.app](https://ridelink-mu.vercel.app)** · Allow location · See people near you instantly.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│                                                              │
│   React 19 + TypeScript + Vite + Tailwind v4                │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│   │ MapView  │ │ NearbyP. │ │TripsView │ │ImpactDashbrd │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
│        └────────────┴────────────┴───────────────┘          │
│                          │ fetch                             │
└──────────────────────────┼───────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │     VERCEL EDGE          │
              │  Serverless Functions    │
              │                         │
              │  POST /api/heartbeat    │  ← your live GPS
              │  GET  /api/nearby       │  ← people near you
              │  POST /api/rides        │  ← post a ride
              │  GET  /api/rides        │  ← fetch all rides
              │  POST /api/bookings     │  ← book a ride
              │  GET  /api/bookings     │  ← your trips
              └────────────┬────────────┘
                           │ @neondatabase/serverless
              ┌────────────▼────────────┐
              │     NEON POSTGRES        │
              │                         │
              │  users    (live GPS)    │
              │  rides    (posted)      │
              │  bookings (confirmed)   │
              └─────────────────────────┘
```

---

## 🗄️ Database Schema

```sql
-- 👤 Live users on the map
users
  ├── id           TEXT PRIMARY KEY      -- device fingerprint
  ├── name         TEXT
  ├── role         TEXT  (rider|driver)
  ├── destination  TEXT
  ├── vehicle      TEXT
  ├── eco          BOOLEAN
  ├── lat          DOUBLE PRECISION
  ├── lng          DOUBLE PRECISION
  └── updated_at   TIMESTAMPTZ           -- auto-expires after 60s

-- 🚗 Posted rides
rides
  ├── id           UUID PRIMARY KEY
  ├── driver_id    TEXT → users(id)
  ├── origin       TEXT
  ├── destination  TEXT
  ├── price        NUMERIC
  ├── seats        INT
  ├── eco          BOOLEAN
  ├── vehicle      TEXT
  ├── depart_at    TIMESTAMPTZ
  └── created_at   TIMESTAMPTZ

-- 🎫 Bookings
bookings
  ├── id           UUID PRIMARY KEY
  ├── ride_id      UUID → rides(id)
  ├── rider_id     TEXT → users(id)
  ├── status       TEXT  (requested|confirmed|done)
  ├── price        NUMERIC
  ├── co2_saved_kg NUMERIC
  ├── money_saved  NUMERIC
  └── created_at   TIMESTAMPTZ
```

---

## 🚀 Quick Start

### 1 · Clone & Install

```bash
git clone https://github.com/ArifAli8866/ridelink.git
cd ridelink
npm install
```

### 2 · Set up Neon Database

1. Go to **[neon.tech](https://neon.tech)** → Create a free project named `ridelink`
2. Open **SQL Editor** → paste and run `SCHEMA.sql`
3. Copy your connection string:
   ```
   postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```

### 3 · Configure Environment

```bash
# .env.local
DATABASE_URL=postgresql://your-connection-string-here
```

### 4 · Run Locally

```bash
npm install -g vercel
vercel          # link project
vercel env pull .env.local
vercel dev      # runs at localhost:3000
```

### 5 · Deploy to Vercel

```bash
git push origin main   # auto-deploys via Vercel GitHub integration
```

Then add `DATABASE_URL` in **Vercel → Settings → Environment Variables**.

---

## 📁 Project Structure

```
ridelink/
│
├── api/                          # Vercel Serverless Functions
│   ├── heartbeat.ts              # POST live GPS location
│   ├── nearby.ts                 # GET users within ~13km
│   ├── rides.ts                  # GET/POST rides
│   └── bookings.ts               # GET/POST bookings
│
├── src/
│   ├── components/
│   │   ├── MapView.tsx           # Leaflet map + live GPS dot
│   │   ├── NearbyPanel.tsx       # List of nearby riders
│   │   ├── RideDetailModal.tsx   # Ride info + request button
│   │   ├── PostRideModal.tsx     # Create a new ride
│   │   ├── TripsView.tsx         # Your ride history
│   │   ├── ImpactDashboard.tsx   # CO₂ + money saved stats
│   │   ├── MessagesView.tsx      # In-app messaging
│   │   ├── ProfileView.tsx       # User profile
│   │   ├── Onboarding.tsx        # First-time setup
│   │   └── TopBar.tsx            # Nav + live status chip
│   │
│   ├── lib/
│   │   ├── api.ts                # Frontend API client
│   │   ├── geo.ts                # Distance calculations
│   │   └── storage.ts            # localStorage + device ID
│   │
│   ├── store.tsx                 # Global state + GPS polling
│   ├── types.ts                  # TypeScript interfaces
│   └── App.tsx                   # Root component
│
├── SCHEMA.sql                    # Run once in Neon SQL Editor
├── vercel.json                   # Vercel config
└── vite.config.ts                # Vite build config
```

---

## 🔌 API Reference

### `POST /api/heartbeat`
Upserts your live location. Called every few seconds automatically.
```json
// Request
{ "id": "device-xyz", "name": "Arif", "role": "driver",
  "lat": 24.8607, "lng": 67.0011, "destination": "Lahore" }

// Response
{ "ok": true }
```

### `GET /api/nearby?lat=&lng=&exclude=`
Returns online users within ~13km in the last 60 seconds.
```json
// Response
[{ "id": "...", "name": "Sara", "role": "rider", "lat": 24.86, "lng": 67.01 }]
```

### `POST /api/rides`
Posts a new ride to the database.
```json
// Request
{ "driver_id": "device-xyz", "origin": "Karachi",
  "destination": "Lahore", "price": 500, "seats": 3 }

// Response
{ "id": "uuid", "driver_id": "...", "origin": "Karachi", ... }
```

### `POST /api/bookings`
Books a ride.
```json
// Request
{ "ride_id": "uuid", "rider_id": "device-xyz" }

// Response
{ "id": "uuid", "status": "requested", ... }
```

---

## 🌍 Impact Tracking

```
Every completed ride calculates:

  🌱 CO₂ Saved  =  distance_km × 0.21 kg  (avg car emission factor)
  💰 Money Saved =  distance_km × fuel_cost_per_km ÷ passengers
  🚗 Trips       =  total bookings with status = 'done'

These are shown live on the Impact Dashboard.
```

---

## 🔒 Privacy

```
┌─────────────────────────────────────────────────┐
│  • No account or signup required                │
│  • Each device gets a random stable ID          │
│  • Location shared only while app is open       │
│  • Location auto-expires after 60 seconds       │
│  • No personal data stored beyond name + GPS    │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| 🔴 Preview mode, never Live | `DATABASE_URL` not set in Vercel → Settings → Env Vars. Redeploy after adding. |
| No other users appear | You need 2+ devices open at the same time within ~13km |
| `relation users does not exist` | Run `SCHEMA.sql` in Neon SQL Editor |
| Rides not saving | Make sure `api/rides.ts` is deployed — check Vercel Functions tab |
| Build fails | Framework = **Vite**, Output = **dist** in Vercel settings |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite · Tailwind v4 |
| Map | Leaflet · react-leaflet · OpenStreetMap |
| Backend | Vercel Serverless Functions |
| Database | Neon PostgreSQL · `@neondatabase/serverless` |
| Deployment | Vercel (auto-deploy from GitHub) |

---

## 🤝 Contributing

```bash
# Fork the repo, create a branch
git checkout -b feat/your-feature

# Make your changes, then
git commit -m "feat: your feature description"
git push origin feat/your-feature

# Open a Pull Request on GitHub
```

---

<div align="center">

Made with 💚 for a greener, cheaper commute

**[⭐ Star this repo](https://github.com/ArifAli8866/ridelink)** · **[🚀 Live Demo](https://ridelink-mu.vercel.app)** · **[🐛 Report Bug](https://github.com/ArifAli8866/ridelink/issues)**

<br/>

*RideLink — because every empty seat is a missed opportunity*

</div>
