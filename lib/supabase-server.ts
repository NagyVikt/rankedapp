// lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies }              from 'next/headers';

export async function supabaseServer() {
  const cookieStore = await cookies();  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (tos) =>
          tos.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );
}
