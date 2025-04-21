// components/products/product-view-item.tsx
"use client";

import React, { useState, useEffect, forwardRef } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Chip,
  Image,
  RadioGroup,
  ScrollShadow,
} from "@heroui/react"; // Assuming these imports are correct for your setup
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react"; // Assuming cn utility is available

// Assuming these components exist and work as expected
import ColorRadioItem from "./color-radio-item";
import RatingRadioGroup from "./rating-radio-group";

// Type definition for color options
export type ProductViewItemColor = {
  name: string;
  hex: string;
};

// Interface defining the props for the component
export interface ProductViewItemProps {
  id: string;
  name: string; // Name is still passed but not displayed as H1 by default now
  description?: string;      // HTML content for short description
  longDescription?: string;  // HTML content for long description
  images: string[];          // Array of image URLs
  price: number;             // Product price
  rating?: number;           // Average rating
  ratingCount?: number;      // Number of ratings
  sizes?: string[];          // Available sizes (currently unused in layout)
  isPopular?: boolean;       // Flag for popular products
  details?: { title: string; items: string[] }[]; // Accordion details
  availableColors?: ProductViewItemColor[];       // Color options
  seoScore?: number;         // SEO score for the footer chip
  className?: string;        // Optional additional class names
}

/**
 * ProductViewInfo Component
 * Displays product details including gallery, info, descriptions, and a sticky action footer.
 * Designed to be used within a scrollable container (like a modal/popup).
 */
