// app/dashboard/settings/SettingsComponent.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { CardProps } from "@heroui/react"; // Adjust import path if needed
import { Card, Tabs, Tab } from "@heroui/react"; // Adjust import path if needed
import { Icon } from "@iconify/react";

// Import your actual tab content components
// Ensure these paths are correct relative to this file
import AccountDetails from "./account-details";
import NotificationsSettings from "./notifications-settings";
import SecuritySettings from "./security-settings";
import WooCommerceTab from "./WooCommerceTab";
import OpenAITab from "./OpenAITab";

// --- Generic Skeleton Base (Only for Tab Headers now) ---
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

// --- Specific Skeleton Components Removed ---

// --- LocalStorage Key for Selected Tab ---
const SELECTED_TAB_STORAGE_KEY = "settingsSelectedTab";

export default function SettingsComponent(props: CardProps) {
  // State for WooCommerce connection count
  const [wooCount, setWooCount] = useState<number>(0);
  // State for OpenAI configuration status
  const [openAIConfigured, setOpenAIConfigured] = useState<boolean>(false);
  // State for the currently selected tab key - Read initial value synchronously
  const [selectedTabKey, setSelectedTabKey] = useState<string>(() => {
      if (typeof window !== 'undefined') {
          const storedTabKey = localStorage.getItem(SELECTED_TAB_STORAGE_KEY);
          const validTabKeys = ['account', 'notifications', 'security', 'woocommerce', 'openai'];
          if (storedTabKey && validTabKeys.includes(storedTabKey)) {
              return storedTabKey;
          }
      }
      return 'account'; // Default
  });
  // Mounted flag - controls skeleton visibility for tab headers and badge updates
  const [mounted, setMounted] = useState(false);

  // Function to update badge status from localStorage
  const updateBadgeStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
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
    // OpenAI Status
    const openAIKey = localStorage.getItem("openaiApiKey");
    setOpenAIConfigured(!!openAIKey);
  }, []);

  // Effect to update badges and set mounted flag
  useEffect(() => {
    updateBadgeStatus();
    setMounted(true);
  }, [updateBadgeStatus]);

  // Handler for tab changes
  const handleSelectionChange = (key: React.Key) => {
      const newKey = key as string;
      setSelectedTabKey(newKey);
      if (typeof window !== 'undefined') {
          localStorage.setItem(SELECTED_TAB_STORAGE_KEY, newKey);
      }
      updateBadgeStatus();
  };

  // --- Refined Tab Styling ---
  const tabTitleBaseClasses = "relative flex items-center gap-2 px-3 py-3 text-sm font-medium cursor-pointer border-b-2 -mb-px";
  const tabTitleActiveClasses = "text-indigo-600 border-indigo-600";
  const tabTitleInactiveClasses = "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300";

  // --- Render Logic ---
  return (
    <Card {...props} className="overflow-hidden">
      {/* Skeleton for Tab Headers (Only shown before mount) */}
      {!mounted && (
        <div className="p-0">
          {/* Skeleton for Tab Headers */}
          <div className="flex items-center gap-4 border-b border-gray-200 px-4 sm:px-6 h-[53px]"> {/* Match approx height, removed mb-6 */}
             {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex items-center gap-2 px-3 py-3">
                    <SimpleSkeleton className="h-5 w-5 rounded" /> {/* Icon Skeleton */}
                    <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Text Skeleton */}
                 </div>
             ))}
          </div>
          {/* Removed the generic content skeleton from here */}
          {/* Optional: Add a min-height to the content area if needed to prevent layout shifts */}
           <div className="p-4 sm:p-6 min-h-[200px]"> {/* Example min-height */}
                {/* Content area is empty until mounted */}
           </div>
        </div>
      )}

      {/* Actual Tabs (Rendered after mount) */}
      {mounted && (
        <Tabs
          aria-label="Settings Sections"
          selectedKey={selectedTabKey}
          onSelectionChange={handleSelectionChange}
          classNames={{
            tabList: "flex items-center gap-4 sm:gap-6 border-b border-gray-200 px-4 sm:px-6 overflow-x-auto",
            cursor: "hidden",
            tabContent: "p-4 sm:p-6", // Apply padding to actual content area
          }}
        >
          {/* === Account Tab === */}
          <Tab
            key="account"
            title={
              <div className={`${tabTitleBaseClasses} ${selectedTabKey === 'account' ? tabTitleActiveClasses : tabTitleInactiveClasses}`}>
                <Icon icon="solar:user-circle-linear" width={18} />
                <span>Account</span>
              </div>
            }
          >
            <AccountDetails />
          </Tab>

          {/* === Notifications Tab === */}
          <Tab
            key="notifications"
            title={
              <div className={`${tabTitleBaseClasses} ${selectedTabKey === 'notifications' ? tabTitleActiveClasses : tabTitleInactiveClasses}`}>
                <Icon icon="solar:bell-outline" width={18} />
                <span>Notifications</span>
              </div>
            }
          >
            <NotificationsSettings />
          </Tab>

          {/* === Security Tab === */}
          <Tab
            key="security"
            title={
              <div className={`${tabTitleBaseClasses} ${selectedTabKey === 'security' ? tabTitleActiveClasses : tabTitleInactiveClasses}`}>
                <Icon icon="solar:shield-check-linear" width={18} />
                <span>Security</span>
              </div>
            }
          >
            <SecuritySettings />
          </Tab>

          {/* === WooCommerce Tab === */}
          <Tab
            key="woocommerce"
            title={
              <div className={`${tabTitleBaseClasses} ${selectedTabKey === 'woocommerce' ? tabTitleActiveClasses : tabTitleInactiveClasses}`}>
                <Icon icon="logos:woocommerce" width={18} />
                <span>WooCommerce</span>
                {wooCount > 0 ? (
                  <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {wooCount}
                  </span>
                ) : (
                   <span className="ml-1.5 inline-block h-2 w-2 bg-gray-400 rounded-full" title="Not Configured"></span>
                )}
              </div>
            }
          >
            <WooCommerceTab />
          </Tab>

          {/* === OpenAI Tab === */}
          <Tab
            key="openai"
            title={
              <div className={`${tabTitleBaseClasses} ${selectedTabKey === 'openai' ? tabTitleActiveClasses : tabTitleInactiveClasses}`}>
                <Icon icon="simple-icons:openai" width={18} />
                <span>OpenAI</span>
                 <span
                   className={`ml-1.5 inline-block h-2 w-2 rounded-full ${openAIConfigured ? 'bg-green-500' : 'bg-gray-400'}`}
                   title={openAIConfigured ? 'Configured' : 'Not Configured'}
                 ></span>
              </div>
            }
          >
            <OpenAITab />
          </Tab>

        </Tabs>
      )}
    </Card>
  );
}
