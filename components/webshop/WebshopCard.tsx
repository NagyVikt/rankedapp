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

export default function WebshopCard({
  name,
  url,
  statusApiUrl = "/wp-json/webshop/v1/status",
  ...cardProps
}: CardProps & { name: string; url: string }) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [wooSettings, setWooSettings] = useState<{ selectedShopUrl?: string } | null>(null);

  // derive this shop’s “slug” once
  const slug = useMemo(() => slugify(url), [url]);

  useEffect(() => {
    // 1) screenshot
    (async () => {
      setLoading(true);
      try {
        const ep = process.env.NEXT_PUBLIC_SCREENSHOT_ENDPOINT || "/api/screenshot";
        const res = await fetch(`${ep}?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const blob = await res.blob();
          setImageSrc(URL.createObjectURL(blob));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();

    // 2) load woo link (from your Settings tab localStorage key)
    const raw = localStorage.getItem("wooConnections");
    if (raw) {
      try {
        const conns: Array<{ selectedShopUrl: string; consumerKey: string; consumerSecret: string }> = JSON.parse(raw);
        if (conns.find((c) => c.selectedShopUrl === url)) {
          setWooSettings({ selectedShopUrl: url });
        }
      } catch {}
    }
  }, [url]);

  const isWooConnected = wooSettings?.selectedShopUrl === url;

  return (
    <Card className="w-full max-w-sm shadow-md rounded-lg overflow-hidden" {...cardProps}>
      <CardBody className="px-3 pb-1 bg-white">
        <div className="relative">
          {loading || !imageSrc ? (
            <div className="flex items-center justify-center h-48">
              <span className="text-gray-400">
                {loading ? "Loading preview…" : "No preview available"}
              </span>
            </div>
          ) : (
            <Image
              alt={`${name} front page`}
              className="aspect-video w-full object-cover object-top rounded-t"
              src={imageSrc}
            />
          )}
        </div>

        <Spacer y={2} />

        <div className="flex flex-col gap-1 px-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-black hover:underline"
          >
            {name}
          </a>
          <p className="text-sm text-gray-500">{url}</p>
        </div>
      </CardBody>

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
            >
              <Icon icon="mdi:tag-outline" width={18} className="text-gray-600" />
              <span className="text-sm text-gray-700">Products</span>
            </Button>
          </Link>
          {/* …you can add AI Settings / Emails here similarly… */}
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
