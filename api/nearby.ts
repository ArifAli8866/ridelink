import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const sql = neon(url);

    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const exclude = (req.query.exclude as string) ?? "";
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "Missing lat/lng" });
    }

    const rows = await sql`
      select id, name, role, destination, vehicle, eco, lat, lng
      from users
      where updated_at > now() - interval '60 seconds'
        and id <> ${exclude}
        and lat between ${lat - 0.12} and ${lat + 0.12}
        and lng between ${lng - 0.12} and ${lng + 0.12}
      order by updated_at desc
      limit 60
    `;
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}