// app/dashboard/webshops/[shop]/products/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useShops } from "@/context/shops";

interface WooEntry {
  consumerKey: string;
  consumerSecret: string;
  selectedShopUrl: string;
}

interface WooMeta {
  id: number;
  key: string;
  value: any;
}

interface Product {
  id: number;
  name: string;
  price: string;
  stock_status: "instock" | "outofstock";
  date_modified: string;
  images: { src: string }[];
  description: string;
  short_description: string;
  meta_data: WooMeta[];
}

// strip protocol + optional www., then slugify
function slugify(url: string) {
  return url
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

export default function ProductsPage() {
  const { shop: shopSlug } = useParams() as { shop: string };
  const { shops } = useShops();

  // 1) your list of Woo connections
  const [connections, setConnections] = useState<WooEntry[]>([]);

  // 2) product‑fetch state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Starting…");
  const [error, setError] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // inline edit
  const [editing, setEditing] = useState<Product | null>(null);

  // --- load connections once ---
  useEffect(() => {
    const raw = localStorage.getItem("wooConnections");
    setConnections(raw ? JSON.parse(raw) : []);
  }, []);

  // find the matching connection (or undefined)
  const connection = connections.find(
    (c) => slugify(c.selectedShopUrl) === shopSlug
  );

  // --- fetch products whenever connection or page changes ---
  useEffect(() => {
    if (!connection) {
      // nothing to fetch until we have a connection
      return;
    }

    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      setStatus("Normalizing URL…");

      // normalize URL
      let url = connection.selectedShopUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      const parsed = new URL(url);
      parsed.hostname = parsed.hostname.replace(/^www\./, "");
      const origin = parsed.origin;

      setStatus(`Fetching products from ${origin}…`);
      const params = new URLSearchParams({
        consumer_key: connection.consumerKey,
        consumer_secret: connection.consumerSecret,
        per_page: "25",
        page: page.toString(),
        _fields:
          "id,name,price,stock_status,date_modified,images,description,short_description,meta_data",
      });
      const endpoint = `${origin}/wp-json/wc/v3/products?${params}`;

      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Woo fetch failed (${res.status})`);

        const totalHeader = res.headers.get("X-WP-TotalPages");
        if (totalHeader && !cancelled) {
          setTotalPages(Number(totalHeader));
        }

        const data = (await res.json()) as Product[];
        if (!cancelled) setProducts(data);
      } catch (e: any) {
        console.error("Fetch error:", e);
        if (!cancelled) {
          setError(
            e instanceof TypeError
              ? `Unable to reach ${parsed.origin}`
              : e.message
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [connection, page]);

  // --- render ---

  // 1) if no connection, show directory
  if (!connection) {
    return (
      <div className="p-8 space-y-4">
        <h2 className="text-2xl font-semibold">Connected Shops</h2>
        {connections.length === 0 ? (
          <p className="text-gray-600">No WooCommerce connections found.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {connections.map((c) => {
              const slug = slugify(c.selectedShopUrl);
              const name =
                shops.find((s) => s.url === c.selectedShopUrl)?.name ||
                c.selectedShopUrl;
              return (
                <li key={c.selectedShopUrl}>
                  <Link
                    href={`/dashboard/webshops/${slug}/products`}
                    className="text-blue-600 hover:underline"
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // 2) once we have a connection: loading / error / table
  if (loading) {
    return <p className="p-8 text-gray-700">{status}</p>;
  }
  if (error) {
    return <p className="p-8 text-red-600">Error: {error}</p>;
  }

  const headerName =
    shops.find((s) => s.url === connection.selectedShopUrl)?.name ||
    shopSlug;

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-semibold">Products for “{headerName}”</h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Stock</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Modified</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  {p.images[0]?.src ? (
                    <img
                      src={p.images[0].src}
                      alt={p.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded" />
                  )}
                </td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">
                  <Badge
                    color={p.stock_status === "instock" ? "success" : "danger"}
                  >
                    {p.stock_status === "instock"
                      ? "In stock"
                      : "Out of stock"}
                  </Badge>
                </td>
                <td className="px-4 py-2">${p.price}</td>
                <td className="px-4 py-2">
                  {new Date(p.date_modified).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <Button
                    variant="light"
                    size="sm"
                    onPress={() => setEditing(p)}
                  >
                    <Icon icon="mdi:pencil-outline" width={16} />
                    <span>Edit</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-between items-center">
        <Button
          variant="light"
          size="sm"
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ← Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="light"
          size="sm"
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
