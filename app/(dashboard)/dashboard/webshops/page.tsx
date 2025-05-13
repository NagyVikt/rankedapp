// app/dashboard/webshops/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import WebshopCard from '@/components/webshop/WebshopCard'; // Assuming this component exists
import { loadShops, saveShops, Shop } from '@/lib/shops'; // Assuming these exist

// --- Define Shop type with optional imageUrl ---
interface ShopWithImage extends Shop {
  imageUrl?: string | null; // Can be string (URL), null (not loaded/error), or undefined (initial)
  isLoadingImage?: boolean; // To show a loading state
}

// Helper to safely extract hostname (keep as is)
function getHostname(url: string): string | null {
  try {
    const fullUrl =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;
    return new URL(fullUrl).hostname;
  } catch (e) {
    console.error(`Invalid URL for hostname extraction: ${url}`, e);
    return null;
  }
}

// Helper to set a cookie (keep as is)
function setCookie(name: string, value: string, days: number = 365) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie =
    name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
}

export default function WebshopsPage() {
  // Use the extended Shop type for state
  const [shops, setShops] = useState<ShopWithImage[]>([]);
  // State to track if the initial image fetch is in progress
  const [isFetchingImages, setIsFetchingImages] = useState<boolean>(false);

  // --- Function to fetch screenshot URL for a single shop ---
  const fetchScreenshotUrl = useCallback(
    async (shopUrl: string): Promise<string | null> => {
      try {
        const endpoint =
          process.env.NEXT_PUBLIC_SCREENSHOT_ENDPOINT || '/api/screenshot';
        const response = await fetch(
          `${endpoint}?url=${encodeURIComponent(shopUrl)}`,
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch screenshot for ${shopUrl}: ${response.statusText}`,
          );
          return null;
        }
        const data = await response.json();
        return data.imageUrl || null;
      } catch (error) {
        console.error(`Error fetching screenshot for ${shopUrl}:`, error);
        return null;
      }
    },
    [],
  );

  // --- Function to update state and cookies ---
  const updateShopsAndCookies = useCallback((newShopsData: Shop[]) => {
    const shopsWithInitialState = newShopsData.map((shop) => ({
      ...shop,
      imageUrl: undefined,
      isLoadingImage: true, // Set initial loading state to true
    }));
    setShops(shopsWithInitialState);
    saveShops(newShopsData);
    setCookie('my_webshops', encodeURIComponent(JSON.stringify(newShopsData)));
    const hostnames = newShopsData
      .map((shop) => getHostname(shop.url))
      .filter((hostname): hostname is string => hostname !== null);
    const uniqueHostnames = Array.from(new Set(hostnames));
    setCookie('shop_hostnames', JSON.stringify(uniqueHostnames));
  }, []); // Removed saveShops from deps assuming it's stable

  // --- Load shops on initial mount ---
  useEffect(() => {
    const loadedShops = loadShops();
    updateShopsAndCookies(loadedShops);
  }, [updateShopsAndCookies]);

  // --- *** REFACTORED Effect to fetch images *** ---
  useEffect(() => {
    // Check if there are shops and if we are not already fetching
    const shopsToFetch = shops.filter((s) => s.imageUrl === undefined);

    if (shopsToFetch.length > 0 && !isFetchingImages) {
      setIsFetchingImages(true); // Mark as fetching
      console.log(`Fetching images for ${shopsToFetch.length} shops...`);

      // Create an array of promises for fetching URLs
      const fetchPromises = shopsToFetch.map((shop) =>
        fetchScreenshotUrl(shop.url).then((imageUrl) => ({
          url: shop.url, // Keep track of which URL this result belongs to
          imageUrl: imageUrl,
        })),
      );

      // Wait for all fetches to complete
      Promise.all(fetchPromises)
        .then((results) => {
          console.log('Image fetch complete. Results:', results);
          // Create a map for easy lookup of fetched URLs
          const imageUrlMap = new Map<string, string | null>();
          results.forEach((result) => {
            imageUrlMap.set(result.url, result.imageUrl);
          });

          // Update the state ONCE with all the fetched URLs
          setShops((currentShops) =>
            currentShops.map((shop) => {
              // Only update if the URL was part of this fetch batch
              if (imageUrlMap.has(shop.url)) {
                return {
                  ...shop,
                  imageUrl: imageUrlMap.get(shop.url), // Get the fetched URL (or null)
                  isLoadingImage: false, // Set loading to false
                };
              }
              // If the shop wasn't part of this fetch batch, return it as is
              // (handles cases where some images were already loaded)
              return shop.isLoadingImage
                ? { ...shop, isLoadingImage: false }
                : shop;
            }),
          );
        })
        .catch((error) => {
          console.error('Error during Promise.all for image fetching:', error);
          // Optionally reset loading state for all shops on error
          setShops((currentShops) =>
            currentShops.map((shop) => ({ ...shop, isLoadingImage: false })),
          );
        })
        .finally(() => {
          setIsFetchingImages(false); // Reset fetching flag regardless of success/error
        });
    }
    // Dependency: Only re-run if the *initial* shops array structure changes (e.g., on load or removal)
    // OR if fetchScreenshotUrl changes (unlikely with useCallback).
    // We add isFetchingImages to prevent re-triggering while fetches are in progress.
  }, [shops, fetchScreenshotUrl, isFetchingImages]);

  // --- Handler function to remove a shop ---
  const handleRemoveShop = useCallback(
    (urlToRemove: string) => {
      const currentShops = loadShops();
      const updatedShops = currentShops.filter(
        (shop) => shop.url !== urlToRemove,
      );
      updateShopsAndCookies(updatedShops); // This will trigger the image fetch effect if needed

      const raw = localStorage.getItem('wooConnections');
      if (raw) {
        try {
          let conns: Array<{
            selectedShopUrl: string;
            consumerKey: string;
            consumerSecret: string;
          }> = JSON.parse(raw);
          conns = conns.filter((c) => c.selectedShopUrl !== urlToRemove);
          localStorage.setItem('wooConnections', JSON.stringify(conns));
        } catch (e) {
          console.error('Failed to update wooConnections on shop removal:', e);
        }
      }
    },
    [updateShopsAndCookies],
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-6">My Webshops</h1>

      {shops.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>You haven't added any webshops yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
          {shops.map((shop) => (
            <WebshopCard
              key={shop.url}
              name={shop.name}
              url={shop.url}
              // Pass imageUrl (could be string, null, or undefined initially)
              imageUrl={shop.imageUrl}
              // Pass loading state - card should handle undefined imageUrl + isLoadingImage=true
              isLoadingImage={shop.isLoadingImage}
              onRemove={handleRemoveShop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
