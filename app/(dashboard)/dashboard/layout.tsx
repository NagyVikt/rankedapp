// File: app/(dashboard)/dashboard/layout.tsx
import React from 'react'
import { ReactNode } from 'react'
import DefaultLayout from '@/components/sidebar/DefaultLayout' // Ensure this path is correct
import { ShopsProvider } from '@/context/shops'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ShopsProvider>
      <DefaultLayout>{children}</DefaultLayout>
    </ShopsProvider>
  )
}