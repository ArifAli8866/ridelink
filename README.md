# 🌿 RideLink — Share rides. Save money. Cut carbon.

A **real, live** carpooling app. See real people heading your way on a **real map** (OpenStreetMap/CARTO), share your **live GPS**, request rides, split fuel, and track CO₂ + money saved. Empty by default, fully live once connected to a database.

---

## ✨ Features
- **🗺️ Real map** (Leaflet + OpenStreetMap) — live GPS dot, accuracy circle, pan/zoom.
- **🔴 Live multi-user** — your location is written to Neon Postgres every few seconds; you see other online users on your map instantly (within ~13 km).
- **🧍 Empty by default** — no fake data.
- **🤝 Full flow** — nearby → request → match → book → live trip → rate.
- **📊 Impact** computed from real rides · **🚗 post a ride** · **💬 messages** · **👤 profile** · **🔔 notifications** · mobile + desktop responsive.

---

## 🚀 Quick deploy (frontend only — works without a DB)
```bash
git push origin main      # then import on vercel.com → Deploy
```
Build: `npm run build` · Output: `dist`. Without a DB, the app still runs (live GPS + preview mode); you just won't see *other real people* yet.

---

# 🗄️ Connect a database — STEP BY STEP (Neon + PostgreSQL)

This makes the map **truly live**: every phone running the app shows every other nearby phone in real time. ~10 minutes.

### Step 1 — Create a free Neon database
1. Go to **[neon.tech](https://neon.tech)** → **Sign up** (GitHub/Google).
2. Click **Create Project** → name it `ridelink` → pick a region close to you → **Create**.
3. On the project **Dashboard**, find the **Connection Details** box.
4. Copy the **connection string**. It looks like:
   ```
   postgresql://neondb_owner:npg_xyz@ep-cool-rain-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   👀 Keep this secret — it's your DB password.

### Step 2 — Create the tables
1. In Neon, click **SQL Editor** (left sidebar) → **New query**.
2. Open the file **`SCHEMA.sql`** from this project, copy **all** of it, paste into the editor.
3. Click **Run**. You should see `Create Table` success messages. ✅

### Step 3 — Install dependencies (already done, just confirming)
```bash
npm install
```
The DB driver `@neondatabase/serverless` and `@vercel/node` are already in `package.json`.

### Step 4 — Add the connection string to Vercel
1. Go to your project on **[vercel.com](https://vercel.com)**.
2. **Settings → Environment Variables → Add New**.
3. Fill in:
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | *(paste your Neon connection string)* |
4. **Environment**: tick **Production, Preview, and Development** → **Save**.

### Step 5 — Redeploy
- **Deployments → click the latest → Redeploy** (or just `git push` an empty commit). The serverless functions `api/heartbeat` and `api/nearby` will now have the DB.

### Step 6 — Test it 🎉
1. Open your live Vercel URL on **your phone** (or laptop) → allow location.
2. Open the **same URL on a second device/browser** (a friend, or an incognito window) → create a *different* profile → allow location.
3. Within a few seconds you'll see **each other's live marker** on the map and in the "People near you" list. The chip at the top shows **🟢 Live · connected to database**.

> Both devices must share real GPS (use phones, or move the simulated location). Users automatically disappear ~60s after they close the app.

---

## 🔧 Test the database locally (optional)
```bash
npm install -g vercel
vercel      # links the project
vercel env pull .env.local   # copies DATABASE_URL locally
vercel dev  # runs frontend + api/ functions together at localhost:3000
```

## 🐛 Troubleshooting
| Problem | Fix |
|---|---|
| Map shows "Preview mode", never "Live" | `DATABASE_URL` not set in Vercel, or you didn't redeploy. Check **Settings → Env Vars** + redeploy. |
| `DATABASE_URL is not set` error in logs | Env var not added / not saved to all environments. |
| No other users appear | You need **2+ devices** open at the same time within ~13 km. One phone alone = empty map (that's correct!). |
| Neon "relation users does not exist" | You skipped **Step 2** — run `SCHEMA.sql` in the SQL Editor. |
| Build fails on Vercel | Ensure Framework = **Vite**, Output = **dist** (see `vercel.json`, already included). |

---

## 🧱 Tech stack
React 19 · TypeScript · Vite · Tailwind v4 · react-leaflet · `@neondatabase/serverless` serverless functions.

## 📁 Structure
```
api/                    Vercel serverless functions (talk to Neon)
  _db.ts                  shared Neon SQL client
  heartbeat.ts            POST live location/profile   →  /api/heartbeat
  nearby.ts               GET online users near you    →  /api/nearby
SCHEMA.sql              the DB tables — run once in Neon
src/
  lib/api.ts            frontend client (heartbeat, fetchNearby, mapDbUser)
  lib/geo.ts            distance, sample riders
  lib/storage.ts        localStorage + device id
  store.tsx             state, live GPS, DB polling
  components/           MapView, NearbyPanel, RideDetailModal, PostRideModal,
                        TripsView, ImpactDashboard, MessagesView, ProfileView, TopBar
```

## 🔒 Privacy
Each device gets a random stable id. Location is shared only while the app is open and auto-expires after 60 seconds. No accounts needed for the MVP.

Made with 💚 for a greener, cheaper commute.
