// components/webshop/WebshopCard.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { CardProps } from "@heroui/react";
import {
  Card,
  Image,
  CardBody,
  CardFooter,
  Button,
  Spacer,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Utility to slugify a URL into a filesystem‐safe segment
function slugify(url: string): string {
  if (typeof url !== 'string') {
    console.error('slugify received non-string input:', url);
    return '';
  }
  return url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9\-]+/g, "-")
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// Define the props including the new onRemove callback
export interface WebshopCardComponentProps extends CardProps {
  name: string;
  url: string;
  onRemove: (url: string) => void;
}

// Define possible statuses for image loading
type ImageStatus = 'idle' | 'checking' | 'generating' | 'loaded' | 'error' | 'notFound';

export default function WebshopCard({
  name,
  url,
  onRemove,
  ...cardProps
}: WebshopCardComponentProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Use null initially
  const [imageStatus, setImageStatus] = useState<ImageStatus>('idle');
  const [wooSettings, setWooSettings] = useState<{ selectedShopUrl?: string } | null>(null);

  const slug = useMemo(() => slugify(url), [url]);
  const expectedImagePath = useMemo(() => slug ? `/images/screenshots/${slug}.png` : null, [slug]);
  const apiEndpoint = useMemo(() => process.env.NEXT_PUBLIC_SCREENSHOT_ENDPOINT || "/api/screenshot", []);

  // Function to generate the screenshot via API
  const generateScreenshot = useCallback(async () => {
    if (!url || !expectedImagePath || imageStatus === 'generating') return;

    console.log(`Calling screenshot generation API for: ${url}`);
    setImageStatus('generating');

    try {
      const fetchUrl = `${apiEndpoint}?url=${encodeURIComponent(url)}`;
      // Use GET method to trigger generation/saving
      const res = await fetch(fetchUrl, { method: 'GET' });

      if (res.ok) { // Status 200 (already existed) or 201 (created)
        const data = await res.json();
        console.log(`Screenshot API success for ${url}: ${data.message}`);
        // Set the image source to the expected path (add timestamp to force refresh)
        setImageSrc(expectedImagePath + `?t=${Date.now()}`);
        setImageStatus('loaded'); // Assume loaded after successful generation/check
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Screenshot generation API failed for ${url} with status: ${res.status} ${res.statusText}`, errorData);
        setImageStatus('error');
        setImageSrc(null);
      }
    } catch (e) {
      console.error(`Screenshot generation API fetch exception for ${url}:`, e);
      setImageStatus('error');
      setImageSrc(null);
    }
  }, [url, expectedImagePath, imageStatus, apiEndpoint]);

  // Effect to check for existing image or trigger generation
  useEffect(() => {
    let isMounted = true;
    if (!expectedImagePath || imageStatus !== 'idle') {
        if (!expectedImagePath) {
            console.warn(`Could not generate expected image path for URL: ${url}`);
            setImageStatus('notFound');
        }
        return; // Only run check when idle and path is valid
    }

    const checkImageExistence = async () => {
        console.log(`Checking image existence for: ${url} at ${expectedImagePath}`);
        setImageStatus('checking');
        try {
            // Use HEAD request to check if the file exists via the API route
            const checkUrl = `${apiEndpoint}?url=${encodeURIComponent(url)}`;
            const res = await fetch(checkUrl, { method: 'HEAD' });

            if (!isMounted) return; // Exit if component unmounted during fetch

            if (res.ok) { // Status 200 OK - file exists
                console.log(`Screenshot found for ${url}. Setting image source.`);
                setImageSrc(expectedImagePath); // Set src to the known path
                setImageStatus('loaded');
            } else if (res.status === 404) { // Status 404 Not Found - file doesn't exist
                console.log(`Screenshot not found for ${url}. Triggering generation.`);
                generateScreenshot(); // Call the function to generate it
            } else { // Other error during check
                console.error(`Screenshot check failed for ${url} with status: ${res.status} ${res.statusText}`);
                setImageStatus('error');
                setImageSrc(null);
            }
        } catch (e) {
            if (!isMounted) return;
            console.error(`Screenshot check exception for ${url}:`, e);
            setImageStatus('error');
            setImageSrc(null);
        }
    };

    checkImageExistence();

    return () => { isMounted = false }; // Cleanup flag

  }, [url, expectedImagePath, generateScreenshot, imageStatus, apiEndpoint]); // Dependencies

  // Effect to load WooCommerce connection status (remains the same)
  useEffect(() => {
     console.log(`Checking WooConnections for: ${url}`);
     const raw = localStorage.getItem("wooConnections");
     if (raw) {
       try {
         const conns: Array<{ selectedShopUrl: string; consumerKey: string; consumerSecret: string }> = JSON.parse(raw);
         if (conns.find((c) => c.selectedShopUrl === url)) {
           setWooSettings({ selectedShopUrl: url });
           console.log(`Woo connection found for: ${url}`);
         } else {
           setWooSettings(null);
           console.log(`No Woo connection found for: ${url}`);
         }
       } catch (e) {
           console.error("Error parsing wooConnections:", e);
           setWooSettings(null);
       }
     } else {
         console.log("No 'wooConnections' found in localStorage.");
         setWooSettings(null);
     }
   }, [url]);

  const isWooConnected = wooSettings?.selectedShopUrl === url;

  // Handler for the remove button click (remains the same)
  const handleRemoveClick = () => {
    if (window.confirm(`Are you sure you want to remove the webshop "${name}"?`)) {
      onRemove(url);
    }
  };

  // Determine what text to show in the loading/error state
  const getLoadingText = () => {
      switch (imageStatus) {
          case 'checking': return 'Loading preview...';
          case 'generating': return 'Generating preview...';
          case 'error': return 'Failed to load preview.';
          case 'notFound': return 'No preview available.';
          case 'idle': return ''; // Should not be in idle state long
          default: return 'Loading preview...'; // Fallback
      }
  };

  // Render the card component
  return (
    <Card className="w-full max-w-sm shadow-md rounded-lg overflow-hidden flex flex-col border border-gray-200" {...cardProps}>
      {/* Card Body: Contains the image and text info */}
      <CardBody className="p-0 bg-white flex-grow">
         {/* --- IMAGE AREA --- */}
         <div className="relative h-48 bg-gray-100 rounded-t">
           {/* Display loading/error state text when not loaded */}
           {imageStatus !== 'loaded' && (
             <div className="absolute inset-0 flex items-center justify-center h-full">
               <span className="text-gray-400 px-4 text-center text-sm">
                 {getLoadingText()}
               </span>
             </div>
           )}
           {/* Render Image only when src is set and status indicates loading/loaded */}
           {imageSrc && (imageStatus === 'loaded' || imageStatus === 'generating' || imageStatus === 'checking') && (
               <Image
                 key={imageSrc} // Force re-render if src changes (e.g., timestamp added)
                 alt={imageStatus === 'loaded' ? `${name} front page screenshot` : ''}
                 className={`absolute inset-0 aspect-video w-full h-full object-cover object-top rounded-t transition-opacity duration-300 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`} // Fade in
                 src={imageSrc}
                 // No onLoad/onError needed here anymore as logic is handled before setting src
               />
           )}
         </div>
         {/* --- END IMAGE AREA --- */}

        {/* Spacer and Text Info (remains the same) */}
        <div className="p-3">
            <Spacer y={2} />
            <div className="flex flex-col gap-1 px-2">
              <a
                href={url} target="_blank" rel="noopener noreferrer"
                className="text-lg font-semibold text-gray-800 hover:underline truncate" title={name}
              > {name} </a>
              <p className="text-sm text-gray-500 truncate" title={url}>
                {url.replace(/^https?:\/\//, "")}
              </p>
            </div>
        </div>
      </CardBody>

      {/* Card Footer (remains the same) */}
      <CardFooter className="flex flex-wrap justify-between items-center bg-gray-50 px-4 py-3 border-t border-gray-200 gap-2">
        {/* Woo status pill */}
        <div className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-full text-xs">
          <span
            className={`h-2 w-2 rounded-full ${isWooConnected ? "bg-green-500" : "bg-red-500"}`}
            title={isWooConnected ? "WooCommerce Connected" : "WooCommerce Plugin/Connection Missing"}
          />
          <span className="font-medium text-gray-700">
            {isWooConnected ? "Woo Connected" : "Plugin Missing"}
          </span>
        </div>
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/webshops/${slug}/products`}>
            <Button size="sm" variant="light" className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100" aria-label={`View products for ${name}`}>
              <Icon icon="mdi:tag-outline" width={16} className="text-gray-600" />
              <span className="text-xs text-gray-700">Products</span>
            </Button>
          </Link>
          <Button size="sm" variant="light" color="danger" className="flex items-center space-x-1 px-3 py-1 border border-red-300 rounded hover:bg-red-50 text-red-600" onClick={handleRemoveClick} aria-label={`Remove webshop ${name}`}>
            <Icon icon="mdi:trash-can-outline" width={16} />
            <span className="text-xs">Remove</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
