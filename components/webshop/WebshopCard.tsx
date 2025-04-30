// components/webshop/WebshopCard.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
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
function slugify(url: string) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

// Define the props including the new onRemove callback
export interface WebshopCardComponentProps extends CardProps {
  name: string;
  url: string;
  onRemove: (url: string) => void; // Add the onRemove prop type
}

export default function WebshopCard({
  name,
  url,
  onRemove, // Destructure the new prop
  ...cardProps
}: WebshopCardComponentProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [wooSettings, setWooSettings] = useState<{ selectedShopUrl?: string } | null>(null);

  // derive this shop’s “slug” once
  const slug = useMemo(() => slugify(url), [url]);

  useEffect(() => {
    // 1) screenshot
    let isMounted = true; // Flag to prevent state update on unmounted component
    let currentObjectUrl: string | null = null; // Keep track of the created URL

    (async () => {
      setLoading(true);
      try {
        const ep = process.env.NEXT_PUBLIC_SCREENSHOT_ENDPOINT || "/api/screenshot";
        const res = await fetch(`${ep}?url=${encodeURIComponent(url)}`);
        if (res.ok && isMounted) {
          const blob = await res.blob();
          // Revoke previous URL if exists before creating a new one
          if (currentObjectUrl) {
              URL.revokeObjectURL(currentObjectUrl);
          }
          currentObjectUrl = URL.createObjectURL(blob);
          setImageSrc(currentObjectUrl);
        } else if (!res.ok) {
           // Handle fetch error explicitly if needed
           console.error(`Screenshot fetch failed with status: ${res.status}`);
           if (isMounted) setImageSrc(""); // Clear image src on error
        }
      } catch (e) {
        console.error("Screenshot fetch error:", e);
         if (isMounted) setImageSrc(""); // Clear image src on error
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    // Cleanup function to revoke object URL and set mount flag
    return () => {
        isMounted = false;
        // Revoke the URL when component unmounts or URL changes
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
        }
    };
  }, [url]); // Only re-run when URL changes

  useEffect(() => {
     // 2) load woo link
     const raw = localStorage.getItem("wooConnections");
     if (raw) {
       try {
         const conns: Array<{ selectedShopUrl: string; consumerKey: string; consumerSecret: string }> = JSON.parse(raw);
         if (conns.find((c) => c.selectedShopUrl === url)) {
           setWooSettings({ selectedShopUrl: url });
         } else {
           setWooSettings(null);
         }
       } catch (e) {
           console.error("Error parsing wooConnections:", e);
           setWooSettings(null);
       }
     } else {
         setWooSettings(null);
     }
   }, [url]); // Depend only on url

  const isWooConnected = wooSettings?.selectedShopUrl === url;

  const handleRemoveClick = () => {
    if (window.confirm(`Are you sure you want to remove the webshop "${name}"?`)) {
      onRemove(url);
    }
  };

  return (
    // Keep the flex structure for the overall card if needed for footer positioning
    <Card className="w-full max-w-sm shadow-md rounded-lg overflow-hidden flex flex-col" {...cardProps}>
      {/* Revert Image rendering part to original structure */}
      <CardBody className="p-0 bg-white flex-grow"> {/* Adjusted padding maybe needed */}
         {/* === IMAGE AREA START (Using Original Structure) === */}
         <div className="relative"> {/* Simple relative container */}
           {loading || !imageSrc ? (
             <div className="flex items-center justify-center h-48 bg-gray-100 rounded-t"> {/* Centering div with background */}
               <span className="text-gray-400 px-4 text-center"> {/* Added padding/centering */}
                 {loading ? "Loading preview…" : "No preview available"}
               </span>
             </div>
           ) : (
             <Image
               alt={`${name} front page`}
               // Using original classes for correct aspect ratio and display
               className="aspect-video w-full object-cover object-top rounded-t"
               src={imageSrc}
             />
           )}
         </div>
         {/* === IMAGE AREA END === */}

        {/* Spacer and Text Info */}
        <div className="p-3"> {/* Add padding back here for text content */}
            <Spacer y={2} />
            <div className="flex flex-col gap-1 px-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-black hover:underline truncate"
                 title={name}
              >
                {name}
              </a>
              <p className="text-sm text-gray-500 truncate" title={url}>
                {url}
              </p>
            </div>
        </div>
      </CardBody>

      {/* Footer remains the same */}
      <CardFooter className="flex flex-wrap justify-between items-center bg-white px-4 py-3 border-t border-gray-200 gap-2">
        {/* 1) Woo status pill */}
        <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded">
          <span
            className={`h-2 w-2 rounded-full ${
              isWooConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {isWooConnected ? "Woo Connected" : "Plugin Missing"}
          </span>
        </div>

        {/* 2) Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/webshops/${slug}/products`}>
            <Button
              variant="light"
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              aria-label={`View products for ${name}`}
            >
              <Icon icon="mdi:tag-outline" width={18} className="text-gray-600" />
              <span className="text-sm text-gray-700">Products</span>
            </Button>
          </Link>
          <Button
            variant="light"
            color="danger"
            className="flex items-center space-x-2 px-3 py-2 border border-red-300 rounded hover:bg-red-50 text-red-600"
            onClick={handleRemoveClick}
            aria-label={`Remove webshop ${name}`}
          >
            <Icon icon="mdi:trash-can-outline" width={18} />
            <span className="text-sm">Remove</span>
          </Button>
        </div>

        {/* 3) Credit usage */}
        <div className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded">
          <Icon icon="mdi:star-circle-outline" width={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Credit used: 400</span>
        </div>
      </CardFooter>
    </Card>
  );
}