// app/dashboard/webshops/[shop]/products/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useShops } from '@/context/shops';

import { StockBadge } from '@/components/webshop/widget/StockBadge';
import { Price } from '@/components/webshop/widget/Price';
import { ModifiedDate } from '@/components/webshop/widget/ModifiedDate';
import { RankBadge } from '@/components/webshop/widget/RankBadge';
import { ProductImage } from '@/components/webshop/widget/ProductImage';
import { ProductNameLink } from '@/components/webshop/widget/ProductNameLink';
import { PaginationControls } from '@/components/webshop/widget/PaginationControls';
import { Button, Skeleton } from '@heroui/react';
import ProductPopup from '@/components/products/ProductPopup';
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
  stock_status: 'instock' | 'outofstock';
  stock_quantity: number;
  date_modified: string;
  images: { src: string }[];
  meta_data: WooMeta[];
}
interface ProductDetail extends Product {
  short_description: string;
  description: string;
}

// same slugify as your API
function slugify(url: string) {
  return url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
}

type SortDir = 'asc' | 'desc' | null;

export default function ProductsPage() {
  const { shop: shopSlug } = useParams() as { shop: string };
  const { shops } = useShops();

  // — Woo creds from localStorage
  const [connections, setConnections] = useState<WooEntry[]>([]);
  useEffect(() => {
    setConnections(JSON.parse(localStorage.getItem('wooConnections') || '[]'));
  }, []);
  const connection = connections.find((c) => {
    const base = slugify(c.selectedShopUrl);
    return base === shopSlug || `www-${base}` === shopSlug;
  });

  // — main UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currency, setCurrency] = useState('USD');

  // — pagination & sorting
  const perPage = 25;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stockDir, setStockDir] = useState<SortDir>(null);
  const [priceDir, setPriceDir] = useState<SortDir>(null);
  const [progress, setProgress] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);

  // — popup state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // helper to fetch list pages (optionally price‑sorted)
  async function fetchPage(p: number, order: SortDir) {
    const slug = slugify(connection!.selectedShopUrl);
    const url = new URL(
      `/api/webshops/${slug}/products`,
      window.location.origin,
    );
    url.searchParams.set('page', String(p));
    url.searchParams.set('per_page', String(perPage));
    if (order) {
      url.searchParams.set('sort_price', '1');
      url.searchParams.set('order', order);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const tp = res.headers.get('X-WP-TotalPages') ?? '1';
    setTotalPages(+tp);
    return res.json() as Promise<{ products: Product[]; currency: string }>;
  }

  // when stockDir toggles → fetch *all* & client‑sort
  useEffect(() => {
    if (!connection) return;
    if (stockDir === null) {
      setAllProducts(null);
      setPage(1);
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(0);

    fetchPage(1, null)
      .then(async ({ products: first, currency }) => {
        const pages = totalPages;
        const all = [...first];
        setCurrency(currency);
        let done = 1;
        setProgress(Math.round((done / pages) * 100));

        await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) => i + 2).map((pn) =>
            fetchPage(pn, null).then(({ products }) => {
              all.push(...products);
              done++;
              setProgress(Math.round((done / pages) * 100));
            }),
          ),
        );

        all.sort((a, b) => {
          const bucket = (q: number) => (q <= 0 ? 0 : q < 5 ? 1 : 2);
          const da = bucket(a.stock_quantity),
            db = bucket(b.stock_quantity);
          if (da !== db) return stockDir === 'asc' ? da - db : db - da;
          const tie = a.stock_quantity - b.stock_quantity;
          return stockDir === 'asc' ? tie : -tie;
        });

        setAllProducts(all);
        setTotalPages(Math.ceil(all.length / perPage));
        setPage(1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [connection, stockDir]);

  // page / priceDir / allProducts → update table
  useEffect(() => {
    if (!connection) return;
    if (allProducts) {
      const start = (page - 1) * perPage;
      setProducts(allProducts.slice(start, start + perPage));
      return;
    }
    setLoading(true);
    setError(null);
    fetchPage(page, priceDir)
      .then(({ products: prs, currency }) => {
        setProducts(prs);
        setCurrency(currency);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [connection, page, priceDir, allProducts]);

  // when modal opens with a selectedId → fetch detail
  useEffect(() => {
    if (!modalOpen || selectedId == null) return;
    setDetailLoading(true);
    setDetailError(null);
    fetch(
      `/api/webshops/${slugify(connection!.selectedShopUrl)}/products/${selectedId}`,
    )
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<ProductDetail>;
      })
      .then(setDetail)
      .catch((e) => setDetailError(e.message))
      .finally(() => setDetailLoading(false));
  }, [modalOpen, selectedId, connection]);

  // if no connection…
  if (!connection)
    return (
      <div className="p-8">
        <h2>No WooCommerce connection for “{shopSlug}”</h2>
      </div>
    );

  // loading state with skeletons…
  if (loading)
    return (
      <div className="p-8 space-y-6">
        {stockDir !== null && (
          <div>
            <div className="w-full bg-gray-200 h-2 rounded mb-2">
              <div
                className="h-2 bg-blue-500 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>Sorting by stock… {progress}%</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 w-20">Image</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2 w-32 text-center">Stock</th>
                <th className="px-4 py-2 w-32 text-center">Price</th>
                <th className="px-4 py-2 w-32">Modified</th>
                <th className="px-4 py-2 w-16">Rank</th>
                <th className="px-4 py-2 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: perPage }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">
                    <Skeleton className="w-10 h-10 rounded" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-4 w-16 rounded-lg mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-4 w-20 rounded-lg mx-auto" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-4 w-8 rounded-lg mx-auto" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-6 w-12 rounded-lg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>;

  // ready state
  let adminUrl = connection.selectedShopUrl;
  if (!/^https?:\/\//i.test(adminUrl)) adminUrl = `https://${adminUrl}`;
  const wpAdmin = new URL(adminUrl).origin;
  const headerName =
    shops.find((s) => s.url === connection.selectedShopUrl)?.name ??
    connection.selectedShopUrl;

  const cycle = (d: SortDir) =>
    d === null ? 'asc' : d === 'asc' ? 'desc' : null;

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-semibold">Products for “{headerName}”</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 w-20">Image</th>
              <th className="px-4 py-2">Name</th>

              <th
                className="px-4 py-2 w-32 text-center cursor-pointer select-none"
                onClick={() => {
                  setPriceDir(null);
                  setStockDir(cycle);
                }}
              >
                <div className="inline-flex items-center space-x-1">
                  <span>Stock</span>
                  {stockDir && (
                    <Icon
                      icon={
                        stockDir === 'asc'
                          ? 'mdi:chevron-up'
                          : 'mdi:chevron-down'
                      }
                      width={16}
                    />
                  )}
                </div>
              </th>

              <th
                className="px-4 py-2 w-32 text-center cursor-pointer select-none"
                onClick={() => {
                  setStockDir(null);
                  setPriceDir(cycle);
                  setPage(1);
                }}
              >
                <div className="inline-flex items-center space-x-1">
                  <span>Price</span>
                  {priceDir && (
                    <Icon
                      icon={
                        priceDir === 'asc'
                          ? 'mdi:chevron-up'
                          : 'mdi:chevron-down'
                      }
                      width={16}
                    />
                  )}
                </div>
              </th>

              <th className="px-4 py-2 w-32">Modified</th>
              <th className="px-4 py-2 w-16">Rank</th>
              <th className="px-4 py-2 w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const score =
                p.meta_data.find((m) => m.key === 'rank_math_score')?.value ??
                '–';
              return (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <ProductImage src={p.images[0]?.src} alt={p.name} />
                  </td>
                  <td className="px-4 py-2">
                    <ProductNameLink id={p.id} adminOrigin={wpAdmin}>
                      {p.name}
                    </ProductNameLink>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <StockBadge quantity={p.stock_quantity} />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Price value={p.price} currency={currency} />
                  </td>
                  <td className="px-4 py-2">
                    <ModifiedDate iso={p.date_modified} />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <RankBadge score={score} />
                  </td>
                  <td className="px-4 py-2">
                    <ProductPopup
                      shopSlug={shopSlug}
                      productId={p.id}
                      trigger={
                        <Button size="sm" variant="light">
                          <Icon icon="mdi:pencil-outline" width={16} /> Edit
                        </Button>
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        windowSize={2}
        onChange={setPage}
      />

      {/* ─── MODAL ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded p-6 w-3/4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <Skeleton className="h-6 w-1/3 mb-4" />
            ) : detailError ? (
              <p className="text-red-600">
                Error loading details: {detailError}
              </p>
            ) : detail ? (
              <>
                <h3 className="text-xl font-semibold mb-2">{detail.name}</h3>
                <div
                  className="prose mb-4"
                  dangerouslySetInnerHTML={{ __html: detail.short_description }}
                />
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: detail.description }}
                />
              </>
            ) : null}

            <div className="mt-6 text-right">
              <Button onPress={() => setModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
