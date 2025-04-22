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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import ColorRadioItem from "./color-radio-item";
import RatingRadioGroup from "./rating-radio-group";

export type ProductViewItemColor = { name: string; hex: string };
export interface ProductViewItemProps {
  id: string;
  name: string;
  description?: string;
  longDescription?: string;
  images: string[];
  price: number;
  rating?: number;
  ratingCount?: number;
  sizes?: string[];
  isPopular?: boolean;
  details?: { title: string; items: string[] }[];
  availableColors?: ProductViewItemColor[];
  seoScore?: number;
  className?: string;
  shopSlug: string;
}

const badgeColors = ["primary", "secondary", "success", "warning", "destructive"];

// helper to strip code fences from description
const sanitizeDescription = (text = "") =>
  text.replace(/^```[\s\S]*?```/g, "").trim();

const ProductViewInfo = forwardRef<HTMLDivElement, ProductViewItemProps>(
  (
    { id, name, images, price, rating = 0, ratingCount = 0, description,
      longDescription, availableColors = [], details = [], isPopular = false,
      seoScore, className, shopSlug
    },
    ref
  ) => {
    const placeholderImage = "/placeholder-image.png";
    const validImages = Array.isArray(images) && images.length > 0 ? images : [placeholderImage];
    const [selectedImage, setSelectedImage] = useState(validImages[0]);

    // AI SEO State
    const cleanDesc = sanitizeDescription(description);
    const [targetHtml, setTargetHtml] = useState<string>(cleanDesc);
    const [displayedHtml, setDisplayedHtml] = useState<string>(cleanDesc);
    const [aiMeta, setAiMeta] = useState<string>("");
    const [rankKeywords, setRankKeywords] = useState<string[]>([]);
    const [displayedKeywords, setDisplayedKeywords] = useState<string[]>([]);
    const [externalLinks, setExternalLinks] = useState<string[]>([]);
      // ← NEW: store our cheapest‑price lookup
    const [priceComparison, setPriceComparison] = useState<{
      cheapest: { source: string; price: number; link: string };
      suggestion: string;
    } | null>(null);
    const [isImproving, setIsImproving] = useState(false);

    // Typewriter: only during AI thinking
    useEffect(() => {
      if (!isImproving) {
        setDisplayedHtml(targetHtml);
        return;
      }
      setDisplayedHtml("");
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setDisplayedHtml(targetHtml.slice(0, idx));
        if (idx >= targetHtml.length) clearInterval(interval);
      }, 10); // faster
      return () => clearInterval(interval);
    }, [targetHtml, isImproving]);

    // reveal badges
    useEffect(() => {
      if (!rankKeywords.length) return;
      setDisplayedKeywords([]);
      rankKeywords.forEach((kw, i) =>
        setTimeout(() => setDisplayedKeywords((prev) => [...prev, kw]), 100 * (i + 1))
      );
    }, [rankKeywords]);

    // fetch AI SEO
    async function handleImprove() {
      if (!description) return;
      setIsImproving(true);
      setRankKeywords([]);
      setExternalLinks([]);
      setAiMeta("");
      setTargetHtml("");

      try {
        const res = await fetch(
                  `/api/webshops/${shopSlug}/products/${id}/seo`,
                 {
                   method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      description,           // your raw desc
                      currentPrice: price,   // ← NEW: tell the API our price
                    }),
                  }
                );
        const data = await res.json();
        setTargetHtml(data.html);
        setAiMeta(data.metaDescription);
        setRankKeywords(data.rankMathKeywords || []);
        setExternalLinks(data.externalLinks || []);
        setPriceComparison(data.priceComparison || null);
        setIsImproving(false);
      } catch (err) {
        console.error(err);
        setIsImproving(false);
      }
    }

    // reset image on update
    useEffect(() => {
      if (!validImages.includes(selectedImage)) setSelectedImage(validImages[0]);
    }, [images]);

    return (
      <div ref={ref} className={cn("relative flex h-full flex-col", className)}>
        <div className="flex-grow overflow-y-auto">
          <div className={cn("grid grid-cols-1 gap-4 p-1", "lg:grid-cols-2 lg:items-start lg:gap-x-4")}>

            {/* Gallery */}
            <div className="relative flex-none lg:sticky lg:top-4">
              {isPopular && <Chip size="lg" startContent={<Icon icon="solar:star-bold" />}>Popular</Chip>}
              <Image removeWrapper alt={name} src={selectedImage} className="aspect-square w-full rounded-lg object-cover" />
              <ScrollShadow orientation="horizontal" className="mt-4 flex gap-3">
                {validImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(img)}
                    className={cn("h-20 w-20 rounded-md overflow-hidden transition-shadow md:h-24 md:w-24",
                      img === selectedImage ? "ring-2 ring-primary" : "hover:shadow-lg")}
                  >
                    <Image removeWrapper alt={`${name} thumb`} src={img} classNames={{ img: "h-full w-full object-cover" }} />
                  </button>
                ))}
              </ScrollShadow>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <RatingRadioGroup hideStarsText size="sm" value={`${rating}`} />
                <p className="text-sm">({ratingCount} reviews)</p>
              </div>
              <p className="mt-2 text-xl font-medium">HUF {price}</p>

              {/* AI Short Desc */}
              {displayedHtml && (
                <div className="mt-4">
                  <h2 className="text-base font-semibold">Short Description</h2>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: displayedHtml }} />
                </div>
              )}

              {/* Meta Description */}
              {aiMeta && (
                <div className="mt-4 p-2 bg-gray-100 rounded-md">
                  <h3 className="text-sm font-medium">Meta Description</h3>
                  <p className="text-sm italic">{aiMeta}</p>
                </div>
              )}

              {/* Keywords */}
              {displayedKeywords.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium">Keyword Suggestions</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {displayedKeywords.map((kw, idx) => (
                      <Chip key={kw} variant="solid" size="sm" color={badgeColors[idx % badgeColors.length]} className="rounded-full">
                        {kw}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              {externalLinks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium">External Links</h3>
                  <ul className="list-disc list-inside text-sm">
                    {externalLinks.map((u) => (
                      <li key={u}><a href={u} target="_blank" rel="noopener noreferrer" className="underline text-primary">{u}</a></li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
                      {/* Price Comparison */}
            {priceComparison && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium">Ár‑összehasonlítás</h3>
                <p>
                  Legolcsóbb ajánlat:&nbsp;
                  <a
                    href={priceComparison.cheapest.link}
                    target="_blank"
                   rel="noopener noreferrer"
                    className="underline text-primary"
                  >
                    {priceComparison.cheapest.source}
                  </a>{" "}
                  – {priceComparison.cheapest.price.toFixed(0)} EUR
                </p>
                <p className="italic">{priceComparison.suggestion}</p>
              </div>
            )}
          {/* Long Description */}
          {longDescription && (
            <div className="mt-6 px-1">
              <h2 className="font-semibold">Long Description</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: longDescription }} />
            </div>
          )}

          <div className="h-20" />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t bg-background p-4">
          <Button fullWidth variant="bordered" onPress={handleImprove} disabled={isImproving}>
            {isImproving ? "Thinking…" : "Improve & Generate SEO AI Content"}
          </Button>
          {typeof seoScore === "number" && <Chip>SCORE: {seoScore}%</Chip>}
        </div>
      </div>
    );
  }
);

ProductViewInfo.displayName = "ProductViewInfo";
export default ProductViewInfo;
