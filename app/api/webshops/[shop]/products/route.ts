import { NextRequest, NextResponse } from "next/server";

// we’re on the Node runtime so fetch + Buffer behave normally
export const runtime = "nodejs";

interface WooEntry {
  selectedShopUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

// must exactly match your client’s slugify
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
  // 🚨 you must await params before using them
  const { shop: shopSlug } = await params;

  // pagination + new price‑sort flag
  const page      = req.nextUrl.searchParams.get("page")      ?? "1";
  const perPage   = req.nextUrl.searchParams.get("per_page")  ?? "25";
  const sortPrice = req.nextUrl.searchParams.get("sort_price")==="1";

  // 1) look up the shop URL from my_webshops cookie
  const shopsCookie = decodeURIComponent(
    req.cookies.get("my_webshops")?.value ?? "[]"
  );
  const shops = JSON.parse(shopsCookie) as { name: string; url: string }[];
  const matched = shops.find((s) => slugify(s.url) === shopSlug);
  if (!matched) {
    return NextResponse.json({ error: "Unknown shop" }, { status: 404 });
  }

  // 2) grab your Woo creds from wooConnections cookie
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

  // 4) build WooCommerce query
  const qs = new URLSearchParams({
    page,
    per_page:        perPage,
    consumer_key:    conn.consumerKey,
    consumer_secret: conn.consumerSecret,
    _fields:
      "id,name,price,stock_status,stock_quantity,date_modified,images,meta_data",
  });

  // if the client asked for price sorting, WooCommerce supports this natively
  if (sortPrice) {
    qs.set("orderby", "price");
    qs.set("order",   "asc");
  }

  // 5) fetch that one page of products
  const wcRes = await fetch(`${origin}/wp-json/wc/v3/products?${qs}`, {
    next: { revalidate: 120 }, // cache on the edge 60s
  });
  if (!wcRes.ok) {
    return NextResponse.json(
      { error: `WooCommerce returned ${wcRes.status}` },
      { status: wcRes.status }
    );
  }
  const products   = await wcRes.json();
  const totalPages = wcRes.headers.get("X-WP-TotalPages") ?? "1";

  // 6) fetch your store’s general settings to read the currency
  const setQs = new URLSearchParams({
    consumer_key:    conn.consumerKey,
    consumer_secret: conn.consumerSecret,
  });
  const setRes   = await fetch(
    `${origin}/wp-json/wc/v3/settings/general?${setQs}`,
    { next: { revalidate: 3600 } }
  );
  const settings = await setRes.json();
  const currency =
    settings.find((s: any) => s.id === "woocommerce_currency")?.value ??
    "USD";

  // 7) return everything together, exposing the total‑pages header
  return NextResponse.json(
    { products, currency },
    {
      headers: {
        "X-WP-TotalPages": totalPages,
        "Access-Control-Expose-Headers": "X-WP-TotalPages",
      },
    }
  );
}
