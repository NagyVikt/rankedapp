"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { CardProps } from "@heroui/react";
import { Card, Tabs, Tab, Skeleton, Chip, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";

// Import your actual tab content components
import AccountDetails from "./account-details";
import NotificationsSettings from "./notifications-settings";
import SecuritySettings from "./security-settings";
import WooCommerceTab from "./WooCommerceTab";
import ShopifyTab from "./ShopifyTab"; // Import the actual ShopifyTab component
import ApiKeysTab from "./ApiKeysTab";

// --- LocalStorage Keys ---
const SELECTED_TAB_STORAGE_KEY = "settingsSelectedTab";
const WOO_CONNECTIONS_STORAGE_KEY = "wooConnections"; // Keep consistent
const SHOPIFY_CONNECTIONS_STORAGE_KEY = "shopifyConnections"; // Add Shopify key
// Match the localStorageKeys defined in your ApiKeysTab/ApiKeyManager config
const RELEVANT_API_KEYS = ['openaiApiKey', 'geminiApiKey', 'claudeApiKey', 'perplexityApiKey', 'deepseekApiKey'];

// Define valid tab keys for lookup and default
const validTabKeys = ['account', 'notifications', 'security', 'woocommerce', 'shopify', 'apikeys', 'plugin-settings'];

export default function SettingsComponent(props: CardProps) {
  // State for badge indicators
  const [wooCount, setWooCount] = useState<number>(0);
  const [shopifyCount, setShopifyCount] = useState<number>(0); // Add state for Shopify count
  const [apiKeysConfiguredCount, setApiKeysConfiguredCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Safer way to read initial state from localStorage
  const getInitialTabKey = useCallback((): string => {
      if (typeof window !== 'undefined') {
          const storedTabKey = localStorage.getItem(SELECTED_TAB_STORAGE_KEY);
          if (storedTabKey && validTabKeys.includes(storedTabKey)) {
              return storedTabKey;
          }
      }
      return 'account';
  }, []); // No dependencies needed

  const [selectedTabKey, setSelectedTabKey] = useState<string>(getInitialTabKey);

  // Function to update badge status from localStorage
  const updateBadgeStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    // WooCommerce Count
    const rawWoo = localStorage.getItem(WOO_CONNECTIONS_STORAGE_KEY);
    let currentWooCount = 0;
    if (rawWoo) {
      try {
        const connections = JSON.parse(rawWoo);
        currentWooCount = Array.isArray(connections) ? connections.length : 0;
      } catch (e) { console.error("Failed to parse wooConnections", e); }
    }
    setWooCount(currentWooCount);

    // Shopify Count - Added
    const rawShopify = localStorage.getItem(SHOPIFY_CONNECTIONS_STORAGE_KEY);
    let currentShopifyCount = 0;
    if (rawShopify) {
        try {
            const connections = JSON.parse(rawShopify);
            currentShopifyCount = Array.isArray(connections) ? connections.length : 0;
        } catch (e) { console.error("Failed to parse shopifyConnections", e); }
    }
    setShopifyCount(currentShopifyCount); // Update Shopify state

    // API Keys Count
    let configuredApiCount = 0;
    RELEVANT_API_KEYS.forEach(key => {
        if (localStorage.getItem(key)) {
            configuredApiCount++;
        }
    });
    setApiKeysConfiguredCount(configuredApiCount);

  }, []); // No dependencies needed

  // Effect to update badges on mount and on storage changes
  useEffect(() => {
    updateBadgeStatus();
    setMounted(true);

    const handleStorageChange = (event: StorageEvent) => {
        // Check if relevant keys changed or if storage was cleared (event.key === null)
        const relevantKeys = [
            WOO_CONNECTIONS_STORAGE_KEY,
            SHOPIFY_CONNECTIONS_STORAGE_KEY,
            ...RELEVANT_API_KEYS
        ];
        if (event.key === null || (event.key && relevantKeys.includes(event.key))) {
             updateBadgeStatus();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [updateBadgeStatus]); // updateBadgeStatus is memoized

  // Handler for tab changes
  const handleSelectionChange = (key: React.Key) => {
      const newKey = key as string;
      setSelectedTabKey(newKey);
      if (typeof window !== 'undefined') {
          localStorage.setItem(SELECTED_TAB_STORAGE_KEY, newKey);
      }
  };

  // Helper to render Tab Title with Icon and Badge/Indicator
  const renderTabTitle = (iconName: string, title: string, indicator?: React.ReactNode) => {
    const needsBackground = iconName === "logos:woocommerce" || iconName === "logos:shopify";
    return (
      <div className="flex items-center gap-2">
        {needsBackground ? (
          <div className="bg-white rounded-md p-0.5 flex items-center justify-center">
            <Icon icon={iconName} width={16} height={16} />
          </div>
        ) : (
          <Icon icon={iconName} width={18} />
        )}
        <span>{title}</span>
        {indicator}
      </div>
    );
  };

  // Helper to render badge/indicator based on status or count
  const renderIndicator = (isConfigured: boolean, count?: number) => {
    const baseClasses = "ml-1 static right-auto transform-none";
    if (count !== undefined) {
        return count > 0 ? (
            <Chip size="sm" color="success" variant="flat" className={baseClasses}>{count}</Chip>
        ) : (
            <Badge content="" color="default" variant="dot" isInvisible={false} className={baseClasses} />
        );
    } else {
         return <Badge content="" color={isConfigured ? "success" : "default"} variant="dot" isInvisible={false} className={baseClasses} />;
    }
  };

  // --- Render Logic ---
  return (
    <Card {...props} className="overflow-hidden bg-background">
      {/* Skeleton */}
      {!mounted && (
        <div className="p-0">
          <div className="flex items-center gap-4 border-b border-divider px-4 sm:px-6 h-[53px]">
             {[...Array(validTabKeys.length)].map((_, i) => ( // Use dynamic length
                 <div key={i} className="flex items-center gap-2 py-3">
                    <Skeleton className="h-5 w-5 rounded-full bg-default-300 dark:bg-default-200" />
                    <Skeleton className="h-4 w-20 rounded-lg bg-default-300 dark:bg-default-200" />
                 </div>
             ))}
          </div>
           <div className="p-4 sm:p-6 min-h-[200px]">
                <Skeleton className="h-32 w-full rounded-lg bg-default-300 dark:bg-default-200" />
           </div>
        </div>
      )}

      {/* Actual Tabs */}
      {mounted && (
        <Tabs
          aria-label="Settings Sections"
          selectedKey={selectedTabKey}
          onSelectionChange={handleSelectionChange}
          color="primary"
          variant="underlined"
          classNames={{
            base: "w-full",
            tabList: "gap-4 sm:gap-6 border-b border-divider px-4 sm:px-6 overflow-x-auto",
            cursor: "w-full bg-primary",
            tab: "h-auto py-3 px-1",
            tabContent: "group-data-[selected=true]:text-primary text-foreground-500 font-medium",
            panel: "p-4 sm:p-6 bg-background",
          }}
        >
          {/* Account Tab */}
          <Tab key="account" title={renderTabTitle("solar:user-circle-linear", "Account")}>
            <AccountDetails />
          </Tab>

          {/* Notifications Tab */}
          <Tab key="notifications" title={renderTabTitle("solar:bell-outline", "Notifications")}>
            <NotificationsSettings />
          </Tab>

          {/* Security Tab */}
          <Tab key="security" title={renderTabTitle("solar:shield-check-linear", "Security")}>
            <SecuritySettings />
          </Tab>

          {/* WooCommerce Tab */}
          <Tab
            key="woocommerce"
            title={renderTabTitle("logos:woocommerce", "WooCommerce", renderIndicator(wooCount > 0, wooCount))}
          >
            <WooCommerceTab />
          </Tab>

          {/* === Shopify Tab - UPDATED === */}
          <Tab
            key="shopify"
            // Use shopifyCount for the indicator
            title={renderTabTitle("logos:shopify", "Shopify", renderIndicator(shopifyCount > 0, shopifyCount))}
          >
            {/* Use the actual ShopifyTab component */}
            <ShopifyTab />
          </Tab>

          {/* API Keys Tab */}
          <Tab
            key="apikeys"
            title={renderTabTitle("material-symbols:key-outline", "API Keys", renderIndicator(apiKeysConfiguredCount > 0))}
          >
             <ApiKeysTab />
          </Tab>

          {/* Plugin Settings Tab */}
          <Tab
            key="plugin-settings"
            title={
              <div className="flex items-center gap-1">
                <Icon icon="material-symbols:settings-outline" width={20} className="text-foreground/80 hover:text-foreground transition-colors"/>
                <span className="font-medium">Plugin settings</span>
                {renderIndicator(apiKeysConfiguredCount > 0)}
              </div>
            }
          >
          <ApiKeysTab />
        </Tab>

        </Tabs>
      )}
    </Card>
  );
}
