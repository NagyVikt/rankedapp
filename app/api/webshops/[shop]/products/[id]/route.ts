
// app/api/webshops/[shop]/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

interface WooEntry {
  selectedShopUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

function slugify(url: string) {
  return url
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string; id: string }> }
): Promise<NextResponse> {
  const { shop: shopSlug, id } = await params;

  // 1) lookup shop URL from my_webshops cookie
  const shopsCookie = decodeURIComponent(
    req.cookies.get("my_webshops")?.value ?? "[]"
  );
  const shops = JSON.parse(shopsCookie) as { name: string; url: string }[];

  // allow both "slugify(url)" and "www-"+slugify(url)
  const matched = shops.find((s) => {
    const base = slugify(s.url);
    return base === shopSlug || `www-${base}` === shopSlug;
  });
  if (!matched) {
    return NextResponse.json({ error: "Unknown shop" }, { status: 404 });
  }

  // 2) grab Woo creds from wooConnections cookie
  const credsCookie = decodeURIComponent(
    req.cookies.get("wooConnections")?.value ?? "[]"
  );
  const conns = JSON.parse(credsCookie) as WooEntry[];
  const conn = conns.find((c) => c.selectedShopUrl === matched.url);
  if (!conn) {
    return NextResponse.json(
      { error: "Missing WooCommerce credentials" },
      { status: 401 }
    );
  }

  // 3) normalize + force https://www.
  let raw = matched.url;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const parsed = new URL(raw);
  if (!parsed.hostname.startsWith("www.")) {
    parsed.hostname = `www.${parsed.hostname}`;
  }
  const origin = parsed.origin;

  // 4) build Woo query for the fields we need
  const qs = new URLSearchParams({
    consumer_key:    conn.consumerKey,
    consumer_secret: conn.consumerSecret,
    _fields:
      "id,name,price,average_rating,rating_count,short_description,description,images",
  });

  // 5) fetch the single product
  const wcRes = await fetch(
    `${origin}/wp-json/wc/v3/products/${id}?${qs}`,
    { next: { revalidate: 60 } }
  );
  if (!wcRes.ok) {
    return NextResponse.json(
      { error: `Woo returned ${wcRes.status}` },
      { status: wcRes.status }
    );
  }

  // 6) return the product JSON
  const product = await wcRes.json();
  return NextResponse.json(product, { status: 200 });
}
