"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { CardProps } from "@heroui/react";
import { Card, Tabs, Tab, Skeleton, Chip, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";

// Aliases to force valid JSX element types
const CardX = Card as any;
const TabsX = Tabs as any;
const TabX = Tab as any;
const SkeletonX = Skeleton as any;

// Import your actual tab content components
import AccountDetails from "./account-details";
import NotificationsSettings from "./notifications-settings";
import SecuritySettings from "./security-settings";
import WooCommerceTab from "./WooCommerceTab";
import ShopifyTab from "./ShopifyTab";
import ApiKeysTab from "./ApiKeysTab";

// --- LocalStorage Keys ---
const SELECTED_TAB_STORAGE_KEY = "settingsSelectedTab";
const WOO_CONNECTIONS_STORAGE_KEY = "wooConnections";
const SHOPIFY_CONNECTIONS_STORAGE_KEY = "shopifyConnections";
const RELEVANT_API_KEYS = [
  'openaiApiKey',
  'geminiApiKey',
  'claudeApiKey',
  'perplexityApiKey',
  'deepseekApiKey'
];

type TabKey =
  | 'account'
  | 'notifications'
  | 'security'
  | 'woocommerce'
  | 'shopify'
  | 'apikeys'
  | 'plugin-settings';

export default function SettingsComponent(props: CardProps): JSX.Element {
  const [wooCount, setWooCount] = useState<number>(0);
  const [shopifyCount, setShopifyCount] = useState<number>(0);
  const [apiKeysConfiguredCount, setApiKeysConfiguredCount] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  const getInitialTabKey = useCallback((): TabKey => {
    if (typeof window === 'undefined') return 'account';
    const stored = localStorage.getItem(SELECTED_TAB_STORAGE_KEY) as TabKey | null;
    if (
      stored &&
      ['account', 'notifications', 'security', 'woocommerce', 'shopify', 'apikeys', 'plugin-settings'].includes(stored)
    ) {
      return stored;
    }
    return 'account';
  }, []);

  const [selectedTabKey, setSelectedTabKey] = useState<TabKey>(getInitialTabKey);

  const updateBadgeStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    let count = 0;
    try {
      const arr = JSON.parse(localStorage.getItem(WOO_CONNECTIONS_STORAGE_KEY) || '[]');
      if (Array.isArray(arr)) count = arr.length;
    } catch {}
    setWooCount(count);

    count = 0;
    try {
      const arr = JSON.parse(localStorage.getItem(SHOPIFY_CONNECTIONS_STORAGE_KEY) || '[]');
      if (Array.isArray(arr)) count = arr.length;
    } catch {}
    setShopifyCount(count);

    setApiKeysConfiguredCount(
      RELEVANT_API_KEYS.reduce((sum, key) => sum + (localStorage.getItem(key) ? 1 : 0), 0)
    );
  }, []);

  useEffect(() => {
    updateBadgeStatus();
    setMounted(true);

    const onStorage = (e: StorageEvent) => {
      const keys = [WOO_CONNECTIONS_STORAGE_KEY, SHOPIFY_CONNECTIONS_STORAGE_KEY, ...RELEVANT_API_KEYS];
      if (e.key === null || keys.includes(e.key)) {
        updateBadgeStatus();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [updateBadgeStatus]);

  const handleSelectionChange = (key: string) => {
    const tab = key as TabKey;
    setSelectedTabKey(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SELECTED_TAB_STORAGE_KEY, tab);
    }
  };

  const renderIndicator = (count?: number, configured?: boolean) => {
    const base = "ml-1 static right-auto transform-none";
    if (count !== undefined) {
      return count > 0
        ? React.createElement(Chip as any, { size: "sm", color: "success", variant: "flat", className: base }, count)
        : React.createElement(Badge as any, { color: "default", variant: "dot", isInvisible: false, className: base });
    }
    return React.createElement(Badge as any, {
      color: configured ? "success" : "default",
      variant: "dot",
      isInvisible: false,
      className: base,
    });
  };

  const renderTabTitle = (icon: string, title: string, indicator?: React.ReactNode) => {
    const iconElem = React.createElement(Icon, { icon, width: icon.startsWith('logos:') ? 16 : 18 });
    const wrappedIcon = icon.startsWith('logos:')
      ? React.createElement(
          'div',
          { className: 'bg-white rounded-md p-0.5 flex items-center justify-center' },
          iconElem
        )
      : iconElem;

    return React.createElement(
      'div',
      { className: 'flex items-center gap-2' },
      wrappedIcon,
      React.createElement('span', null, title),
      indicator
    );
  };

  return React.createElement(
    CardX,
    { ...props, className: "overflow-hidden bg-background" },
    !mounted
      ? React.createElement(
          'div',
          { className: 'p-0' },
          React.createElement(
            'div',
            { className: 'flex items-center gap-4 border-b border-divider px-4 sm:px-6 h-[53px]' },
            ...Array.from({ length: 7 }).map((_, i) =>
              React.createElement(
                'div',
                { key: i, className: 'flex items-center gap-2 py-3' },
                React.createElement(SkeletonX, { className: 'h-5 w-5 rounded-full bg-default-300 dark:bg-default-200' }),
                React.createElement(SkeletonX, { className: 'h-4 w-20 rounded-lg bg-default-300 dark:bg-default-200' })
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'p-4 sm:p-6 min-h-[200px]' },
            React.createElement(SkeletonX, { className: 'h-32 w-full rounded-lg bg-default-300 dark:bg-default-200' })
          )
        )
      : null,
    mounted
      ? React.createElement(
          TabsX,
          {
            'aria-label': 'Settings Sections',
            value: selectedTabKey,
            onValueChange: handleSelectionChange,
            color: 'primary',
            variant: 'underlined',
            classNames: {
              base: 'w-full',
              tabList: 'gap-4 sm:gap-6 border-b border-divider px-4 sm:px-6 overflow-x-auto',
              tab: 'h-auto py-3 px-1',
              tabContent: 'group-data-[selected=true]:text-primary text-foreground-500 font-medium',
              panel: 'p-4 sm:p-6 bg-background',
            },
          },
          React.createElement(TabX, { value: 'account', title: renderTabTitle('solar:user-circle-linear', 'Account') }, React.createElement(AccountDetails)),
          React.createElement(TabX, { value: 'notifications', title: renderTabTitle('solar:bell-outline', 'Notifications') }, React.createElement(NotificationsSettings)),
          React.createElement(TabX, { value: 'security', title: renderTabTitle('solar:shield-check-linear', 'Security') }, React.createElement(SecuritySettings)),
          React.createElement(TabX, { value: 'woocommerce', title: renderTabTitle('logos:woocommerce', 'WooCommerce', renderIndicator(wooCount)) }, React.createElement(WooCommerceTab)),
          React.createElement(TabX, { value: 'shopify', title: renderTabTitle('logos:shopify', 'Shopify', renderIndicator(shopifyCount)) }, React.createElement(ShopifyTab)),
          React.createElement(TabX, { value: 'apikeys', title: renderTabTitle('material-symbols:key-outline', 'API Keys', renderIndicator(undefined, apiKeysConfiguredCount > 0)) }, React.createElement(ApiKeysTab)),
          React.createElement(TabX, { value: 'plugin-settings', title: renderTabTitle('material-symbols:settings-outline', 'Plugin settings', renderIndicator(undefined, apiKeysConfiguredCount > 0)) }, React.createElement(ApiKeysTab))
        )
      : null
  );
}
