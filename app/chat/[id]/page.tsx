// app/chat/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Chat } from '@/components/chat';
import {
  DEFAULT_MODEL_NAME,
  DEFAULT_REASONING_MODEL_NAME,
  models,
  reasoningModels,
} from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { supabaseServer } from '@/lib/supabase-server'; // Ensure this correctly creates a server-side Supabase client

export default async function Page(props: { params: Promise<{ id: string }> }) {
  // Await the promise wrapper around params to get the chat ID
  const { id } = await props.params;

  // Fetch the chat details from the database using the ID
  const chat = await getChatById({ id });
  console.log('Fetched chat:', chat); // Log the fetched chat for debugging

  // If no chat is found for the given ID, trigger a 404 Not Found page
  if (!chat) {
    console.error(`Chat with ID ${id} not found in DB.`);
    notFound();
  }

  // Create a server-side Supabase client instance
  const supabase = await supabaseServer();

  // --- RECOMMENDED CHANGE: Use getUser() instead of getSession() ---
  // Fetch the authenticated user data directly from the Supabase Auth server
  // This provides a more reliable and secure check than reading from cookies (getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log('Current user from getUser():', user); // Log the user object for debugging
  // --- End of Change ---

  // --- UPDATED PERMISSION CHECK ---
  // Check permissions: If the chat is private, the user must be logged in
  // and their ID must match the userId associated with the chat.
  if (chat.visibility === 'private' && (!user?.id || user.id !== chat.userId)) {
    // Log the reason for denial before triggering Not Found
    console.error(
      `Permission denied for chat ${id}. Private: ${chat.visibility}, Owner: ${chat.userId}, Current User: ${user?.id}`,
    );
    notFound(); // Trigger 404 Not Found if permissions fail
  }
  // --- End of Update ---

  // Fetch the messages associated with this chat ID
  const messages = await getMessagesByChatId({ id });

  // Read model preferences from cookies, using defaults if not set
  const cookieStore = await cookies();
  const modelId = cookieStore.get('model-id')?.value ?? DEFAULT_MODEL_NAME;
  const reasoningModelId =
    cookieStore.get('reasoning-model-id')?.value ??
    DEFAULT_REASONING_MODEL_NAME;

  // Find the corresponding model objects
  // Using non-null assertion (!) assumes default models always exist in the arrays
  const selectedModel = models.find((m) => m.id === modelId)!;
  const selectedReasoningModel = reasoningModels.find(
    (m) => m.id === reasoningModelId,
  )!;

  // --- UPDATED isReadonly LOGIC ---
  // Determine if the chat should be read-only for the current user
  // It's read-only if there's no logged-in user OR if the logged-in user is not the chat owner
  const isReadonly = !user || user.id !== chat.userId;
  // --- End of Update ---

  // Generate a unique key for the Chat component instance (optional, might help with specific React re-rendering scenarios)
  const key = generateUUID();

  // Render the Chat component and DataStreamHandler
  return (
    <>
      <Chat
        key={key} // Unique key for the component
        id={chat.id} // Pass the chat ID
        initialMessages={convertToUIMessages(messages)} // Pass the fetched messages
        selectedModelId={selectedModel.id} // Pass the selected model ID
        selectedReasoningModelId={selectedReasoningModel.id} // Pass the selected reasoning model ID
        selectedVisibilityType={chat.visibility} // Pass the chat visibility
        isReadonly={isReadonly} // Pass the calculated read-only status
      />
      {/* DataStreamHandler likely handles real-time updates or streaming */}
      <DataStreamHandler id={chat.id} />
    </>
  );
}
