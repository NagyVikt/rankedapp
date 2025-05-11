// src/components/sidebar/sidebar-items.ts

import React from 'react';
import { Chip } from '@heroui/react'; // Assuming this is the correct import path
import { Icon } from '@iconify/react';

// Defines types for sidebar entries
export enum SidebarItemType {
  Nest = 'nest',
  Dropdown = 'dropdown',
  EmailStatsToggle = 'emailStatsToggle', // New type for the toggle
}

export interface SidebarItem {
  key: string;
  title: string;
  icon?: string;
  href?: string;
  type?: SidebarItemType;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode | ((props: { onOpenModal?: () => void, isItemActive?: boolean, isItemOpen?: boolean, onToggle?: () => void }) => React.ReactNode); // Added onToggle for EmailStatsToggle
  items?: SidebarItem[];
  className?: string;
  onClick?: () => void;
  isStatistic?: boolean;
  statisticValue?: string | number;
  isInitiallyOpen?: boolean; // For dropdowns or initially visible stats
}

// Defines the structure for a section in the sidebar
export interface SidebarSection {
  key:string;
  title?: string;
  items: SidebarItem[];
  className?: string;
  isHidden?: boolean;
  isCollapsed?: boolean; // For collapsible sections
}

// New structured navigation items
export const navigationSections: SidebarSection[] = [
  {
    key: 'main',
    items: [
      {
        key: 'webshops',
        href: '/dashboard/webshops',
        icon: 'solar:shop-bold-duotone',
        title: 'Webshops',
        className: 'bg-[#f55200] hover:bg-[#E64A00] hover:shadow-xl text-white font-semibold shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-background dark:focus:ring-offset-default-50 transition-all duration-150 ease-in-out transform hover:scale-[1.01]',
        endContent: ({ onOpenModal }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onOpenModal) onOpenModal();
            }}
            className="p-1 hover:bg-black/20 rounded-md transition-colors"
            aria-label="Add new webshop"
          >
            <Icon icon="mdi:plus-circle-outline" width={22} height={22} className="text-white/90 hover:text-white" />
          </button>
        ),
      },
      {
        key: 'tasks',
        href: '/dashboard/tasks',
        icon: 'solar:checklist-minimalistic-bold-duotone',
        title: 'Tasks',
        endContent: <Icon icon="solar:add-circle-line-duotone" className="text-default-400" width={24} />,
      },
      {
        key: 'gallery',
        href: '/dashboard/ads',
        icon: 'solar:gallery-wide-bold-duotone',
        title: 'Gallery',
        endContent: <Chip size="sm" variant="flat" color="warning" className="text-xs">HOT</Chip>,
      },
      {
        key: 'satori',
        href: '/dashboard/satori',
        icon: 'solar:magic-stick-3-bold-duotone',
        title: 'Satori - Ad designer',
      },
    ],
  },
  {
    key: 'emails',
    title: 'Email Tools',
    className: 'mt-4 pt-2',
    isCollapsed: false,
    items: [
      {
        key: 'email-designer',
        href: '/dashboard/emails',
        icon: 'solar:palette-bold-duotone',
        title: 'Email Designer',
        endContent: <Chip size="sm" variant="flat" color="success" className="text-xs">New</Chip>,
      },
      {
        key: 'campaign-manager',
        icon: 'solar:target-bold-duotone',
        title: 'Campaign Manager',
        type: SidebarItemType.Dropdown,
        isInitiallyOpen: false,
        endContent: ({ isItemOpen }) => (
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="bordered" className="text-xs text-default-600 dark:text-default-400">Active: 5</Chip>
            <Icon icon={isItemOpen ? "mdi:chevron-up" : "mdi:chevron-down"} width={18} className="text-default-400" />
          </div>
        ),
        items: [
          { key: 'create-campaign', href: '/dashboard/emails/campaign-manager/create', title: 'Create Campaign', icon: 'solar:add-circle-line-duotone' },
          { key: 'view-campaigns', href: '/dashboard/emails/campaign-manager/view', title: 'View Campaigns', icon: 'solar:eye-scan-linear' },
          { key: 'edit-campaign', href: '/dashboard/emails/campaign-manager/edit', title: 'Edit Campaign', icon: 'solar:pen-new-square-linear' },
        ],
      },
      {
        key: 'sent-emails',
        href: '/dashboard/emails/sent-emails',
        icon: 'solar:inbox-out-bold-duotone',
        title: 'Sent Emails',
        endContent: <Chip size="sm" variant="bordered" className="text-xs text-default-700 dark:text-default-300">27.8K</Chip>,
      },
      // Toggle for email statistics
      {
        key: 'email-stats-toggle',
        title: 'Show Email Stats', // Title won't be directly visible, used for key and logic
        type: SidebarItemType.EmailStatsToggle,
        isInitiallyOpen: false, // Stats are visible by default
        // The endContent will render the toggle button in SidebarComponent
        endContent: ({ isItemOpen, onToggle }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onToggle) onToggle();
            }}
            className="flex items-center justify-start w-full text-xs text-default-500 hover:text-primary px-3 py-1.5 rounded-md hover:bg-default-100 dark:hover:bg-default-50 gap-2"
            aria-label={isItemOpen ? "Hide email statistics" : "Show email statistics"}
          >
            <Icon icon={isItemOpen ? "solar:eye-closed-bold-duotone" : "solar:eye-bold-duotone"} width={16} />
            <span>{isItemOpen ? "Hide Stats" : "Show Stats"}</span>
          </button>
        ),
      },
      // Statistic items for email details - their visibility will be controlled by the toggle
      {
        key: 'all-emails-stat',
        title: 'ALL EMAILS', // Simplified title
        icon: 'solar:letter-bold-duotone', // Icon for all emails
        isStatistic: true,
        statisticValue: '27,800',
        className: 'text-xs text-default-600 dark:text-default-400 px-3 pt-1.5', // Adjusted padding
      },
      {
        key: 'new-emails-stat',
        title: 'This Month', // Simplified title
        icon: 'solar:mailbox-bold-duotone', // Icon for new emails
        isStatistic: true,
        statisticValue: '2,700',
        className: 'text-xs text-default-600 dark:text-default-400 px-3',
      },
      {
        key: 'views-stat',
        title: 'Views', // Simplified title
        icon: 'solar:graph-up-bold-duotone', // Icon for views
        isStatistic: true,
        statisticValue: '300',
        className: 'text-xs text-default-600 dark:text-default-400 px-3 pb-1.5', // Adjusted padding
      },
    ],
  },
  {
    key: 'general',
    title: 'General',
    className: 'mt-4 pt-2',
    isCollapsed: false,
    items: [
      {
        key: 'analytics',
        href: '/dashboard/analytics',
        icon: 'solar:chart-square-bold-duotone',
        title: 'Analytics',
      },
      {
        key: 'ai-agents',
        href: '/dashboard/tracker',
        icon: 'solar:user-heart-bold-duotone',
        title: 'AI Agents',
        endContent: <Chip size="sm" variant="flat" color="success" className="text-xs">New</Chip>,
      },
      {
        key: 'settings',
        href: '/dashboard/settings',
        icon: 'solar:settings-bold-duotone',
        title: 'Settings',
        // endContent: <Chip size="sm" variant="flat" color="secondary" className="text-xs">WIP</Chip>,
      },
    ],
  },
];

