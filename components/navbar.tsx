'use client';

import React from 'react';
import { usePathname } from 'next/navigation'; // Added for active link detection
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem, // Added for mobile menu
} from '@heroui/navbar';
import { Link } from '@heroui/link';
// import { Button } from "@heroui/button"; // Button not currently used, can be re-added if needed
import { Icon } from '@iconify/react'; // Added for icons
import clsx from 'clsx';

import { siteConfig, NavItem as SiteNavItem } from '@/config/site'; // Ensure this path is correct and NavItem type is exported
import { Logo } from '@/components/icons'; // Ensure this path is correct
import { ThemeSwitch } from '@/components/theme-switch'; // Ensure this path is correct
import { useSidebar } from '@/context/SidebarContext'; // Ensure this path is correct

// Example of how your NavItem type in siteConfig might look:
// export type NavItem = {
//   label: string;
//   href: string;
//   icon?: string; // e.g., 'lucide:home', 'lucide:settings'
// };
// Ensure siteConfig.navItems conforms to this.

const Navbar = () => {
  const { isSidebarOpen } = useSidebar();
  const pathname = usePathname(); // Get current path for active state

  // Correct horizontal positioning for the navbar
  // Adjust 'md:left-64' if your sidebar width changes (e.g., 'md:left-80' for w-80)
  const navbarLeftOffsetClass = isSidebarOpen ? 'md:left-64' : 'left-0';

  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <HeroUINavbar
      position="sticky"
      className={clsx(
        'top-0 z-50',
        'transition-[left] duration-300 ease-in-out', // Only transition left property
        navbarLeftOffsetClass,
        'right-0',
        'bg-background/80 backdrop-blur-md', // Base background styling
        {
          'border-b border-divider': !isSidebarOpen, // Apply border only when sidebar is closed
        },
      )}
      isMenuOpen={isMenuOpen} // Control mobile menu state
      onMenuOpenChange={setIsMenuOpen} // Update mobile menu state
    >
      {/* Navbar Content: Start */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        {/* Mobile Menu Toggle - Placed at the start for mobile */}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden mr-2 text-foreground" // Show only on small screens, ensure toggle is visible
        />
        {/* Navbar Brand - Logo and Text */}
        <NavbarBrand
          as={Link}
          href="/"
          className="flex items-center gap-2 text-foreground"
        >
          {' '}
          {/* Ensure brand uses foreground color */}
          <Logo className="text-foreground" />{' '}
          {/* Assuming Logo can take a className to control color, or it inherits */}
          <p className="font-bold text-inherit">RANKED</p>{' '}
          {/* Inherits text-foreground from NavbarBrand */}
        </NavbarBrand>

        {/* Desktop Navigation Items */}
        <div className="hidden lg:flex gap-2 justify-start ml-4">
          {siteConfig.navItems.map((item: SiteNavItem) => (
            <NavbarItem key={item.href} isActive={pathname === item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-150 ease-in-out', // Increased font size to text-base
                  pathname === item.href
                    ? 'bg-default-200 dark:bg-default-100 text-foreground dark:text-foreground' // Active state
                    : 'text-foreground-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-200/50', // Inactive state
                  'data-[active=true]:bg-default-200 data-[active=true]:dark:bg-default-100 data-[active=true]:text-foreground',
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.icon && <Icon icon={item.icon} width={20} height={20} />}{' '}
                {/* Icon size adjusted slightly */}
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* Navbar Content: End */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full items-center"
        justify="end"
      >
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        {/* Add other items like UserAvatar, etc. here if needed */}
      </NavbarContent>

      {/* Mobile: ThemeSwitch is separate */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-background/95 backdrop-blur-md pt-4">
        {siteConfig.navItems.map((item: SiteNavItem, index) => (
          <NavbarMenuItem
            key={`${item.href}-${index}`}
            isActive={pathname === item.href}
          >
            <Link
              href={item.href}
              className={clsx(
                'flex items-center gap-3 w-full text-base py-3 px-3 rounded-lg transition-colors duration-150 ease-in-out', // text-base is good for mobile
                pathname === item.href
                  ? 'bg-default-200 dark:bg-default-100 text-foreground font-semibold' // Active mobile item
                  : 'text-foreground-600 hover:text-foreground hover:bg-default-100 dark:text-foreground-400 dark:hover:text-foreground-50 dark:hover:bg-default-200/50',
              )}
              onPress={() => setIsMenuOpen(false)} // Close menu on item click
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.icon && <Icon icon={item.icon} width={22} height={22} />}
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </HeroUINavbar>
  );
};

export default Navbar;
