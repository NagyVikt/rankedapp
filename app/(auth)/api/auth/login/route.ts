// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // ① Await cookies() up front
  const cookieStore = await cookies();

  // ② Create the Supabase client with cookie helpers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // anon key is sufficient here
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (tos) =>
          tos.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );

  // ③ Sign in; Supabase will now set HTTP-only cookies on the response
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
