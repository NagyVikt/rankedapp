// lib/shops.ts
export interface Shop {
    name: string;
    url: string;
  }
  
  // your “static” shops key
  const STORAGE_KEY = "my_webshops";
  
  // the key you’re already using for Woo connections
  const WOO_KEY = "wooConnections";
  
  /**
   * Turn a URL into a human‑friendly name.
   * You can swap this out to fetch the WP site title,
   * or just leave it as the hostname.
   */
  function guessNameFromUrl(u: string) {
    try {
      return new URL(u).hostname;
    } catch {
      return u;
    }
  }
  
  export function loadShops(): Shop[] {
    // 1) load your “core” list (whatever you’ve been saving manually)
    let saved: Shop[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      saved = [];
    }
  
    // 2) pull in every Woo connection’s URL as its own Shop
    let woo: { selectedShopUrl: string }[] = [];
    try {
      const all = JSON.parse(localStorage.getItem(WOO_KEY) || "[]");
      woo = Array.isArray(all) ? all : [];
    } catch {
      woo = [];
    }
    const dynamic: Shop[] = woo.map((c) => ({
      url: c.selectedShopUrl,
      name: guessNameFromUrl(c.selectedShopUrl),
    }));
  
    // 3) merge + dedupe (later entries win)
    const merged = [...saved, ...dynamic];
    const deduped = Array.from(
      new Map(merged.map((s) => [s.url, s])).values()
    );
  
    return deduped;
  }
  
  export function saveShops(shops: Shop[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
  }
  