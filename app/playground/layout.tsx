"use client";
import React from "react";
import { Link } from "@heroui/link";
import { Navbar } from "@/components/navbar";

/**
 * Layout for the Playground section, full-width content
 */
export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen">
      <div className="flex flex-1">
        <main className="flex flex-1 p-4">
              {children}
            </main>
      </div>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://heroui.com"
          title="heroui.com homepage"
        >
          {/* Add any footer content here */}
        </Link>
      </footer>
    </div>
  );
}
