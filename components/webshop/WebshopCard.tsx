// components/webshop/WebshopCard.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { CardProps } from '@heroui/react';
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Spacer,
  Image, // Using Image component for consistency if needed, or simple img tag
} from '@heroui/react';
import { Icon } from '@iconify/react';

// Utility to slugify a URL (keep as is)
function slugify(url: string): string {
  if (typeof url !== 'string') {
    console.error('slugify received non-string input:', url);
    return '';
  }
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9\-]+/g, '-')
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
  imageUrl,
  isLoadingImage,
  onRemove,
  ...cardProps
}: WebshopCardComponentProps) {
  const [wooSettings, setWooSettings] = useState<{
    selectedShopUrl?: string;
  } | null>(null);
  const slug = useMemo(() => slugify(url), [url]);

  // Effect to load WooCommerce connection status (remains the same)
  useEffect(() => {
    let isMounted = true;
    const raw = localStorage.getItem('wooConnections');
    if (raw) {
      try {
        const conns: Array<{
          selectedShopUrl: string;
          consumerKey: string;
          consumerSecret: string;
        }> = JSON.parse(raw);
        if (isMounted) {
          if (conns.find((c) => c.selectedShopUrl === url)) {
            setWooSettings({ selectedShopUrl: url });
          } else {
            setWooSettings(null);
          }
        }
      } catch (e) {
        if (isMounted) {
          console.error('[Effect Woo] Error parsing wooConnections:', e);
          setWooSettings(null);
        }
      }
    } else {
      if (isMounted) {
        setWooSettings(null);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [url]);

  const isWooConnected = wooSettings?.selectedShopUrl === url;

  const handleRemoveClick = () => {
    if (
      window.confirm(`Are you sure you want to remove the webshop "${name}"?`)
    ) {
      onRemove(url);
    }
  };

  const getLoadingText = () => {
    if (isLoadingImage) return 'Loading preview...';
    if (!imageUrl) return 'Preview not available.';
    return '';
  };

  // Render the card component using HeroUI styles primarily
  return (
    // Rely on HeroUI default Card styling, add necessary layout/sizing
    <Card className="w-full max-w-sm flex flex-col" {...cardProps}>
      {/* Card Body: Contains the image and text info */}
      {/* Use default CardBody padding or specify if needed */}
      <CardBody className="p-0 flex-grow">
        {' '}
        {/* Resetting padding, relying on inner divs */}
        {/* --- IMAGE AREA --- */}
        {/* Using a simple div for background placeholder */}
        <div className="relative h-48 bg-gray-100">
          {' '}
          {/* Light placeholder background */}
          {imageUrl ? (
            // Use HeroUI Image component or standard img
            <Image
              removeWrapper // Optional: removes the extra div HeroUI Image might add
              src={imageUrl}
              alt={`${name} front page screenshot`}
              className="absolute inset-0 w-full h-full object-cover object-top" // Tailwind for positioning/fit
            />
          ) : (
            /* Alternative: Standard img tag
             <img
               src={imageUrl}
               alt={`${name} front page screenshot`}
               className="absolute inset-0 w-full h-full object-cover object-top"
             />
             */
            // Show loading/placeholder text if no imageUrl or if loading
            <div className="absolute inset-0 flex items-center justify-center h-full">
              {/* Using text-default-500 might align with HeroUI's theme scale */}
              <span className="text-default-500 px-4 text-center text-sm">
                {getLoadingText()}
              </span>
            </div>
          )}
        </div>
        {/* --- END IMAGE AREA --- */}
        {/* Spacer and Text Info - Add padding here */}
        <div className="p-3">
          <Spacer y={2} />
          {/* Using standard text styling, consider HeroUI Text component if available/needed */}
          <div className="flex flex-col gap-1 px-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              // Using common Tailwind text classes, assuming HeroUI doesn't override heavily
              className="text-lg font-semibold text-foreground hover:underline truncate"
              title={name}
            >
              {name}
            </a>
            <p className="text-sm text-foreground-500 truncate" title={url}>
              {' '}
              {/* text-foreground-xxx is common in NextUI/HeroUI themes */}
              {url.replace(/^https?:\/\//, '')}
            </p>
          </div>
        </div>
      </CardBody>

      {/* Card Footer - Rely on HeroUI Footer styling, add layout classes */}
      <CardFooter className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 border-t border-divider">
        {/* Woo status pill - Basic Tailwind styling for the pill itself */}
        <div className="flex items-center space-x-2 px-3 py-1 border border-divider rounded-full text-xs">
          <span
            className={`h-2 w-2 rounded-full ${isWooConnected ? 'bg-success' : 'bg-danger'}`} // Using semantic colors if defined in HeroUI/Tailwind config
            title={
              isWooConnected
                ? 'WooCommerce Connected'
                : 'WooCommerce Plugin/Connection Missing'
            }
          />
          {/* Using semantic text colors */}
          <span className="font-medium text-foreground-700">
            {isWooConnected ? 'Woo Connected' : 'Woocommerce API Missing'}
          </span>
        </div>

        {/* Woo status pill - Basic Tailwind styling for the pill itself */}
        <div className="flex items-center space-x-2 px-3 py-1 border border-divider rounded-full text-xs">
          <span
            className={`h-2 w-2 rounded-full ${isWooConnected ? 'bg-danger' : 'bg-success'}`} // Using semantic colors if defined in HeroUI/Tailwind config
            title={
              isWooConnected
                ? 'WooCommerce Connected'
                : 'WooCommerce Plugin/Connection Missing'
            }
          />
          {/* Using semantic text colors */}
          <span className="font-medium text-foreground-700">
            {isWooConnected ? 'PLugin Connected' : 'Plugin Missing'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/webshops/${slug}/products`}>
            {/* Use Button variant="light" for subtle styling */}
            <Button
              size="sm"
              variant="light" // Use HeroUI light variant
              className="flex items-center space-x-1" // Add layout class
              aria-label={`View products for ${name}`}
            >
              <Icon icon="mdi:tag-outline" width={16} />
              <span className="text-xs">Products</span>
            </Button>
          </Link>
          {/* Use Button variant="light" and color="danger" */}
          <Button
            size="sm"
            variant="light" // Use light variant for less emphasis
            color="danger" // Use HeroUI danger color semantic
            className="flex items-center space-x-1" // Add layout class
            onClick={handleRemoveClick}
            aria-label={`Remove webshop ${name}`}
          >
            <Icon icon="mdi:trash-can-outline" width={16} />
            <span className="text-xs">Remove</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
