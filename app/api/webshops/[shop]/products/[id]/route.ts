import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

interface WooEntry {
  selectedShopUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

function slugify(url: string) {
  const slug = url
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
  // console.log(`slugify: input='${url}', output='${slug}'`); // Optional: log slugify behavior
  return slug;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string; id: string }> }
): Promise<NextResponse> {
  console.log("\n--- Handling GET /api/webshops/[shop]/products/[id] ---");
  const { shop: shopSlug, id } = await params;
  console.log(`[PRODUCT_DETAIL] shopSlug from path: '${shopSlug}', product ID: '${id}'`);

  // 1) lookup shop URL from my_webshops cookie
  const shopsCookieRaw = req.cookies.get("my_webshops")?.value;
  console.log("[PRODUCT_DETAIL] Raw 'my_webshops' cookie:", shopsCookieRaw);
  const shopsCookie = decodeURIComponent(shopsCookieRaw ?? "[]");
  console.log("[PRODUCT_DETAIL] Decoded 'my_webshops' cookie:", shopsCookie);
  
  let shops: { name: string; url: string }[] = [];
  try {
    shops = JSON.parse(shopsCookie);
  } catch (e: any) {
    console.error("[PRODUCT_DETAIL] Error parsing 'my_webshops' cookie:", e.message);
    return NextResponse.json({ error: "Invalid my_webshops cookie format" }, { status: 500 });
  }
  console.log("[PRODUCT_DETAIL] Parsed 'shops' from cookie:", shops);

  const matched = shops.find((s) => {
    const base = slugify(s.url);
    console.log(`[PRODUCT_DETAIL] Comparing shopSlug '${shopSlug}' with:`);
    console.log(`  - slugified s.url ('${s.url}' -> '${base}'): Is '${base === shopSlug}'?`);
    console.log(`  - 'www-${base}' ('www-${base}'): Is '${`www-${base}` === shopSlug}'?`);
    return base === shopSlug || `www-${base}` === shopSlug;
  });

  if (!matched) {
    console.error(`[PRODUCT_DETAIL] 404 - Unknown shop. No shop found for slug '${shopSlug}' (or 'www-${shopSlug}') in 'my_webshops'.`);
    return NextResponse.json({ error: "Unknown shop" }, { status: 404 });
  }
  console.log("[PRODUCT_DETAIL] Matched shop from 'my_webshops':", matched);
  console.log(`[PRODUCT_DETAIL] Using matched.url for creds lookup: '${matched.url}'`);


  // 2) grab Woo creds from wooConnections cookie
  const credsCookieRaw = req.cookies.get("wooConnections")?.value;
  console.log("[PRODUCT_DETAIL] Raw 'wooConnections' cookie:", credsCookieRaw);
  const credsCookie = decodeURIComponent(credsCookieRaw ?? "[]");
  console.log("[PRODUCT_DETAIL] Decoded 'wooConnections' cookie:", credsCookie);

  let conns: WooEntry[] = [];
  try {
    conns = JSON.parse(credsCookie);
  } catch (e: any) {
    console.error("[PRODUCT_DETAIL] Error parsing 'wooConnections' cookie:", e.message);
    return NextResponse.json({ error: "Invalid wooConnections cookie format" }, { status: 500 });
  }
  console.log("[PRODUCT_DETAIL] Parsed 'wooConnections' from cookie:", conns);
  
  if (conns.length > 0) {
    console.log("[PRODUCT_DETAIL] Available selectedShopUrls in 'wooConnections':");
    conns.forEach(c => console.log(`  - '${c.selectedShopUrl}'`));
  } else {
    console.log("[PRODUCT_DETAIL] 'wooConnections' cookie is empty or contains no entries.");
  }

  const conn = conns.find((c) => c.selectedShopUrl === matched.url);

  if (!conn) {
    console.error(`[PRODUCT_DETAIL] 401 - Missing WooCommerce credentials. No entry in 'wooConnections' with selectedShopUrl === '${matched.url}'.`);
    return NextResponse.json(
      { error: "Missing WooCommerce credentials for shop URL: " + matched.url },
      { status: 401 } // This would be a 401 if it reaches here and fails
    );
  }
  console.log("[PRODUCT_DETAIL] Found WooCommerce credentials:", { consumerKey: conn.consumerKey ? '***' : undefined });

  // 3) normalize + force https://www.
  let raw = matched.url;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const parsed = new URL(raw);
  if (!parsed.hostname.startsWith("www.")) {
    parsed.hostname = `www.${parsed.hostname}`;
  }
  const origin = parsed.origin;
  console.log(`[PRODUCT_DETAIL] Normalized origin for API call: '${origin}'`);

  // 4) build Woo query for the fields we need
  const qs = new URLSearchParams({
    consumer_key:    conn.consumerKey,
    consumer_secret: conn.consumerSecret,
    _fields:
      "id,name,price,average_rating,rating_count,short_description,description,images",
  });
  console.log(`[PRODUCT_DETAIL] WooCommerce product detail query string: ?${qs.toString()}`);

  // 5) fetch the single product
  const wcRes = await fetch(
    `${origin}/wp-json/wc/v3/products/${id}?${qs}`,
    { next: { revalidate: 60 } }
  );
  console.log(`[PRODUCT_DETAIL] WooCommerce product detail API response status: ${wcRes.status}`);

  if (!wcRes.ok) {
    const errorBody = await wcRes.text();
    console.error(`[PRODUCT_DETAIL] WooCommerce product detail API error: ${wcRes.status}`, errorBody);
    return NextResponse.json(
      { error: `WooCommerce returned ${wcRes.status}`, details: errorBody },
      { status: wcRes.status }
    );
  }

  // 6) return the product JSON
  const product = await wcRes.json();
  console.log("[PRODUCT_DETAIL] Request successful. Returning product details.");
  return NextResponse.json(product, { status: 200 });
}
