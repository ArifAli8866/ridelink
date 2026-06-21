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

    // POST — create a booking
    if (req.method === "POST") {
        try {
            const { ride_id, rider_id, price, co2_saved_kg, money_saved } = req.body ?? {};
            if (!ride_id || !rider_id) {
                return res.status(400).json({ error: "Missing ride_id or rider_id" });
            }
            const rows = await sql`
        insert into bookings (ride_id, rider_id, price, co2_saved_kg, money_saved)
        values (
          ${ride_id}, ${rider_id},
          ${price ?? null}, ${co2_saved_kg ?? null}, ${money_saved ?? null}
        )
        returning *
      `;
            return res.status(201).json(rows[0]);
        } catch (err) {
            return res.status(500).json({ error: String(err) });
        }
    }

    // GET — fetch bookings (filter by rider_id or ride_id via query param)
    if (req.method === "GET") {
        try {
            const { rider_id, ride_id } = req.query;
            let rows;
            if (rider_id) {
                rows = await sql`
          select b.*, r.origin, r.destination, r.depart_at, u.name as driver_name
          from bookings b
          left join rides r on r.id = b.ride_id
          left join users u on u.id = r.driver_id
          where b.rider_id = ${rider_id as string}
          order by b.created_at desc
        `;
            } else if (ride_id) {
                rows = await sql`
          select b.*, u.name as rider_name
          from bookings b
          left join users u on u.id = b.rider_id
          where b.ride_id = ${ride_id as string}
          order by b.created_at desc
        `;
            } else {
                rows = await sql`
          select * from bookings order by created_at desc limit 50
        `;
            }
            return res.status(200).json(rows);
        } catch (err) {
            return res.status(500).json({ error: String(err) });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}