// app/api/vote/route.ts (or relevant path)

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { getVotesByChatId, voteMessage } from '@/lib/db/queries'; // Ensure these queries exist

// Helper function to get Supabase user (avoids repetition)
async function getSupabaseUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );
  return supabase.auth.getUser();
}

// --- GET Handler: Fetch votes for a chat ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
  }

  // --- Authentication Check (Optional for GET, depends on requirements) ---
  // You might allow anyone to GET votes, or require login.
  // Here, we check auth but don't use the user ID.
  console.log("--- Vote GET: Attempting supabase.auth.getUser() ---");
  const { data: { user }, error: authError } = await getSupabaseUser();

  if (authError) {
     console.error("--- Vote GET: Supabase auth error:", authError.message);
     // Decide if auth errors should prevent fetching votes
     // return NextResponse.json({ error: 'Failed to verify authentication.' }, { status: 500 });
  }
  // Proceed even if user is null or authError occurred, depending on requirements.
  // If login is required to view votes, uncomment the error return above and add:
  // if (!user) {
  //   return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  // }
  console.log(`--- Vote GET: User state: ${user ? `Authenticated (${user.id})` : 'Not Authenticated'}`);


  try {
    // Fetch votes regardless of user login status (adjust if needed)
    const votes = await getVotesByChatId({ id: chatId });
    console.log(`--- Vote GET: Found votes for chat ${chatId}.`);
    return NextResponse.json(votes, { status: 200 });
  } catch (dbError: any) {
     console.error(`--- Vote GET: Database error fetching votes for chat ${chatId}:`, dbError);
     return NextResponse.json({ error: 'Failed to fetch votes.' }, { status: 500 });
  }
}

// --- PATCH Handler: Submit a vote ---
export async function PATCH(request: Request) {
  const { chatId, messageId, type }: {
    chatId: string; messageId: string; type: 'up' | 'down';
  } = await request.json();

  if (!chatId || !messageId || !type) {
    return NextResponse.json({ error: 'chatId, messageId, and type are required' }, { status: 400 });
  }

  // --- Authentication Check (Required for PATCH) ---
  console.log("--- Vote PATCH: Attempting supabase.auth.getUser() ---");
  const { data: { user }, error: authError } = await getSupabaseUser();

  if (authError) {
    console.error("--- Vote PATCH: Supabase auth error:", authError.message);
    return NextResponse.json({ error: 'Failed to verify authentication.' }, { status: 500 });
  }

  if (!user) {
    console.error('--- Vote PATCH: No authenticated user found via Supabase SSR.');
    return NextResponse.json({ error: 'Authentication required to vote.' }, { status: 401 }); // Unauthorized
  }

  // --- User is authenticated ---
  const currentUserId = user.id;
  console.log(`--- Vote PATCH: User ${currentUserId} attempting to vote on message ${messageId} in chat ${chatId}`);

  try {
    // Perform the vote operation
    // Note: voteMessage might need the userId if you track who voted
    await voteMessage({
      userId: currentUserId,   // ← add this
      chatId,
      messageId,
      type,
    });
    console.log(`--- Vote PATCH: Vote recorded successfully for user ${currentUserId}.`);
    // Use NextResponse for consistency
    return NextResponse.json({ message: 'Message voted' }, { status: 200 });
  } catch (dbError: any) {
     console.error(`--- Vote PATCH: Database error voting for user ${currentUserId}:`, dbError);
     return NextResponse.json({ error: 'Failed to record vote.' }, { status: 500 });
  }
}
