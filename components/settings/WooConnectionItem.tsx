// components/settings/WooConnectionItem.tsx
"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Icon as Iconify } from "@iconify/react";
import { WooEntry } from "./WooCommerceTab";

import type { Shop } from "@/lib/shops";

interface Props {
  entry: WooEntry;
  shop?: Shop;
  onRemove: () => void;
}

export default function WooConnectionItem({ entry, shop, onRemove }: Props) {
  const mask = (s: string) => (s.length > 5 ? `${s.slice(0, 5)}…` : s);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-small font-medium">Consumer Key</p>
          <div className="mt-1 p-2 bg-white rounded border">{mask(entry.consumerKey)}</div>
        </div>
        <div>
          <p className="text-small font-medium">Consumer Secret</p>
          <div className="mt-1 p-2 bg-white rounded border">{mask(entry.consumerSecret)}</div>
        </div>
        <div>
          <p className="text-small font-medium">Linked Shop</p>
          <div className="mt-1 p-2 bg-white rounded border">
            {shop ? shop.name : entry.selectedShopUrl}
          </div>
        </div>
      </div>
      <div className="mt-2 text-right">
        <Button variant="light" color="danger" onPress={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
