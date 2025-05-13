'use client';

import React, { useState, useEffect, forwardRef, useMemo } from 'react';
import { Button, Chip, Image, ScrollShadow } from '@heroui/react';
import { Icon } from '@iconify/react';
import { cn } from '@heroui/react';
import RatingRadioGroup from './rating-radio-group';

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

// Support external links as strings or objects
export type ExternalLink = string | { name: string; url: string };

const badgeColors = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
] as const;

const sanitizeDescription = (text = '') =>
  text.replace(/^```[\s\S]*?```/g, '').trim();

const ProductViewInfo = forwardRef<HTMLDivElement, ProductViewItemProps>(
  (
    {
      id,
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
      shopSlug,
    },
    ref,
  ) => {
    const placeholderImage = '/placeholder-image.png';
    const validImages = images.length > 0 ? images : [placeholderImage];
    const [selectedImage, setSelectedImage] = useState(validImages[0]);

    // AI SEO state
    const cleanDesc = sanitizeDescription(description);
    const [targetHtml, setTargetHtml] = useState(cleanDesc);
    const [displayedHtml, setDisplayedHtml] = useState(cleanDesc);
    const [aiMeta, setAiMeta] = useState('');
    const [rankKeywords, setRankKeywords] = useState<string[]>([]);
    const [displayedKeywords, setDisplayedKeywords] = useState<string[]>([]);
    const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
    const [priceComparison, setPriceComparison] = useState<{
      cheapest: { source: string; price: number; link: string };
      suggestion: string;
    } | null>(null);
    const [isImproving, setIsImproving] = useState(false);

    // Typewriter effect
    useEffect(() => {
      if (!isImproving) {
        setDisplayedHtml(targetHtml);
        return;
      }
      setDisplayedHtml('');
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setDisplayedHtml(targetHtml.slice(0, idx));
        if (idx >= targetHtml.length) clearInterval(interval);
      }, 10);
      return () => clearInterval(interval);
    }, [targetHtml, isImproving]);

    // Reveal keywords
    useEffect(() => {
      if (!rankKeywords.length) return;
      setDisplayedKeywords([]);
      rankKeywords.forEach((kw, i) =>
        setTimeout(
          () => setDisplayedKeywords((prev) => [...prev, kw]),
          100 * (i + 1),
        ),
      );
    }, [rankKeywords]);

    // AI improve handler
    async function handleImprove() {
      if (!description) return;
      setIsImproving(true);
      setRankKeywords([]);
      setExternalLinks([]);
      setAiMeta('');
      setTargetHtml('');

      try {
        const res = await fetch(
          `/api/webshops/${shopSlug}/products/${id}/seo`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, currentPrice: price }),
          },
        );
        const data = await res.json();
        setTargetHtml(data.html);
        setAiMeta(data.metaDescription);
        setRankKeywords(data.rankMathKeywords || []);
        setExternalLinks(data.externalLinks || []);
        setPriceComparison(data.priceComparison || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsImproving(false);
      }
    }

    // Reset selected image if images update
    useEffect(() => {
      if (!validImages.includes(selectedImage)) {
        setSelectedImage(validImages[0]);
      }
    }, [images]);

    // Render list items outside JSX to avoid parser issues
    const renderedExternalLinks = useMemo(
      () =>
        externalLinks.map((linkOrObj, idx) => {
          const href =
            typeof linkOrObj === 'string' ? linkOrObj : linkOrObj.url;
          const label =
            typeof linkOrObj === 'string'
              ? linkOrObj
              : linkOrObj.name || linkOrObj.url;
          return (
            <li key={href || idx}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                {label}
              </a>
            </li>
          );
        }),
      [externalLinks],
    );

    return (
      <div ref={ref} className={cn('relative flex h-full flex-col', className)}>
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 p-1 lg:grid-cols-2 lg:items-start lg:gap-x-4">
            {/* Gallery */}
            <div className="relative flex-none lg:sticky lg:top-4">
              {isPopular && (
                <Chip size="lg" startContent={<Icon icon="solar:star-bold" />}>
                  Popular
                </Chip>
              )}
              <Image
                removeWrapper
                alt={name}
                src={selectedImage}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <ScrollShadow
                orientation="horizontal"
                className="mt-4 flex gap-3"
              >
                {validImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      'h-20 w-20 rounded-md overflow-hidden transition-shadow md:h-24 md:w-24',
                      img === selectedImage
                        ? 'ring-2 ring-primary'
                        : 'hover:shadow-lg',
                    )}
                  >
                    <Image
                      removeWrapper
                      alt={`${name} thumb`}
                      src={img}
                      classNames={{ img: 'h-full w-full object-cover' }}
                    />
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

              {/* Short Description */}
              {displayedHtml && (
                <div className="mt-4">
                  <h2 className="text-base font-semibold">Short Description</h2>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: displayedHtml }}
                  />
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
                    {displayedKeywords.map((kw, i) => (
                      <Chip
                        key={kw}
                        variant="solid"
                        size="sm"
                        color={badgeColors[i % badgeColors.length]}
                        className="rounded-full"
                      >
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
                    {renderedExternalLinks}
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
                </a>{' '}
                – {priceComparison.cheapest.price.toFixed(0)} EUR
              </p>
              <p className="italic">{priceComparison.suggestion}</p>
            </div>
          )}

          {/* Long Description */}
          {longDescription && (
            <div className="mt-6 px-1">
              <h2 className="font-semibold">Long Description</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: longDescription }}
              />
            </div>
          )}

          <div className="h-20" />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t bg-background p-4">
          <Button
            fullWidth
            variant="bordered"
            onPress={handleImprove}
            disabled={isImproving}
          >
            {isImproving ? 'Thinking…' : 'Improve & Generate SEO AI Content'}
          </Button>
          {typeof seoScore === 'number' && <Chip>SCORE: {seoScore}%</Chip>}
        </div>
      </div>
    );
  },
);

ProductViewInfo.displayName = 'ProductViewInfo';
export default ProductViewInfo;