const ProductViewInfo = forwardRef<HTMLDivElement, ProductViewItemProps>(
  (
    {
      name,
      images,
      price,
      rating = 0,
      ratingCount = 0,
      description,
      longDescription,
      availableColors = [],
      details = [],
      isPopular = false,
      seoScore,
      className,
      // sizes prop is destructured but not used in the current layout
    },
    ref
  ) => {
    // --- State ---
    const placeholderImage = "/placeholder-image.png"; // Define a default placeholder image path
    // Ensure images is a valid array, defaulting to placeholder if empty/invalid
    const validImages = Array.isArray(images) && images.length > 0 ? images : [placeholderImage];
    // State for the currently selected main image
    const [selectedImage, setSelectedImage] = useState(validImages[0]);

    // --- Effects ---
    // Effect to update the selected image if the `images` prop changes
    // and the currently selected image is no longer valid.
    useEffect(() => {
      const currentValidImages = Array.isArray(images) && images.length > 0 ? images : [placeholderImage];
      if (!currentValidImages.includes(selectedImage)) {
        setSelectedImage(currentValidImages[0]);
      }
    }, [images, selectedImage, placeholderImage]); // Dependencies for the effect

    // --- Render ---
    return (
      // Main container: Full height flex column to manage layout and sticky footer
      <div
        ref={ref}
        className={cn(
          "relative flex h-full flex-col", // Use flex-col and h-full for sticky footer parent
          className
        )}
      >
        {/* Scrollable Content Area: Takes up available space */}
        <div className="flex-grow overflow-y-auto">
          {/* Grid Layout: Defines columns for gallery and info */}
          <div className={cn(
              "grid grid-cols-1 gap-4 p-1", // Base grid layout and small padding
              "lg:grid-cols-2 lg:items-start lg:gap-x-4" // 2-column layout on large screens with reduced gap
             )}
          >
            {/* ─── Gallery Column ────────────────────────── */}
            {/* Sticky on large screens for better UX */}
            <div className="relative h-full w-full flex-none lg:sticky lg:top-4">
              {/* Popular Chip */}
              {isPopular && (
                <Chip
                  size="lg"
                  startContent={<Icon icon="solar:star-bold" />}
                  className="absolute left-3 top-3 z-10 h-10 gap-1 bg-background/60 pl-3 pr-2 text-foreground/90 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
                >
                  Popular
                </Chip>
              )}
              {/* Main Image */}
              <Image
                removeWrapper // Assuming this prop removes default wrapper elements
                alt={name} // Use product name for alt text
                src={selectedImage}
                className="aspect-square w-full max-w-xl rounded-lg object-cover" // Consistent aspect ratio
                // Add error handling for images if needed
                // onError={(e) => (e.currentTarget.src = placeholderImage)}
              />
              {/* Thumbnail Scroll Container */}
              <ScrollShadow
                orientation="horizontal"
                className="mt-4 flex w-full max-w-full gap-3 pb-2 pt-1" // Spacing for thumbnails
              >
                {validImages.map((img, i) => (
                  <button
                    key={i}
                    aria-label={`View image ${i + 1}`} // Accessibility
                    data-selected={img === selectedImage}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      // Fixed size, prevent shrinking, rounded corners, transition
                      "relative h-20 w-20 flex-none flex-shrink-0 overflow-hidden rounded-medium transition-shadow md:h-24 md:w-24",
                      // Styling for selected vs non-selected thumbnails
                      img === selectedImage
                        ? "outline-none ring-2 ring-primary ring-offset-2 dark:ring-offset-black" // Use primary color for ring
                        : "ring-0 hover:shadow-md"
                    )}
                    style={{ scrollSnapAlign: "start" }} // Improve scroll behavior
                  >
                    <Image
                      removeWrapper
                      alt={`${name} thumbnail ${i + 1}`}
                      src={img}
                      classNames={{
                        // Ensure image covers the button area
                        img: "h-full w-full object-cover",
                      }}
                      // Add error handling for thumbnails if needed
                      // onError={(e) => (e.currentTarget.src = placeholderImage)}
                    />
                  </button>
                ))}
              </ScrollShadow>
            </div>

            {/* ─── Info Column ────────────────────────── */}
            <div className="flex flex-col">
              {/* Product Name H1 - Uncomment if needed */}
              {/* <h1 className="text-2xl font-bold tracking-tight">{name}</h1> */}
              <h1 className="text-2xl font-bold tracking-tight">{name}</h1>


              {/* Rating and Review Count */}
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 md:mt-2"> {/* Adjusted spacing */}
                <RatingRadioGroup hideStarsText size="sm" value={`${rating}`} />
                <p className="text-small text-default-500 dark:text-default-400"> {/* Adjusted color */}
                  ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
                </p>
              </div>
              {/* Price */}
              <p className="mt-2 text-xl font-medium tracking-tight text-default-700 dark:text-default-300 md:text-2xl"> {/* Adjusted size/color */}
                HUF {price}
              </p>

              {/* Short Description */}
              {description && (
                <div className="mt-4">
                  <h2 className="text-base font-semibold text-default-700 dark:text-default-300 md:text-lg">
                    Short Description
                  </h2>
                  {/* Apply prose styling with overrides for tighter spacing AND table widths/layout */}
                  <div
                    className={cn(
                      "prose prose-sm max-w-none text-default-600 dark:prose-invert dark:text-default-400",
                      "prose-p:my-0 prose-headings:my-2", // Remove paragraph vertical margins completely
                      // Force table/cell widths/layout to be responsive, overriding inline styles/attributes
                      // REMOVED prose-table:w-full!
                      "prose-table:table-auto! prose-table:max-w-[500px]! prose-td:w-auto! prose-th:w-auto!"
                    )}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              )}

              {/* Color Picker */}
              {availableColors.length > 0 && (
                <div className="mt-4">
                   <h3 className="text-sm font-medium text-default-700 dark:text-default-300">Color</h3>
                   <RadioGroup
                     aria-label="Color"
                     classNames={{ base: "mt-2", wrapper: "flex flex-wrap gap-2" }} // Ensure wrapping
                     defaultValue={availableColors[0].hex}
                     orientation="horizontal"
                   >
                     {availableColors.map((c) => (
                       <ColorRadioItem
                         key={c.hex}
                         color={c.hex}
                         tooltip={c.name}
                         value={c.hex}
                       />
                     ))}
                   </RadioGroup>
                </div>
              )}

              {/* Details Accordion */}
              {details.length > 0 && (
                <Accordion
                  className="-mx-1 mt-4"
                  itemClasses={{
                    title: "text-default-500 dark:text-default-400 text-sm font-medium", // Adjusted text style
                    content: "pb-4 pt-0 text-sm",
                    base: "px-1",
                  }}
                  items={details}
                  selectionMode="multiple"
                >
                  {details.map(({ title, items }) => (
                    <AccordionItem key={title} title={title}>
                      <ul className="list-inside list-disc space-y-1 pl-2 text-default-500 dark:text-default-400">
                        {items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>

          {/* ─── Full Description (inside scrollable area) ─── */}
          {longDescription && (
            <div className="col-span-full mt-6 px-1 lg:mt-8"> {/* Added padding */}
              <h2 className="mb-2 text-base font-semibold text-default-700 dark:text-default-300 md:text-lg">
                Long Description
              </h2>
              {/* Apply prose styling with overrides */}
              <div
                className={cn(
                  "prose prose-sm max-w-none text-default-600 dark:prose-invert dark:text-default-400",
                   "prose-p:my-0 prose-headings:my-2", // Remove paragraph vertical margins completely
                   // Force table/cell widths/layout to be responsive, overriding inline styles/attributes
                   // REMOVED prose-table:w-full!
                   "prose-table:table-auto! prose-table:max-w-[500px]! prose-td:w-auto! prose-th:w-auto!"
                )}
                dangerouslySetInnerHTML={{ __html: longDescription }}
              />
            </div>
          )}

          {/* Spacer DIV: Prevents content from being hidden behind the sticky footer. */}
          {/* Adjust height (h-20) based on the actual height of your footer + desired spacing. */}
          <div className="h-20 flex-shrink-0"></div>

        </div> {/* End Scrollable Content Area */}

        {/* ── STICKY FOOTER PANEL ── */}
        {/* Sticks to the bottom of the flex container */}
        <div
          className={cn(
            "sticky bottom-0 left-0 right-0 w-full flex-shrink-0", // Ensure it doesn't shrink
            "bg-background/95 backdrop-blur-md backdrop-saturate-150", // Theme-aware background
            "border-t border-default-200 dark:border-default-100", // Theme-aware border
            "flex items-center justify-between gap-4 p-4", // Internal padding and layout
            "z-20" // Ensure it's above content but potentially below modal controls
          )}
        >
          {/* Action Button */}
          <Button
            fullWidth
            variant="bordered" // White background with primary border/text
            color="primary"
            size="lg"
            // Explicit background/hover styles for light/dark modes
            className="border-primary bg-white text-primary hover:bg-primary-50 dark:border-primary dark:bg-default-100 dark:text-primary dark:hover:bg-default-200"
          >
            Improve Short description SEO Score with AI
          </Button>
          {/* SEO Score Chip */}
          {typeof seoScore === "number" && (
            <Chip
              variant="flat" // Flat style chip
              color="primary"
              size="md"
              className="whitespace-nowrap" // Prevent wrapping
            >
              SEO AI Score: {seoScore} / 100
            </Chip>
          )}
        </div>
      </div> // End Main container
    );
  }
);

ProductViewInfo.displayName = "ProductViewInfo"; // Set display name for DevTools
export default ProductViewInfo; // Export the component
