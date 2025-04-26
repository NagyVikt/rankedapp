import React from 'react';
import { Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import TeamAvatar from './team-avatar';

// Defines types for sidebar entries
export enum SidebarItemType {
  Nest = 'nest',
}

export interface SidebarItem {
  key: string;
  title: string;
  icon?: string;
  href?: string;
  type?: SidebarItemType;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  items?: SidebarItem[];
  className?: string;
}

// Primary flat list
export const items: SidebarItem[] = [
  { key: 'home',      href: '/dashboard',               icon: 'solar:home-2-linear',                 title: 'Home' },
  { key: 'webshops',  href: '/dashboard/webshops',      icon: 'solar:widget-2-outline',             title: 'Webshops'  },
  { key: 'tasks',     href: '/dashboard/tasks',         icon: 'solar:checklist-minimalistic-outline',title: 'Tasks',    endContent: <Icon icon="solar:add-circle-line-duotone" className="text-default-400" width={24}/> },
  { key: 'team',      href: '/dashboard/team',          icon: 'solar:users-group-two-rounded-outline', title: 'Team' },
  { key: 'emails',   href: '/dashboard/emails',       icon: 'solar:sort-by-time-linear',           title: 'Email Designer', endContent: <Chip size="sm" variant="flat">New</Chip> },
  { key: 'campaign-maanger',   href: '/dashboard/emails/campaign-manager',       icon: 'solar:sort-by-time-linear',           title: 'Advertising campaign', endContent: <Chip size="sm" variant="flat">Manager</Chip> },

  { key: 'tracker',   href: '/dashboard/tracker',       icon: 'solar:sort-by-time-linear',           title: 'AI JOB tracker', endContent: <Chip size="sm" variant="flat">New</Chip> },

  { key: 'analytics', href: '/dashboard/analytics',     icon: 'solar:chart-outline',                 title: 'Analytics' },
  { key: 'settings',  href: '/dashboard/settings',      icon: 'solar:settings-outline',              title: 'Settings' },
];

// Example of nested section items
export const sectionItems: SidebarItem[] = [
  {
    key: 'overview',
    title: 'Overview',
    items: items.slice(0, 5),
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
          { key: 'shareholders',   href: '/dashboard/cap-table/shareholders',   title: 'Shareholders',   icon: 'solar:users-group-rounded-linear' },
          { key: 'note_holders',   href: '/dashboard/cap-table/note-holders',  title: 'Note Holders',   icon: 'solar:notes-outline' },
          { key: 'transactions',   href: '/dashboard/cap-table/transactions', title: 'Transactions Log',icon: 'solar:clipboard-list-linear' },
        ],
      },
      ...items.filter(i => ['analytics','perks','expenses','settings'].includes(i.key))
    ],
  },
  {
    key: 'your-teams',
    title: 'Your Teams',
    items: [
      { key: 'heroui',             href: '/dashboard/team/heroui',             title: 'HeroUI',            startContent: <TeamAvatar name="Hero UI" /> },
      { key: 'tailwind-variants', href: '/dashboard/team/tailwind-variants', title: 'Tailwind Variants', startContent: <TeamAvatar name="Tailwind Variants" /> },
      { key: 'heroui-pro',         href: '/dashboard/team/heroui-pro',         title: 'HeroUI Pro',        startContent: <TeamAvatar name="HeroUI Pro" /> },
    ],
  },
];
