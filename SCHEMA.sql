-- ============================================================
--  RideLink — Neon / PostgreSQL schema
--  Run this in your Neon SQL Editor (one time setup).
-- ============================================================

-- Live users on the map (real people, real GPS)
create table if not exists users (
  id          text primary key,            -- per-device id sent from the app
  name        text not null,
  role        text not null default 'rider', -- 'rider' | 'driver'
  destination text,
  vehicle     text,
  eco         boolean default false,
  lat         double precision not null,
  lng         double precision not null,
  updated_at  timestamptz not null default now()
);

-- Speed up the "who is online and near me" query
create index if not exists users_updated_at_idx on users (updated_at);
create index if not exists users_loc_idx on users (lat, lng);

-- (Optional, for future: posted rides + bookings across users)
create table if not exists rides (
  id          uuid primary key default gen_random_uuid(),
  driver_id   text references users(id) on delete cascade,
  origin      text,
  destination text,
  price       numeric,
  seats       int,
  eco         boolean default false,
  vehicle     text,
  depart_at   timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  ride_id       uuid references rides(id) on delete cascade,
  rider_id      text references users(id) on delete cascade,
  status        text default 'requested',
  price         numeric,
  co2_saved_kg  numeric,
  money_saved   numeric,
  created_at    timestamptz not null default now()
);
