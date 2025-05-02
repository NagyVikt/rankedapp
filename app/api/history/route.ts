// app/api/history/route.ts (or relevant path)

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { getChatsByUserId } from '@/lib/db/queries'; // Ensure this query exists and works

export async function GET(request: Request) {
  // --- Get User via Supabase SSR ---
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // setAll is not strictly needed for GET requests but good practice
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  console.log("--- History GET: Attempting supabase.auth.getUser() ---");
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("--- History GET: Supabase auth error:", authError.message);
    // Return an error response, using NextResponse for consistency
    return NextResponse.json({ error: 'Failed to verify authentication.' }, { status: 500 });
  }

  if (!user) {
    console.log('--- History GET: No authenticated user found via Supabase SSR.');
    // Return an empty array or an error if history requires authentication
    // Returning empty array might be better UX than a hard error
    // return NextResponse.json({ error: 'Authentication required to view history.' }, { status: 401 });
    return NextResponse.json([], { status: 200 }); // Return empty array for unauthenticated users
  }

  // --- User is authenticated ---
  const currentUserId = user.id;
  console.log(`--- History GET: Found authenticated Supabase user ID: ${currentUserId}`);

  try {
    // --- Fetch Chats for the Authenticated User ---
    // Ensure getChatsByUserId expects an object with 'id' property
    const chats = await getChatsByUserId({ id: currentUserId });
    console.log(`--- History GET: Found ${chats.length} chats for user ${currentUserId}.`);
    return NextResponse.json(chats, { status: 200 });
  } catch (dbError: any) {
    console.error(`--- History GET: Database error fetching chats for user ${currentUserId}:`, dbError);
    return NextResponse.json({ error: 'Failed to fetch chat history.' }, { status: 500 });
  }
}
