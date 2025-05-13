// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/lib/db'; // <-- your Drizzle client
import * as schema from '@/lib/db/schema'; // <-- your table definitions
import { eq } from 'drizzle-orm'; // <-- filter helper

export async function GET() {
  // 1️⃣ Initialize Supabase server client with cookie helpers
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // 2️⃣ Fetch the authenticated user from Supabase
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ user: null });
  }

  // 3️⃣ Fetch your app’s profile row by matching the ID
  //    Use either .findFirst() (Drizzle v2) or .select().from() (v1)
  let profile = null;
  if (db.query?.user?.findFirst) {
    // Drizzle v2 style
    profile = await db.query.user.findFirst({
      where: eq(schema.user.id, user.id),
    });
  } else {
    // Drizzle v1 style
    const [row] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, user.id))
      .limit(1);
    profile = row;
  }

  // 4️⃣ Merge in the best display name & role
  const name =
    profile?.name ??
    (user.user_metadata as any)?.full_name ??
    (user.user_metadata as any)?.name ??
    '';
  const role = profile?.role ?? (user.app_metadata as any)?.role ?? 'member';

  // 5️⃣ Return a unified, safe user object
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name,
      role,
    },
  });
}
