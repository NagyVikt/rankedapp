"use client"
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
} from "@/components/icons";
import { Logo } from "@/components/icons";
import { useSidebar } from "@/context/SidebarContext"; // Import the hook
const SIDEBAR_MARGIN_CLASS = 'md:ml-64';
const MAIN_CONTENT_PADDING = 'pl-16 md:pl-16';
export const Navbar = () => {
  const { isSidebarOpen } = useSidebar();

  return (
    <HeroUINavbar 
    maxWidth="full"
    position="sticky"
    // Add padding here, along with conditional margin
    className={`
      ${MAIN_CONTENT_PADDING} // Add consistent padding
      transition-all duration-300 ease-in-out
      ${isSidebarOpen ? SIDEBAR_MARGIN_CLASS : 'ml-0'}
      `}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">

        {/* Brand */}
        <NavbarBrand
            as={Link}
            href="/"
            // Keep as flex container, remove gap
            className="flex items-center max-w-fit"
        >
            {/* Remove margin from Logo */}
            <Logo />

            {/* --- ADD MARGIN HERE --- */}
            {/* Add ml-2 (or ml-3, ml-4) for left margin */}
            <p className="font-bold text-inherit ml-2">RANKED BETA V0.1</p>
            {/* --- END MARGIN --- */}
        </NavbarBrand>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex gap-4 justify-start ml-2">
           {/* ... nav items ... */}
           {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* ... other NavbarContent sections ... */}
       <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
         <NavbarItem>
            <ThemeSwitch />
         </NavbarItem>
       </NavbarContent>
       <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
         <ThemeSwitch />
         <NavbarMenuToggle />
       </NavbarContent>
       <NavbarMenu>
         {/* ... */}
       </NavbarMenu>

    </HeroUINavbar>
  );
};
