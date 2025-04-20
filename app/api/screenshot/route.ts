import { NextRequest, NextResponse } from "next/server";
import { loadShops } from "@/lib/shops";

// strip protocol + optional www.
function slugify(url: string) {
  return url
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

export async function GET(req: NextRequest, { params }: { params: { shop: string } }) {
  const { shop } = params;
  const page = req.nextUrl.searchParams.get("page") || "1";
  const perPage = req.nextUrl.searchParams.get("per_page") || "25";

  // 1) find your saved connection
  const shops = loadShops();
  const matched = shops.find((s) => slugify(s.url) === shop);
  if (!matched) {
    return NextResponse.json({ error: "Unknown shop" }, { status: 404 });
  }

  // 2) load credentials from cookie (or adjust as needed)
  const cookie = req.cookies.get("wooConnections");
  const conns = cookie ? JSON.parse(cookie.value) as any[] : [];
  const conn = conns.find((c) => c.selectedShopUrl === matched.url);
  if (!conn) {
    return NextResponse.json({ error: "Missing WooCommerce credentials" }, { status: 401 });
  }

  // 3) normalize and force www.
  let raw = matched.url;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const parsed = new URL(raw);
  if (!parsed.hostname.startsWith("www.")) parsed.hostname = `www.${parsed.hostname}`;
  const origin = parsed.origin;

  // 4) call WooCommerce with Basic Auth
  const auth = Buffer.from(`${conn.consumerKey}:${conn.consumerSecret}`).toString("base64");
  const wcRes = await fetch(
    `${origin}/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  const data = await wcRes.json();
  const totalPages = wcRes.headers.get("X-WP-TotalPages") || "1";

  return NextResponse.json(data, {
    status: wcRes.status,
    headers: { "X-Total-Pages": totalPages }
  });
}