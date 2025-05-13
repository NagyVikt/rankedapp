// app/api/designs/route.ts
import { NextResponse } from 'next/server';
import { db, designs } from '@/lib/db'; // Your Drizzle DB setup
import { desc } from 'drizzle-orm';

// --- Supabase SSR Imports ---
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import CookieOptions type
import { cookies } from 'next/headers'; // Helper to access cookies

// --- GET Function (remains the same) ---
export async function GET() {
  const all = await db.select().from(designs).orderBy(desc(designs.createdAt));

  return NextResponse.json(all);
}

// --- CORRECTED POST Function using Supabase SSR createServerClient (Modern Signature) ---
export async function POST(req: Request) {
  // 1. Get cookie store
  const cookieStore = await cookies();

  // --- Environment Variable Check (IMPORTANT!) ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key in environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }
  // --- End Environment Variable Check ---

  // 2. Create Supabase client using the modern signature
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Adapt the cookie store from `next/headers` to the expected interface
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.warn(
            `Failed to set cookie '${name}' from Server Component/Route Handler:`,
            error,
          );
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          // Setting the value to '' and maxAge to 0 is a common way to remove cookies
          // Alternatively, check if cookieStore.delete() is available and preferred
          cookieStore.set({ name, value: '', ...options });
          // or potentially: cookieStore.delete({ name, ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.warn(
            `Failed to remove cookie '${name}' from Server Component/Route Handler:`,
            error,
          );
        }
      },
    },
  });

  // 3. Get User Data from Supabase
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 4. Check if user is authenticated
  if (authError || !user) {
    console.error('Authentication Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id; // Get the user ID from Supabase auth user

  // 5. Parse request body
  const { name, design } = await req.json();
  if (!name || !design) {
    return NextResponse.json(
      { error: 'Missing name or design' },
      { status: 400 },
    );
  }

  try {
    // 6. Insert data including the userId from Supabase
    const [created] = await db
      .insert(designs)
      .values({
        name,
        design,
        userId: userId, // Provide the user ID from Supabase here
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to insert design:', error);
    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 },
    );
  }
}
