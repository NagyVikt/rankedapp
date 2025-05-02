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
  useEffect(() => {
    let isMounted = true
    let currentObjectUrl: string | null = null
  
    async function checkAndLoad() {
      console.log(`[Effect Check] Generating screenshot for: ${url}`)
      setImageStatus("generating")
  
      try {
        // 1) call your screenshot API
        const apiUrl = `${apiEndpoint}?url=${encodeURIComponent(url)}`
        const res = await fetch(apiUrl, { method: "GET" })
        if (!isMounted) return
  
        if (!res.ok) {
          const errText = await res.text().catch(() => "")
          console.error(
            `[Effect Check] Screenshot API error for ${url}:`,
            res.status, res.statusText, errText
          )
          setImageStatus("error")
          setImageSrc(null)
          return
        }
  
        // 2) stream PNG → blob URL
        // 2) figure out what we got back
        const contentType = res.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
          // already-existing case: parse out the public path
          const data: { message: string; path: string } = await res.json()
          console.log(`[Effect Check] Screenshot exists at public path:`, data.path)
          setImageSrc(data.path)            // use the public URL instead of blob
          setImageStatus("loaded")
        } else {
          // new‐capture case: stream PNG → blob URL
          const blob = await res.blob()
          const objectUrl = URL.createObjectURL(blob)
          currentObjectUrl = objectUrl
          console.log(`[Effect Check] Screenshot blob ready for ${url}:`, objectUrl)
          setImageSrc(objectUrl)
          setImageStatus("loaded")
        }


      
    }  catch (error) {
        console.error(`[Effect Check] Error generating screenshot for ${url}:`, error)
        setImageStatus("error")
        setImageSrc(null)
      }
    }
    checkAndLoad()
  
    return () => {
      isMounted = false
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
    }
  }, [url, apiEndpoint])  // <— *exactly* these two, same order, same length
  
  

  // Effect to load WooCommerce connection status (remains the same)
  useEffect(() => {
     let isMounted = true;
     console.log(`[Effect Woo] Checking WooConnections for: ${url}`);
     const raw = localStorage.getItem("wooConnections");
     if (raw) {
       try {
         const conns: Array<{ selectedShopUrl: string; consumerKey: string; consumerSecret: string }> = JSON.parse(raw);
         if (isMounted) {
             if (conns.find((c) => c.selectedShopUrl === url)) {
               setWooSettings({ selectedShopUrl: url });
               console.log(`[Effect Woo] Woo connection found for: ${url}`);
             } else {
               setWooSettings(null);
               console.log(`[Effect Woo] No Woo connection found for: ${url}`);
             }
         }
       } catch (e) {
           if (isMounted) {
               console.error("[Effect Woo] Error parsing wooConnections:", e);
               setWooSettings(null);
           }
       }
     } else {
         if (isMounted) {
             console.log("[Effect Woo] No 'wooConnections' found in localStorage.");
             setWooSettings(null);
         }
     }
     return () => { isMounted = false; };
   }, [url]); // Only depends on URL

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
          case 'idle': return '';
          case 'loaded': return ''; // Don't show text when loaded
          default: return 'Loading...'; // Fallback
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
           {/* Render Image only when src is set */}
         {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${name} front page screenshot`}
          className={`absolute inset-0 aspect-video w-full h-full object-cover object-top rounded-t transition-opacity duration-300 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={()   => setImageStatus('loaded')}
          onError={()  => {
            console.error(`Failed to render blob image: ${imageSrc}`);
            setImageStatus('error');
            setImageSrc(null);
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center h-full">
          <span className="text-gray-400 px-4 text-center text-sm">
            {getLoadingText()}
          </span>
        </div>
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
            {isWooConnected ? "Woo Connected" : "Woocommerce API Missing"}
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
