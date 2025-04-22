// components/products/ProductPopup.tsx
"use client";

import React, { useState, useEffect, cloneElement } from "react";
import { Button, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import ProductViewInfo, { ProductViewItemProps } from "./product-view-item";

interface Props {
  shopSlug: string;
  productId: number;
  trigger: React.ReactNode;
}

export default function ProductPopup({ shopSlug, productId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchProduct() {
    const res = await fetch(`/api/webshops/${shopSlug}/products/${productId}`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return res.json();
  }

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetchProduct()
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  function toViewItem(prod: any): ProductViewItemProps {
    return {
      id: String(prod.id),
      name: prod.name,
      price: parseFloat(prod.price),
      rating: parseFloat(prod.average_rating) || 0,
      ratingCount: prod.rating_count || 0,
      images: prod.images.map((i: any) => i.src),
      description: prod.short_description,
      longDescription: prod.description,
      sizes: [],
      availableColors: [],
      details: [],
      seoScore: 0,
      shopSlug,
    };
  }

  // inject HeroUI onPress for React triggers
  let Trigger = <>{trigger}</>;
  if (React.isValidElement(trigger)) {
    Trigger = cloneElement(trigger, { onPress: () => setOpen(true) });
  } else {
    Trigger = (
      <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        {trigger}
      </span>
    );
  }

  return (
    <>
      {Trigger}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          {/* ← full-screen white panel */}
         <div
     className="absolute top-[10%] bottom-[10%] left-[10%] right-[10%] bg-white rounded-lg shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="light"
              onPress={() => setOpen(false)}
              className="absolute right-4 top-4 z-10"
            >
              <Icon icon="mdi:close" width={18} />
            </Button>

            <h3 className="mb-4 text-xl font-semibold">
            {loading ? "Loading…" : error ? "Error" : " "} {/* Changed: Don't show data.name here */}
            </h3>

            {loading ? (
              <Skeleton className="mb-6 h-64 w-full animate-pulse rounded-lg" />
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : data ? (
              <ProductViewInfo {...toViewItem(data)} />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
