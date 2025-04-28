// components/SWRProvider.tsx  ← this file is client-only
'use client'

import { SWRConfig } from 'swr'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ /* your global options */ }}>
      {children}
    </SWRConfig>
  )
}
