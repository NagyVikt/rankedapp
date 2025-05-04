// app/dashboard/settings/SettingsComponent.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { CardProps } from "@heroui/react";
// Import Skeleton if needed, or rely on HeroUI's
import { Card, Tabs, Tab, Skeleton, Chip, Badge } from "@heroui/react"; // Added Skeleton, Chip, Badge
import { Icon } from "@iconify/react";

// Import your actual tab content components
import AccountDetails from "./account-details";
import NotificationsSettings from "./notifications-settings";
import SecuritySettings from "./security-settings";
import WooCommerceTab from "./WooCommerceTab";
// Import the PARENT tab component for API keys
import ApiKeysTab from "./ApiKeysTab"; // Assuming this renders multiple ApiKeyManagers

// --- LocalStorage Key for Selected Tab ---
const SELECTED_TAB_STORAGE_KEY = "settingsSelectedTab";

// Define valid tab keys for lookup and default
const validTabKeys = ['account', 'notifications', 'security', 'woocommerce', 'apikeys']; // Renamed openai to apikeys

export default function SettingsComponent(props: CardProps) {
  // State for badge indicators
  const [wooCount, setWooCount] = useState<number>(0);
  const [apiKeysConfiguredCount, setApiKeysConfiguredCount] = useState<number>(0); // Track count of configured API keys
  const [mounted, setMounted] = useState(false);

  // Safer way to read initial state from localStorage
  const getInitialTabKey = useCallback((): string => {
      // Only run on client
      if (typeof window !== 'undefined') {
          const storedTabKey = localStorage.getItem(SELECTED_TAB_STORAGE_KEY);
          // Check if the stored key is one of the valid keys
          if (storedTabKey && validTabKeys.includes(storedTabKey)) {
              return storedTabKey;
          }
      }
      return 'account'; // Default to 'account' if nothing valid is stored or SSR
  }, []);

  const [selectedTabKey, setSelectedTabKey] = useState<string>(getInitialTabKey);

  // Function to update badge status from localStorage
  const updateBadgeStatus = useCallback(() => {
    if (typeof window === 'undefined') return; // Ensure runs only on client

    // WooCommerce Count
    const rawWoo = localStorage.getItem("wooConnections");
    let currentWooCount = 0;
    if (rawWoo) {
      try {
        const connections = JSON.parse(rawWoo);
        if (Array.isArray(connections)) {
          currentWooCount = connections.length;
        }
      } catch (e) { console.error("Failed to parse wooConnections", e); }
    }
    setWooCount(currentWooCount);

    // API Keys Count (Check relevant keys)
    // Match the localStorageKeys defined in your ApiKeysTab/ApiKeyManager config
    const relevantApiKeys = ['openaiApiKey', 'geminiApiKey', 'claudeApiKey', 'perplexityApiKey', 'deepseekApiKey'];
    let configuredCount = 0;
    relevantApiKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            configuredCount++;
        }
    });
    setApiKeysConfiguredCount(configuredCount);

  }, []);

  // Effect to update badges on mount and potentially on storage changes
  useEffect(() => {
    updateBadgeStatus();
    setMounted(true);

    // Optional: Listen for storage changes to update badges dynamically
    const handleStorageChange = () => {
        updateBadgeStatus();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [updateBadgeStatus]);

  // Handler for tab changes
  const handleSelectionChange = (key: React.Key) => {
      const newKey = key as string;
      setSelectedTabKey(newKey);
      if (typeof window !== 'undefined') {
          localStorage.setItem(SELECTED_TAB_STORAGE_KEY, newKey);
      }
      // updateBadgeStatus(); // Usually not needed here unless tab switch affects status
  };

  // Helper to render Tab Title with Icon and Badge/Indicator
  const renderTabTitle = (iconName: string, title: string, indicator?: React.ReactNode) => (
    <div className="flex items-center gap-2">
      <Icon icon={iconName} width={18} />
      <span>{title}</span>
      {indicator}
    </div>
  );

  // Helper to render badge/indicator based on status or count
  // Uses HeroUI Chip for count and Badge for status dots
  const renderIndicator = (isConfigured: boolean, count?: number) => {
    const baseClasses = "ml-1.5 static right-auto transform-none"; // Position badge correctly

    if (count !== undefined) { // For WooCommerce count
        return count > 0 ? (
            // Use Chip for count, flat variant looks good in dark mode
            <Chip size="sm" color="success" variant="flat" className={baseClasses}>{count}</Chip>
        ) : (
            // Dot for not configured (default color)
            <Badge content="" color="default" variant="dot" isInvisible={false} className={baseClasses} />
        );
    } else { // For simple boolean status (API Keys)
         // Dot indicator: success if configured, default otherwise
         return <Badge content="" color={isConfigured ? "success" : "default"} variant="dot" isInvisible={false} className={baseClasses} />;
    }
  };

  // --- Render Logic ---
  return (
    // Assuming parent provides dark theme context (e.g., via className="dark")
    // Use theme-aware background for the card
    <Card {...props} className="overflow-hidden bg-background">

      {/* Skeleton only shown before mount - Use theme aware colors */}
      {!mounted && (
        <div className="p-0">
          {/* Skeleton for Tab Headers */}
          <div className="flex items-center gap-4 border-b border-divider px-4 sm:px-6 h-[53px]"> {/* Theme border */}
             {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex items-center gap-2 py-3">
                    <Skeleton className="h-5 w-5 rounded-full bg-default-300 dark:bg-default-200" />
                    <Skeleton className="h-4 w-20 rounded-lg bg-default-300 dark:bg-default-200" />
                 </div>
             ))}
          </div>
           {/* Placeholder for content area */}
           <div className="p-4 sm:p-6 min-h-[200px]">
                {/* Use theme aware skeleton color */}
                <Skeleton className="h-32 w-full rounded-lg bg-default-300 dark:bg-default-200" />
           </div>
        </div>
      )}

      {/* Actual Tabs (Rendered after mount) */}
      {mounted && (
        <Tabs
          aria-label="Settings Sections"
          selectedKey={selectedTabKey}
          onSelectionChange={handleSelectionChange}
          color="primary" // Use primary color for active indicator
          variant="underlined" // Underlined variant often preferred for settings tabs
          // Use classNames to fine-tune appearance for dark mode
          classNames={{
            base: "w-full", // Ensure tabs take full width
            tabList: "gap-4 sm:gap-6 border-b border-divider px-4 sm:px-6 overflow-x-auto", // Use theme divider color
            cursor: "w-full bg-primary", // Indicator line color
            tab: "h-auto py-3 px-1", // Adjust vertical padding of tab trigger
            // Tab Content text color: Use theme's primary for selected, and a muted foreground color otherwise
            tabContent: "group-data-[selected=true]:text-primary text-foreground-500 font-medium",
            panel: "p-4 sm:p-6 bg-background", // Ensure content panel has correct dark background
          }}
        >
          {/* === Account Tab === */}
          <Tab
            key="account"
            title={renderTabTitle("solar:user-circle-linear", "Account")}
          >
            {/* Content component should handle its own dark theme */}
            <AccountDetails />
          </Tab>

          {/* === Notifications Tab === */}
          <Tab
            key="notifications"
            title={renderTabTitle("solar:bell-outline", "Notifications")}
          >
             {/* Content component should handle its own dark theme */}
            <NotificationsSettings />
          </Tab>

          {/* === Security Tab === */}
          <Tab
            key="security"
            title={renderTabTitle("solar:shield-check-linear", "Security")}
          >
             {/* Content component should handle its own dark theme */}
            <SecuritySettings />
          </Tab>

          {/* === WooCommerce Tab === */}
          <Tab
            key="woocommerce"
            // Render title with indicator (count or dot)
            title={renderTabTitle("logos:woocommerce", "WooCommerce", renderIndicator(wooCount > 0, wooCount))}
          >
            {/* Content component should handle its own dark theme */}
            <WooCommerceTab />
          </Tab>

          {/* === API Keys Tab (using 'apikeys' as key) === */}
          <Tab
            key="apikeys" // Use the key defined in validTabKeys
            // Render title with indicator (dot based on any key configured)
            title={renderTabTitle("material-symbols:key-outline", "API Keys", renderIndicator(apiKeysConfiguredCount > 0))}
          >
             {/* Content component should handle its own dark theme */}
             {/* Ensure ApiKeysTab component renders the list of ApiKeyManagers */}
             <ApiKeysTab />
          </Tab>

              {/* === API Keys Tab (using 'apikeys' as key) === */}
              <Tab
            key="plugin" // Use the key defined in validTabKeys
            // Render title with indicator (dot based on any key configured)
            title={renderTabTitle("material-symbols:key-outline", "Plugin settings", renderIndicator(apiKeysConfiguredCount > 0))}
          >
             {/* Content component should handle its own dark theme */}
             {/* Ensure ApiKeysTab component renders the list of ApiKeyManagers */}
             <ApiKeysTab />
          </Tab>

        </Tabs>
      )}
    </Card>
  );
}