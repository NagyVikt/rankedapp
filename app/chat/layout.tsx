// app/layout.tsx
import Script from 'next/script';
import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { supabaseServer } from '@/lib/supabase-server';

export const experimental_ppr = true;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1️⃣ Initialize Supabase client (with cookies)
  const supabase = await supabaseServer();
  // 2️⃣ Fetch the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3️⃣ Read the sidebar state from cookies
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      {/* Load Pyodide if you still need it */}
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />

      {/* Provide the sidebar context */}
      <SidebarProvider defaultOpen={!isCollapsed}>
        {/* Pass the Supabase user (or undefined) into your sidebar */}
        <AppSidebar user={session?.user ?? null} />

        {/* Your main content */}
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
