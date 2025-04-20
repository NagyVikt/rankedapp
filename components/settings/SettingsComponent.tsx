// app/dashboard/settings/SettingsComponent.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { CardProps } from "@heroui/react";
import { Card, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";

import AccountDetails from "./account-details";
import NotificationsSettings from "./notifications-settings";
import SecuritySettings from "./security-settings";
import WooCommerceTab from "./WooCommerceTab";

export default function SettingsComponent(props: CardProps) {
  // number of WooCommerce connections
  const [count, setCount] = useState<number>(0);
  // mounted flag to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // after mount, we can safely access localStorage
    const raw = localStorage.getItem("wooConnections");
    const connections = raw ? JSON.parse(raw) : [];
    setCount(Array.isArray(connections) ? connections.length : 0);
    setMounted(true);
  }, []);

  return (
    <Card {...props}>
      <Tabs
        size="lg"
        classNames={{
          tabList: "mx-4 mt-6 flex items-center justify-center gap-8",
          tabContent: "px-6 pb-6",
        }}
      >
        {/* Account */}
        <Tab
          key="account"
          textValue="Account"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:user-id-bold" width={20} />
              <p>Account</p>
            </div>
          }
        >
          <AccountDetails className="p-4 shadow-none" />
        </Tab>

        {/* Notifications */}
        <Tab
          key="notifications"
          textValue="Notifications"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:bell-bold" width={20} />
              <p>Notifications</p>
            </div>
          }
        >
          <NotificationsSettings className="p-4 shadow-none" />
        </Tab>

        {/* Security */}
        <Tab
          key="security"
          textValue="Security"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="solar:shield-keyhole-bold" width={20} />
              <p>Security</p>
            </div>
          }
        >
          <SecuritySettings className="p-4 shadow-none" />
        </Tab>

        {/* WooCommerce */}
        <Tab
          key="woocommerce"
          textValue="WooCommerce"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="logos:woocommerce" width={20} />
              <p>WooCommerce</p>
              {/* only render badge after hydration */}
              {mounted && (
                <span
                  className={
                    `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ` +
                    (count > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700")
                  }
                >
                  <span
                    className={
                      `h-2 w-2 rounded-full ` +
                      (count > 0 ? "bg-green-500" : "bg-red-500")
                    }
                  />
                  {count}
                </span>
              )}
            </div>
          }
        >
          <WooCommerceTab />
        </Tab>
      </Tabs>
    </Card>
  );
}