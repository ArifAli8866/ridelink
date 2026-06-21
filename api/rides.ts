import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).end();

    const url = process.env.DATABASE_URL;
    if (!url) return res.status(500).json({ error: "DATABASE_URL is not set" });
    const sql = neon(url);

    // POST — create a new ride
    if (req.method === "POST") {
        try {
            const { driver_id, origin, destination, price, seats, eco, vehicle, depart_at } = req.body ?? {};
            if (!driver_id || !destination) {
                return res.status(400).json({ error: "Missing driver_id or destination" });
            }
            const rows = await sql`
        insert into rides (driver_id, origin, destination, price, seats, eco, vehicle, depart_at)
        values (
          ${driver_id}, ${origin ?? null}, ${destination},
          ${price ?? null}, ${seats ?? 1}, ${eco ?? false},
          ${vehicle ?? null}, ${depart_at ?? null}
        )
        returning *
      `;
            return res.status(201).json(rows[0]);
        } catch (err) {
            return res.status(500).json({ error: String(err) });
        }
    }

    // GET — fetch all rides (newest first)
    if (req.method === "GET") {
        try {
            const rows = await sql`
        select r.*, u.name as driver_name, u.vehicle as driver_vehicle
        from rides r
        left join users u on u.id = r.driver_id
        order by r.created_at desc
        limit 50
      `;
            return res.status(200).json(rows);
        } catch (err) {
            return res.status(500).json({ error: String(err) });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}