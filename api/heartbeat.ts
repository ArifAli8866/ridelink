import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSql } from "./_db";

/** POST /api/heartbeat — upsert the caller's live location + profile. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, name, role, destination, vehicle, eco, lat, lng } = req.body ?? {};
    if (!id || lat == null || lng == null) {
      return res.status(400).json({ error: "Missing id, lat or lng" });
    }
    const sql = getSql();
    await sql`
      insert into users (id, name, role, destination, vehicle, eco, lat, lng, updated_at)
      values (${id}, ${name ?? "Guest"}, ${role ?? "rider"}, ${destination ?? null},
              ${vehicle ?? null}, ${eco ?? false}, ${lat}, ${lng}, now())
      on conflict (id) do update set
        name        = excluded.name,
        role        = excluded.role,
        destination = excluded.destination,
        vehicle     = excluded.vehicle,
        eco         = excluded.eco,
        lat         = excluded.lat,
        lng         = excluded.lng,
        updated_at  = now()
    `;
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
