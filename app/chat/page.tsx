// app/chat/page.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import {
  DEFAULT_MODEL_NAME,
  models,
  reasoningModels,
  DEFAULT_REASONING_MODEL_NAME,
} from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { supabaseServer } from '@/lib/supabase-server'; // Ensure this uses createServerClient

export default async function Page() {
  // Generate a new UUID for this potential new chat session
  const id = generateUUID();

  // --- Authentication Check using Supabase SSR ---
  const supabase = await supabaseServer(); // Get Supabase client instance
  console.log('[/app/chat Page] Attempting supabase.auth.getUser()...');
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(); // Use getUser()

  if (authError) {
    // Handle potential errors during authentication check
    console.error('[/app/chat Page] Supabase auth error:', authError.message);
    // Redirect to login or show an error page, depending on desired behavior
    redirect('/login?error=auth_check_failed');
  }

  // If no authenticated user is found, redirect to the login page
  if (!user) {
    console.log(
      '[/app/chat Page] No authenticated user found, redirecting to login.',
    );
    redirect('/login');
  }
  // --- End Authentication Check ---

  // User is authenticated, proceed to load chat settings
  console.log(
    `[/app/chat Page] User ${user.id} authenticated. Setting up new chat UI.`,
  );

  // Read model preferences from cookies
  const cookieStore = await cookies(); // Use await
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const reasoningModelIdFromCookie =
    cookieStore.get('reasoning-model-id')?.value;

  // Determine selected models, using defaults if cookies aren't set or invalid
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  const selectedReasoningModelId =
    reasoningModels.find((model) => model.id === reasoningModelIdFromCookie)
      ?.id || DEFAULT_REASONING_MODEL_NAME;

  // Render the Chat component for a new chat session
  return (
    <>
      <Chat
        key={id} // Use the generated UUID as the key
        id={id} // Pass the new UUID as the chat ID
        initialMessages={[]} // Start with no messages
        selectedModelId={selectedModelId} // Pass selected model
        selectedReasoningModelId={selectedReasoningModelId} // Pass selected reasoning model
        // Default visibility for new chats (can be changed later if needed)
        selectedVisibilityType="private"
        // A new chat is never read-only initially
        isReadonly={false}
      />
      {/* DataStreamHandler likely handles real-time updates or streaming for the new chat */}
      <DataStreamHandler id={id} />
    </>
  );
}
