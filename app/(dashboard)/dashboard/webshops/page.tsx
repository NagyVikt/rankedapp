// app/dashboard/webshops/page.tsx (or wherever shops state is managed)
"use client";

import React, { useEffect, useState, useCallback } from "react";
import WebshopCard from "@/components/webshop/WebshopCard";
import { loadShops, saveShops, Shop } from "@/lib/shops";

// Helper to safely extract hostname
function getHostname(url: string): string | null {
  try {
    // Ensure protocol is present for URL constructor
    const fullUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;
    return new URL(fullUrl).hostname;
  } catch (e) {
    console.error(`Invalid URL for hostname extraction: ${url}`, e);
    return null;
  }
}

// Helper to set a cookie
function setCookie(name: string, value: string, days: number = 365) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    // Ensure SameSite=Lax or Strict for modern browsers, and Path=/
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}


export default function WebshopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);

  // Function to update state and cookies together
  const updateShopsAndCookies = useCallback((newShops: Shop[]) => {
    // 1. Update State
    setShops(newShops);

    // 2. Save full shop data (using your existing functions)
    saveShops(newShops);

    // 3. Update the `my_webshops` cookie (as before)
    setCookie('my_webshops', encodeURIComponent(JSON.stringify(newShops)));

    // 4. Create and set the NEW cookie with just hostnames for CSP
    const hostnames = newShops
      .map(shop => getHostname(shop.url)) // Extract hostname
      .filter((hostname): hostname is string => hostname !== null); // Filter out nulls
    const uniqueHostnames = Array.from(new Set(hostnames)); // Ensure uniqueness
    setCookie('shop_hostnames', JSON.stringify(uniqueHostnames)); // Store as JSON array

  }, []); // Add dependencies if `saveShops` or other external things are used


  // Load shops on initial mount
  useEffect(() => {
    const loadedShops = loadShops();
    updateShopsAndCookies(loadedShops); // Use the combined updater
  }, [updateShopsAndCookies]); // Add update function to dependencies

  // Define the handler function to remove a shop
  const handleRemoveShop = useCallback((urlToRemove: string) => {
    const currentShops = loadShops(); // Get fresh list in case state is stale
    const updatedShops = currentShops.filter(shop => shop.url !== urlToRemove);
    updateShopsAndCookies(updatedShops); // Use the combined updater

    // Also remove associated wooConnection if needed (keep this logic)
    const raw = localStorage.getItem("wooConnections");
    if (raw) {
       try {
           let conns: Array<{ selectedShopUrl: string; consumerKey: string; consumerSecret: string }> = JSON.parse(raw);
           conns = conns.filter(c => c.selectedShopUrl !== urlToRemove);
           localStorage.setItem("wooConnections", JSON.stringify(conns));
       } catch (e) {
           console.error("Failed to update wooConnections on shop removal:", e);
       }
    }
  }, [updateShopsAndCookies]); // Add update function to dependencies

  // ... rest of your component ...

  return (
     // ... JSX ...
     <div className="container mx-auto p-4 md:p-8">
     <h1 className="text-2xl font-semibold mb-6">My Webshops</h1>

     {shops.length === 0 ? (
       <div className="text-center text-gray-500 py-10">
          <p>You haven't added any webshops yet.</p>
       </div>
    ) : (
       // --- Apply Grid Layout Classes Here ---
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
       {/*
          - grid:          Enables Grid layout
          - grid-cols-1:   Default to 1 column on smallest screens
          - gap-6:         Sets the spacing between grid items
          - sm:grid-cols-2: On small screens and up (>=640px), use 2 columns
          - lg:grid-cols-3: On large screens and up (>=1024px), use 3 columns
          - xl:grid-cols-4: On extra-large screens and up (>=1280px), use 4 columns
          - auto-rows-fr:  Makes items in the same row stretch to the same height (optional but often looks better)
       */}
        {shops.map((shop) => (
          <WebshopCard
            key={shop.url}
            name={shop.name}
            url={shop.url}
            onRemove={handleRemoveShop} // Pass the handler function as a prop
          />
         ))}
      </div>
       )}
    </div>
     // ... JSX ...
  );
}