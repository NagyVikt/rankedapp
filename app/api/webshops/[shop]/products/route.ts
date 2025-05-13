import { NextRequest, NextResponse } from 'next/server';

// we’re on the Node runtime so fetch + Buffer behave normally
export const runtime = 'nodejs';

interface WooEntry {
  selectedShopUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

// must exactly match your client’s slugify
function slugify(url: string) {
  const slug = url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
  // console.log(`slugify: input='${url}', output='${slug}'`); // Optional: log slugify behavior
  return slug;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string; id: string }> }, // id is not used here, but part of the type from dir structure
): Promise<NextResponse> {
  console.log('\n--- Handling GET /api/webshops/[shop]/products ---');
  // 🚨 you must await params before using them
  const { shop: shopSlug } = await params;
  console.log(`[PRODUCTS_LIST] shopSlug from path: '${shopSlug}'`);

  // pagination + new price‑sort flag
  const page = req.nextUrl.searchParams.get('page') ?? '1';
  const perPage = req.nextUrl.searchParams.get('per_page') ?? '25';
  const sortPrice = req.nextUrl.searchParams.get('sort_price') === '1';
  console.log(
    `[PRODUCTS_LIST] page: ${page}, perPage: ${perPage}, sortPrice: ${sortPrice}`,
  );

  // 1) look up the shop URL from my_webshops cookie
  const shopsCookieRaw = req.cookies.get('my_webshops')?.value;
  console.log("[PRODUCTS_LIST] Raw 'my_webshops' cookie:", shopsCookieRaw);
  const shopsCookie = decodeURIComponent(shopsCookieRaw ?? '[]');
  console.log("[PRODUCTS_LIST] Decoded 'my_webshops' cookie:", shopsCookie);

  let shops: { name: string; url: string }[] = [];
  try {
    shops = JSON.parse(shopsCookie);
  } catch (e: any) {
    console.error(
      "[PRODUCTS_LIST] Error parsing 'my_webshops' cookie:",
      e.message,
    );
    return NextResponse.json(
      { error: 'Invalid my_webshops cookie format' },
      { status: 500 },
    );
  }
  console.log("[PRODUCTS_LIST] Parsed 'shops' from cookie:", shops);

  const matched = shops.find((s) => {
    const currentSlug = slugify(s.url);
    console.log(
      `[PRODUCTS_LIST] Comparing shopSlug '${shopSlug}' with slugified s.url '${s.url}' -> '${currentSlug}'`,
    );
    return currentSlug === shopSlug;
  });

  if (!matched) {
    console.error(
      `[PRODUCTS_LIST] 404 - Unknown shop. No shop found with slug '${shopSlug}' in 'my_webshops'.`,
    );
    return NextResponse.json({ error: 'Unknown shop' }, { status: 404 });
  }
  console.log("[PRODUCTS_LIST] Matched shop from 'my_webshops':", matched);
  console.log(
    `[PRODUCTS_LIST] Using matched.url for creds lookup: '${matched.url}'`,
  );

  // 2) grab your Woo creds from wooConnections cookie
  const credsCookieRaw = req.cookies.get('wooConnections')?.value;
  console.log("[PRODUCTS_LIST] Raw 'wooConnections' cookie:", credsCookieRaw);
  const credsCookie = decodeURIComponent(credsCookieRaw ?? '[]');
  console.log("[PRODUCTS_LIST] Decoded 'wooConnections' cookie:", credsCookie);

  let conns: WooEntry[] = [];
  try {
    conns = JSON.parse(credsCookie);
  } catch (e: any) {
    console.error(
      "[PRODUCTS_LIST] Error parsing 'wooConnections' cookie:",
      e.message,
    );
    return NextResponse.json(
      { error: 'Invalid wooConnections cookie format' },
      { status: 500 },
    );
  }
  console.log("[PRODUCTS_LIST] Parsed 'wooConnections' from cookie:", conns);

  if (conns.length > 0) {
    console.log(
      "[PRODUCTS_LIST] Available selectedShopUrls in 'wooConnections':",
    );
    conns.forEach((c) => console.log(`  - '${c.selectedShopUrl}'`));
  } else {
    console.log(
      "[PRODUCTS_LIST] 'wooConnections' cookie is empty or contains no entries.",
    );
  }

  const conn = conns.find((c) => c.selectedShopUrl === matched.url);

  if (!conn) {
    console.error(
      `[PRODUCTS_LIST] 401 - Missing WooCommerce credentials. No entry in 'wooConnections' with selectedShopUrl === '${matched.url}'.`,
    );
    return NextResponse.json(
      { error: 'Missing WooCommerce credentials for shop URL: ' + matched.url },
      { status: 401 },
    );
  }
  console.log('[PRODUCTS_LIST] Found WooCommerce credentials:', {
    consumerKey: conn.consumerKey ? '***' : undefined,
  }); // Avoid logging secret

  // 3) normalize + force https://www.
  let raw = matched.url;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const parsed = new URL(raw);
  if (!parsed.hostname.startsWith('www.')) {
    parsed.hostname = `www.${parsed.hostname}`;
  }
  const origin = parsed.origin;
  console.log(`[PRODUCTS_LIST] Normalized origin for API call: '${origin}'`);

  // 4) build WooCommerce query
  const qs = new URLSearchParams({
    page,
    per_page: perPage,
    consumer_key: conn.consumerKey,
    consumer_secret: conn.consumerSecret,
    _fields:
      'id,name,price,stock_status,stock_quantity,date_modified,images,meta_data',
  });

  if (sortPrice) {
    qs.set('orderby', 'price');
    qs.set('order', 'asc');
  }
  console.log(
    `[PRODUCTS_LIST] WooCommerce products query string: ?${qs.toString()}`,
  );

  // 5) fetch that one page of products
  const wcRes = await fetch(`${origin}/wp-json/wc/v3/products?${qs}`, {
    next: { revalidate: 120 },
  });
  console.log(
    `[PRODUCTS_LIST] WooCommerce products API response status: ${wcRes.status}`,
  );

  if (!wcRes.ok) {
    const errorBody = await wcRes.text();
    console.error(
      `[PRODUCTS_LIST] WooCommerce products API error: ${wcRes.status}`,
      errorBody,
    );
    return NextResponse.json(
      { error: `WooCommerce returned ${wcRes.status}`, details: errorBody },
      { status: wcRes.status },
    );
  }
  const products = await wcRes.json();
  const totalPages = wcRes.headers.get('X-WP-TotalPages') ?? '1';
  console.log(
    `[PRODUCTS_LIST] Successfully fetched products. Total pages: ${totalPages}`,
  );

  // 6) fetch your store’s general settings to read the currency
  const setQs = new URLSearchParams({
    consumer_key: conn.consumerKey,
    consumer_secret: conn.consumerSecret,
  });
  console.log(
    `[PRODUCTS_LIST] WooCommerce settings query string: ?${setQs.toString()}`,
  );
  const setRes = await fetch(
    `${origin}/wp-json/wc/v3/settings/general?${setQs}`,
    { next: { revalidate: 3600 } },
  );
  console.log(
    `[PRODUCTS_LIST] WooCommerce settings API response status: ${setRes.status}`,
  );

  let currency = 'USD'; // Default currency
  if (setRes.ok) {
    const settings = await setRes.json();
    const currencySetting = settings.find(
      (s: any) => s.id === 'woocommerce_currency',
    )?.value;
    if (currencySetting) {
      currency = currencySetting;
    }
    console.log(`[PRODUCTS_LIST] Fetched currency: ${currency}`);
  } else {
    const errorBody = await setRes.text();
    console.warn(
      `[PRODUCTS_LIST] Failed to fetch WooCommerce settings: ${setRes.status}`,
      errorBody,
    );
    console.warn(
      `[PRODUCTS_LIST] Using default currency ${currency} due to settings fetch error.`,
    );
  }

  // 7) return everything together, exposing the total‑pages header
  console.log(
    '[PRODUCTS_LIST] Request successful. Returning products and currency.',
  );
  return NextResponse.json(
    { products, currency },
    {
      headers: {
        'X-WP-TotalPages': totalPages,
        'Access-Control-Expose-Headers': 'X-WP-TotalPages',
      },
    },
  );
}
