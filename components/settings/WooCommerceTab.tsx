"use client";

import React, { useState, useEffect } from "react";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useShops } from "@/context/shops";

export interface WooEntry {
  consumerKey: string;
  consumerSecret: string;
  selectedShopUrl: string;
}

// simple mask helper
const mask = (s: string) => (s.length > 5 ? `${s.slice(0, 5)}…` : s);

export default function WooCommerceTab() {
  const { shops } = useShops();

  // persisted connections
  const [connections, setConnections] = useState<WooEntry[]>([]);
  // “add new” form toggle
  const [adding, setAdding] = useState(false);

  // form fields
  const [ck, setCk] = useState("");
  const [cs, setCs] = useState("");
  const [sel, setSel] = useState("");

  // load from localStorage once
  useEffect(() => {
    const raw = localStorage.getItem("wooConnections");
    if (raw) setConnections(JSON.parse(raw));
  }, []);

  // persist helper
  const saveAll = (next: WooEntry[]) => {
    localStorage.setItem("wooConnections", JSON.stringify(next));
    setConnections(next);
      // 2) ALSO write an HTTP cookie so your API route can pick it up
  //    - URL‑encode the JSON so it’s cookie‑safe
  //    - path=/ ensures it’s sent to all routes under your domain
  //    - max-age=30 days (in seconds)
  const value = encodeURIComponent(JSON.stringify(next));
  document.cookie = `wooConnections=${value}; path=/; max-age=${60 * 60 * 24 * 30}`;
  };

  // handlers
  const startAdd = () => {
    setAdding(true);
    setCk("");
    setCs("");
    setSel("");
  };
  const cancelAdd = () => setAdding(false);
  const commitAdd = () => {
    if (!ck.trim() || !cs.trim() || !sel) return;

    saveAll([
      ...connections,
      {
        consumerKey: ck.trim(),
        consumerSecret: cs.trim(),
        selectedShopUrl: sel,
      },
    ]);

    setAdding(false);
  };
  const removeAt = (i: number) =>
    saveAll(connections.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6 pt-4">
      <p className="text-medium">Manage WooCommerce connections</p>

      {/* Existing connections */}
      {connections.length > 0 &&
        connections.map((c, idx) => {
          const shop = shops.find((s) => s.url === c.selectedShopUrl);
          return (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-small font-medium mb-1">Consumer Key</p>
                  <div className="p-2 bg-white rounded border">
                    {mask(c.consumerKey)}
                  </div>
                </div>
                <div>
                  <p className="text-small font-medium mb-1">
                    Consumer Secret
                  </p>
                  <div className="p-2 bg-white rounded border">
                    {mask(c.consumerSecret)}
                  </div>
                </div>
                <div>
                  <p className="text-small font-medium mb-1">Linked Shop</p>
                  <div className="p-2 bg-white rounded border">
                    {shop?.name || c.selectedShopUrl}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-right">
                <Button
                  variant="light"
                  color="danger"
                  onPress={() => removeAt(idx)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}

      {/* Add connection flow */}
      {adding ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-small font-medium mb-1">
                Consumer Key
              </label>
              <Input
                value={ck}
                onChange={(e) => setCk(e.target.value)}
                placeholder="ck_xxxxx"
              />
            </div>
            <div>
              <label className="block text-small font-medium mb-1">
                Consumer Secret
              </label>
              <Input
                value={cs}
                onChange={(e) => setCs(e.target.value)}
                placeholder="cs_xxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-small font-medium mb-1">
              Select Webshop
            </label>
            <select
              className="block w-full border border-gray-300 rounded p-2"
              value={sel}
              onChange={(e) => setSel(e.target.value)}
            >
              <option value="">— choose —</option>
              {shops.map((s) => (
                <option key={s.url} value={s.url}>
                  {s.name} ({s.url})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="light" color="default" onPress={cancelAdd}>
              Cancel
            </Button>
            <Button onPress={commitAdd} disabled={!ck || !cs || !sel}>
              Save Connection
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-right">
          <Button onPress={startAdd}>Add Connection</Button>
        </div>
      )}
    </div>
  );
}
