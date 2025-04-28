// app/dashboard/layout.tsx
import React from 'react'
import { ReactNode } from 'react'
import DefaultLayout from '@/components/sidebar/DefaultLayout'
import { ShopsProvider } from '@/context/shops'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ShopsProvider>
      <DefaultLayout>{children}</DefaultLayout>
    </ShopsProvider>
  )
}
