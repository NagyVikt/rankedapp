// app/dashboard/webshops/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import WebshopCard from "@/components/webshop/WebshopCard";
import { loadShops, saveShops, Shop } from "@/lib/shops";

export default function WebshopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    const s = loadShops();
    setShops(s);

    // mirror into a cookie so our API route can read it
    document.cookie = `my_webshops=${encodeURIComponent(
      JSON.stringify(s)
    )}; path=/;`;
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="grid gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shops.map((shop) => (
          <WebshopCard
            key={shop.url}
            name={shop.name}
            url={shop.url}
            statusApiUrl="/wp-json/webshop/v1/status"
          />
        ))}
      </div>
    </div>
  );
}
