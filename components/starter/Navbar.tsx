"use client"
import { cn } from "@/lib/utils";


import {
  Briefcase,
  FolderGit2,
  GraduationCap,
  HomeIcon,
  LightbulbIcon,
  Mail,
  MoreHorizontal,

  User,
} from 'lucide-react';

// Assuming these components are available at the specified paths
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/animation/DockAnimation';

import Link from "next/link";
import { useEffect, useState } from "react";
// Assuming FramerWrapper is available at this path, though it's not used in the provided return statement
import FramerWrapper from "../animation/FramerWrapper";
import { usePathname } from "next/navigation";

const Navbar = () => {

  const data = [
    {
      title: 'Onboarding',
      icon: (
        <HomeIcon className='h-full w-full ' />
      ),
      href: '/onboarding',
    },
    {
      title: 'About',
      icon: (
        <User className='h-full w-full ' />
      ),
      href: '/onboarding/about',
    },
    {
      title: 'Skills',
      icon: (
        <LightbulbIcon className='h-full w-full ' />
      ),
      href: '/onboarding/skills',
    },
    {
      title: 'Education',
      icon: (
        <GraduationCap className='h-full w-full ' />
      ),
      href: '/onboarding/education',
    },
    {
      title: 'Projects',
      icon: (
        <FolderGit2 className='h-full w-full ' />
      ),
      href: '/onboarding/projects',
    },

    {
      title: 'Contact us',
      icon: (
        <Mail className='h-full w-full ' />
      ),
      href: '/onboarding/contact',
    },
    {
      title: 'More',
      icon: (
        <MoreHorizontal className='h-full w-full ' />
      ),
      href: '/onboarding/more',
    },
  ];
  // State to track scrolling, used to hide the navbar when scrolling occurs
  const [scrolling, setScrolling] = useState(false);
  // Get the current pathname to highlight the active link
  const pathname = usePathname()

  useEffect(() => {
    // Function to handle scroll events
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolling(true); // Set scrolling to true if scrolled down
      } else {
        setScrolling(false); // Set scrolling to false if at the top
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount


  return (
    // Fixed container for the Dock component
    // Positions the navbar at the top center and hides it on scroll
    <div className={`fixed top-0 right-0 left-0 px-0 sm:px-5 m-auto w-full sm:w-fit bg-transparent z-[+9999999] ${scrolling ? "hidden":"block"}`}>
    {/* Dock component with styling */}
    <Dock className='items-end pb-3 rounded-full'>
      {/* Map over the data array to create DockItems */}
      {data.map((item, idx) => (
        // Link component for navigation
        <Link href={item.href} key={idx}>
          {/*
            DockItem component with conditional class for active link styling.
            Uses 'cn' utility for combining class names.
          */}
        <DockItem
          className={cn("aspect-square rounded-full bg-gray-200 dark:bg-neutral-800",pathname === item.href && " bg-gray-100 !border !border-primary-sky")}
          >
          {/* DockLabel for the item title */}
          <DockLabel >{item.title}</DockLabel>
          {/*
            DockIcon for the item icon with conditional class for active link icon color.
            Uses 'cn' utility for combining class names.
          */}
          <DockIcon className={cn(pathname === item.href && "text-[#2f7df4]")}>{item.icon}</DockIcon>
        </DockItem>
          </Link>
      ))}
    </Dock>
    </div>
  );
};

export default Navbar;
