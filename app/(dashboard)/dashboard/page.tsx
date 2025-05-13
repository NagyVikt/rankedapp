// src/app/dashboard/page.tsx (or your specific path)
'use client'; // For client-side interactivity if needed in child components

import React from 'react';
import { Icon } from '@iconify/react'; // Using Iconify for icons

/**
 * @module DashboardHome
 * @description
 * This is the main landing page for the user's dashboard.
 * It provides a welcome message, quick help for getting started (like adding a webshop),
 * and displays key performance indicators (KPIs) and a sales graph.
 *
 * @component
 * @returns {JSX.Element} The rendered dashboard home page.
 */
export default function DashboardHome() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-foreground">
      {' '}
      {/* Added container and more vertical spacing */}
      {/* Welcome Section */}
      <section className="bg-background dark:bg-default-50 p-6 sm:p-8 rounded-xl shadow-lg border border-divider">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div>
            <Icon
              icon="lucide:layout-dashboard"
              className="text-5xl sm:text-6xl text-primary"
            />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-base sm:text-lg text-foreground-700 dark:text-foreground-300">
              This is your central hub for managing your webshops, tracking
              performance, and accessing all our tools. Let's get you started!
            </p>
          </div>
        </div>
      </section>
      {/* Quick Help & Getting Started Section */}
      <section className="bg-content1 dark:bg-content1 p-6 sm:p-8 rounded-xl shadow-md border border-divider">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 flex items-center gap-3 text-foreground-800 dark:text-foreground-200">
          <Icon icon="lucide:help-circle" className="text-3xl text-secondary" />
          Quick Help & Getting Started
        </h2>

        <div className="space-y-6">
          {/* How to Add a Webshop */}
          <div className="p-4 sm:p-6 bg-background dark:bg-default-100 rounded-lg border border-divider transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-medium mb-3 flex items-center gap-2 text-primary">
              <Icon icon="lucide:plus-circle" className="text-2xl" />
              Creating Your First Webshop
            </h3>
            <p className="text-foreground-700 dark:text-foreground-400 text-sm sm:text-base leading-relaxed">
              To start using our platform and see your data, you'll need to add
              a webshop. It's simple:
            </p>
            <ol className="list-decimal list-inside mt-3 space-y-2 text-foreground-600 dark:text-foreground-500 text-sm sm:text-base">
              <li>Look at the sidebar menu on your left.</li>
              <li>
                Find the "<strong>Webshops</strong>" item.
              </li>
              <li>
                Click on the{' '}
                <Icon
                  icon="lucide:plus"
                  className="inline-block text-lg text-primary mx-1"
                />{' '}
                icon located to the right of "Webshops".
              </li>
              <li>A dialog will appear. Enter your shop's name and URL.</li>
              <li>
                Click "<strong>Add Shop</strong>", and you're all set!
              </li>
            </ol>
            <p className="mt-4 text-xs text-foreground-500 dark:text-foreground-600">
              Once added, your webshop will appear in the list, and you can
              start integrating our tools.
            </p>
          </div>

          {/* Other Quick Help Items (Placeholder) */}
          <div className="p-4 sm:p-6 bg-background dark:bg-default-100 rounded-lg border border-divider transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-medium mb-3 flex items-center gap-2 text-foreground-800 dark:text-foreground-200">
              <Icon
                icon="lucide:settings-2"
                className="text-2xl text-secondary"
              />
              Exploring Other Tools
            </h3>
            <p className="text-foreground-700 dark:text-foreground-400 text-sm sm:text-base">
              Navigate through the sidebar to discover tools like the Email
              Designer, Campaign Manager, AI Agents, and more. Each section is
              designed to help you grow and manage your online presence
              effectively.
            </p>
          </div>
        </div>
      </section>
      {/* KPI Stats Section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-foreground-800 dark:text-foreground-200">
          <Icon
            icon="lucide:bar-chart-big"
            className="inline-block mr-2 text-2xl text-primary"
          />
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for KPI cards. Replace with actual components or data. */}
          {/* Example KPI Card 1 */}
          <div className="bg-content1 dark:bg-content1 p-6 rounded-xl shadow-md border border-divider">
            <h3 className="text-lg font-medium text-foreground-700 dark:text-foreground-300 mb-1">
              Total Sales
            </h3>
            <p className="text-3xl font-bold text-primary">$0.00</p>
            <p className="text-sm text-success-600 dark:text-success-400 mt-1">
              +0% from last month
            </p>
          </div>
          {/* Example KPI Card 2 */}
          <div className="bg-content1 dark:bg-content1 p-6 rounded-xl shadow-md border border-divider">
            <h3 className="text-lg font-medium text-foreground-700 dark:text-foreground-300 mb-1">
              New Customers
            </h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
              -0% from last month
            </p>
          </div>
          {/* Example KPI Card 3 */}
          <div className="bg-content1 dark:bg-content1 p-6 rounded-xl shadow-md border border-divider">
            <h3 className="text-lg font-medium text-foreground-700 dark:text-foreground-300 mb-1">
              Active Campaigns
            </h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-foreground-500 dark:text-foreground-600 mt-1">
              Across all webshops
            </p>
          </div>
          {/* Add more KPI cards as needed */}
        </div>
      </section>
      {/* Sales Graph Section */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-foreground-800 dark:text-foreground-200">
          <Icon
            icon="lucide:line-chart"
            className="inline-block mr-2 text-2xl text-primary"
          />
          Sales Overview
        </h2>
        <div className="bg-content1 dark:bg-content1 p-4 sm:p-6 rounded-xl shadow-md border border-divider min-h-[300px] flex items-center justify-center">
          {/* Placeholder for Sales Graph. Replace with your charting component. */}
          <p className="text-foreground-500 dark:text-foreground-600">
            Sales graph will be displayed here.
          </p>
        </div>
      </section>
    </div>
  );
}
