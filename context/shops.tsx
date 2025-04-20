// context/shops.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadShops, saveShops, Shop } from '@/lib/shops';

interface ShopsContextValue {
  shops: Shop[];
  addShop: (shop: Shop) => void;
}

const ShopsContext = createContext<ShopsContextValue | undefined>(undefined);

export function ShopsProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShops(loadShops());
    }
  }, []);

  const addShop = (shop: Shop) => {
    const updated = [...shops, shop];
    setShops(updated);
    saveShops(updated);
  };

  return (
    <ShopsContext.Provider value={{ shops, addShop }}>
      {children}
    </ShopsContext.Provider>
  );
}

export function useShops() {
  const ctx = useContext(ShopsContext);
  if (!ctx) throw new Error('useShops must be used within ShopsProvider');
  return ctx;
}