import { neon } from "@neondatabase/serverless";

/**
 * Returns a Neon SQL tagged-template client.
 * `DATABASE_URL` is set in Vercel → Project → Settings → Environment Variables.
 */
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}