// TeamAvatar component definition
const TeamAvatar = ({ name }: { name: string }) => (
  <div className="w-6 h-6 bg-default-200 dark:bg-default-100 rounded-full flex items-center justify-center text-xs text-default-600 dark:text-default-400">
    {name.substring(0, 2).toUpperCase()}
  </div>
);

// Example of nested section items (remains for other potential uses)
export const sectionItems: SidebarSection[] = [
  {
    key: 'overview_group',
    title: 'Overview',
    items: [
      ...(navigationSections.find(s => s.key === 'main')?.items.slice(0, 3) || [])
    ]
  },
  {
    key: 'organization',
    title: 'Organization',
    items: [
      {
        key: 'cap_table',
        title: 'Cap Table',
        icon: 'solar:pie-chart-2-outline',
        type: SidebarItemType.Nest,
        items: [
          { key: 'shareholders', href: '/dashboard/cap-table/shareholders', title: 'Shareholders', icon: 'solar:users-group-rounded-linear' },
          { key: 'note_holders', href: '/dashboard/cap-table/note-holders', title: 'Note Holders', icon: 'solar:notes-outline' },
          { key: 'transactions', href: '/dashboard/cap-table/transactions', title: 'Transactions Log', icon: 'solar:clipboard-list-linear' },
        ],
      },
      ...(navigationSections.find(s => s.key === 'general')?.items.filter(i => ['analytics', 'settings'].includes(i.key)) || [])
    ],
  },
  {
    key: 'your-teams',
    title: 'Your Teams',
    items: [
      { key: 'heroui', href: '/dashboard/team/heroui', title: 'HeroUI', startContent: <TeamAvatar name="Hero UI" /> },
      { key: 'tailwind-variants', href: '/dashboard/team/tailwind-variants', title: 'Tailwind Variants', startContent: <TeamAvatar name="Tailwind Variants" /> },
      { key: 'heroui-pro', href: '/dashboard/team/heroui-pro', title: 'HeroUI Pro', startContent: <TeamAvatar name="HeroUI Pro" /> },
    ],
  },
];