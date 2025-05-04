// components/webshop/WebshopCard.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { CardProps } from "@heroui/react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Spacer,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Utility to slugify a URL (keep as is)
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

// --- Define the props including the ones passed from the parent ---
export interface WebshopCardComponentProps extends CardProps {
  name: string;
  url: string;
  imageUrl?: string | null; // Receive the image URL from parent
  isLoadingImage?: boolean; // Receive loading state from parent
  onRemove: (url: string) => void;
}

export default function WebshopCard({
  name,
  url,
  imageUrl, // Use the prop
  isLoadingImage, // Use the prop
  onRemove,
  ...cardProps
}: WebshopCardComponentProps) {

  // State only needed for Woo connection status
  const [wooSettings, setWooSettings] = useState<{ selectedShopUrl?: string } | null>(null);

  const slug = useMemo(() => slugify(url), [url]);

  // *** REMOVED the useEffect hook that fetched the screenshot here ***
  // The parent component (WebshopsPage) now handles fetching the imageUrl.

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

  // Determine what text to show based on props
  const getLoadingText = () => {
      if (isLoadingImage) return 'Loading preview...';
      if (!imageUrl) return 'Preview not available.'; // Show if loading is false but no URL
      return ''; // No text if loaded or idle without loading
  };

  // Render the card component
  return (
    <Card className="w-full max-w-sm shadow-md rounded-lg overflow-hidden flex flex-col border border-gray-200" {...cardProps}>
      {/* Card Body: Contains the image and text info */}
      <CardBody className="p-0 bg-white flex-grow">
         {/* --- IMAGE AREA --- */}
         <div className="relative h-48 bg-gray-100 rounded-t">
           {/* Display Image if imageUrl is available */}
           {imageUrl ? (
             <img
               src={imageUrl}
               alt={`${name} front page screenshot`}
               // Apply Tailwind classes for styling and object-fit
               className="absolute inset-0 w-full h-full object-cover object-top rounded-t"
             />
           ) : (
             // Show loading/placeholder text if no imageUrl or if loading
             <div className="absolute inset-0 flex items-center justify-center h-full">
               <span className="text-gray-400 px-4 text-center text-sm">
                 {getLoadingText()}
               </span>
             </div>
           )}
         </div>
         {/* --- END IMAGE AREA --- */}

        {/* Spacer and Text Info */}
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
