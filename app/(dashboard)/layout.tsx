// app/(dashboard)/layout.tsx
"use client"; // if you’re using client‐only hooks/components

import Navbar from "@/components/navbar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
