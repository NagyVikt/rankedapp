
"use client";

import React from 'react';
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site"; // Ensure this path is correct
import { Logo } from "@/components/icons";    // Ensure this path is correct
import { ThemeSwitch } from "@/components/theme-switch"; // Ensure this path is correct
import { useSidebar } from '@/context/SidebarContext'; // Ensure this path is correct

const Navbar = () => {
  const { isSidebarOpen } = useSidebar();

  // Correct horizontal positioning for the navbar
  // It spans from a dynamic left edge (based on sidebar) to the viewport's right edge.
  const navbarLeftOffsetClass = isSidebarOpen ? "md:left-64" : "left-0";

  return (
    <HeroUINavbar
      // Removed maxWidth="full" as left/right positioning handles width
      position="sticky"
      className={clsx(
        "top-0 z-50", // Sticks to the top, highest z-index for global elements
        "transition-all duration-300 ease-in-out", // Matches sidebar animation
        navbarLeftOffsetClass, // Dynamic left position based on sidebar
        "right-0" // Ensures it extends to the right edge of the viewport
      )}
    >
      {/* Navbar Content: Example padding, adjust as needed */}
      <NavbarContent className="basis-1/5 sm:basis-full px-4 sm:px-6" justify="start">
        <NavbarBrand as={Link} href="/" className="flex items-center">
          <Logo />
          <p className="font-bold text-inherit ml-2">RANKED BETA V0.1</p>
        </NavbarBrand>

        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full px-4 sm:px-6" justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4 pr-2" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>{/* Mobile menu items here... */}</NavbarMenu>
    </HeroUINavbar>
  );
};

export default Navbar;