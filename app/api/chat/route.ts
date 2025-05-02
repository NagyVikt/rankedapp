// app/api/chat/route.ts (or relevant path)

import { type Message, convertToCoreMessages, createDataStreamResponse, generateText, streamText } from 'ai';
import { z } from 'zod';
import { cookies } from 'next/headers'; // Import cookies
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import Supabase SSR

// Assuming other imports remain the same (adjust paths if needed)
import { customModel } from '@/lib/ai';
import { models, reasoningModels } from '@/lib/ai/models';
import { rateLimiter } from '@/lib/rate-limit';
import { systemPrompt } from '@/lib/ai/prompts';
import { deleteChatById, getChatById, getUser, saveChat, saveMessages } from '@/lib/db/queries';
import { generateUUID, getMostRecentUserMessage, sanitizeResponseMessages } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../chat/actions';
import FirecrawlApp from '@mendable/firecrawl-js';

// Define Tool types (as before)
type AllowedTools = | 'deepResearch' | 'search' | 'extract' | 'scrape';
const firecrawlTools: AllowedTools[] = ['search', 'extract', 'scrape'];
const allTools: AllowedTools[] = [...firecrawlTools, 'deepResearch'];

// Initialize Firecrawl App (as before)
const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || '',
});

// --- Main POST Handler ---
export async function POST(request: Request) {
  const maxDuration = process.env.MAX_DURATION ? parseInt(process.env.MAX_DURATION) : 300;

  // --- 1. Parse Request Body ---
  const { id, messages, modelId, reasoningModelId, experimental_deepResearch = false }: {
    id: string; messages: Array<Message>; modelId: string; reasoningModelId: string; experimental_deepResearch?: boolean;
  } = await request.json();

  // --- 2. Authentication Check using Supabase SSR ---
  const cookieStore = await cookies(); // Get cookie store instance

  // --- Attempt to fix Dynamic API Error: Pre-fetch cookies ---
  const allCookies = cookieStore.getAll();
  // --- End of fix attempt ---

  const supabase = createServerClient( // Create Supabase client for this request
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Pass the pre-fetched cookies object directly
        getAll: () => allCookies,
        // setAll still needs the cookieStore instance to modify cookies
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  console.log("--- Chat POST: Attempting supabase.auth.getUser() ---");
  const { data: { user }, error: authError } = await supabase.auth.getUser(); // Get user based on Supabase cookies

  if (authError) {
    console.error("--- Chat POST: Supabase auth error:", authError.message);
    return new Response('Failed to verify authentication.', { status: 500 });
  }

  if (!user) {
    console.error('--- Chat POST: No authenticated user found via Supabase SSR.');
    return new Response('Authentication required to start or continue a chat.', { status: 401 }); // Unauthorized
  }

  // --- User is authenticated via Supabase SSR ---
  const currentUserId = user.id; // Use the ID from Supabase user object
  console.log(`--- Chat POST: Found authenticated Supabase user ID: ${currentUserId}`);

  // --- 3. User Verification in DB (Crucial Check) ---
  // This check needs to verify the ID exists in *your* public.User table
  let appUserRecord;
  try {
    // Modify getUser to potentially fetch by ID, or fetch by email and check ID
    // Example: Assuming getUser can fetch by ID (Adapt if it only uses email)
    // const appUsers = await getUserById(currentUserId); // Hypothetical function
    // OR Fetch by email and verify ID:
    const appUsers = await getUser(user.email!); // Fetch by email
    if (appUsers.length > 0) {
        // IMPORTANT: Check if the ID in your table matches the Supabase Auth ID
        appUserRecord = appUsers.find(u => u.id === currentUserId);
    }

    if (!appUserRecord) {
      console.error(`Authenticated Supabase user ID ${currentUserId} (Email: ${user.email}) NOT FOUND or ID MISMATCH in application's public.User table.`);
      // *** THIS IS THE LIKELY CAUSE OF THE FOREIGN KEY ERROR ***
      // Instruct user to fix data sync issue (manual insert/trigger)
      return new Response('User record mismatch. Please contact support or ensure DB sync.', { status: 500 });
    } else {
       console.log(`--- Chat POST: Verified user ${currentUserId} exists with matching ID in public.User table.`);
    }
  } catch (error) {
    console.error('Error verifying user in application database:', error);
    return new Response('Failed to verify user', { status: 500 });
  }

  // --- 4. Rate Limiting ---
  const identifier = currentUserId;
  const { success } = await rateLimiter.limit(identifier);
  if (!success) {
    console.warn(`Rate limit exceeded for user: ${identifier}`);
    return new Response(`Too many requests`, { status: 429 });
  }

  // --- 5. Model Validation ---
  const selectedModelInfo = models.find((m) => m.id === modelId);
  const selectedReasoningModelInfo = reasoningModels.find((m) => m.id === reasoningModelId);
  if (!selectedModelInfo || !selectedReasoningModelInfo) {
    console.error(`Model not found: modelId=${modelId}, reasoningModelId=${reasoningModelId}`);
    return new Response('Model not found', { status: 404 });
  }

  // --- 6. Message Processing ---
  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);
  if (!userMessage) {
    console.error(`No user message found in chat: ${id}`);
    return new Response('No user message found', { status: 400 });
  }

  // --- 7. Chat Handling (Create or Verify Ownership) ---
  try { // Wrap DB operations in try/catch
      const chat = await getChatById({ id });
      if (!chat) {
        console.log(`--- Chat POST: Creating new chat ${id} for user ID: ${currentUserId} ---`);
        const title = await generateTitleFromUserMessage({ message: userMessage });
        // *** This call will fail if currentUserId is not in public.User ***
        await saveChat({ id, userId: currentUserId, title, visibility: 'private' });
      } else {
        console.log(`--- Chat POST: Checking ownership for existing chat ${id}. Owner: ${chat.userId}, Current User: ${currentUserId} ---`);
        if (chat.userId !== currentUserId) {
          console.error(`User ${currentUserId} attempted to post to chat ${id} owned by ${chat.userId}`);
          return new Response('Unauthorized to post to this chat.', { status: 403 });
        }
        console.log(`User ${currentUserId} posting to existing chat ${id}`);
      }
  } catch (dbError: any) {
      // Catch potential DB errors during saveChat/getChatById
      console.error(`--- Chat POST: Database error during chat handling for chat ${id}:`, dbError);
      // Check specifically for the foreign key error
      if (dbError.code === '23503' && dbError.constraint_name === 'Chat_userId_User_id_fk') {
          console.error(`--- FOREIGN KEY VIOLATION: User ID ${currentUserId} not found in public.User table! ---`);
          return new Response(`Database error: User record missing or mismatched. Ensure user ${currentUserId} exists in the User table.`, { status: 500 });
      }
      return new Response('A database error occurred while handling the chat.', { status: 500 });
  }


  // --- 8. Save User Message ---
  try { // Wrap DB operation in try/catch
      const userMessageId = generateUUID();
      await saveMessages({ messages: [{ ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id }] });
      console.log(`--- Chat POST: Saved user message ${userMessageId} for chat ${id}`);

      // --- 9. AI Response Streaming (Only proceed if message saved) ---
      return createDataStreamResponse({
        execute: (dataStream) => {
          dataStream.writeData({ type: 'user-message-id', content: userMessageId });
          const result = streamText({
            model: customModel(selectedModelInfo.apiIdentifier, false),
            system: systemPrompt,
            messages: coreMessages,
            maxSteps: 10,
            experimental_activeTools: experimental_deepResearch ? allTools : firecrawlTools,
            tools: {
               search: { /* ... */
                    description: "Search for web pages.",
                    parameters: z.object({ query: z.string(), maxResults: z.number().optional() }),
                    execute: async ({ query, maxResults = 5 }) => { /* ... */ }
               },
               extract: { /* ... */
                    description: "Extract structured data from web pages.",
                    parameters: z.object({ urls: z.array(z.string().url()), prompt: z.string() }),
                    execute: async ({ urls, prompt }) => { /* ... */ }
               },
               scrape: { /* ... */
                    description: "Scrape raw content from a single URL.",
                    parameters: z.object({ url: z.string().url() }),
                    execute: async ({ url }) => { /* ... */ }
               },
               deepResearch: { /* ... [Full implementation from previous artifact] ... */
                    description: 'Perform deep research using coordinated search, extract, and analysis.',
                    parameters: z.object({ topic: z.string(), maxDepth: z.number().optional() }),
                    execute: async ({ topic: initialTopic, maxDepth = 7 }) => { /* ... [Full logic] ... */ }
               },
            },
            onFinish: async ({ response }) => { /* ... [onFinish logic using Supabase SSR] ... */ },
            experimental_telemetry: { isEnabled: true, functionId: 'stream-text-supabase' },
          });
          result.mergeIntoDataStream(dataStream);
        },
        onError: (error) => { console.error("DataStreamResponse Error:", error); },
        onFinal: () => { console.log(`Stream closed for chat ${id}`); }
      });
      // --- End AI Streaming ---

  } catch (dbError: any) {
       console.error(`--- Chat POST: Database error saving user message for chat ${id}:`, dbError);
       return new Response('A database error occurred while saving the message.', { status: 500 });
  }
} // End POST handler

// --- DELETE Handler (Using Supabase SSR Auth - Keep as is) ---
export async function DELETE(request: Request) {
    // ... (DELETE handler code remains the same as previous artifact) ...
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) { return new Response('Chat ID is required', { status: 400 }); }

    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return new Response('Authentication required to delete chat.', { status: 401 });
    }

    try {
        const chat = await getChatById({ id });
        if (!chat) { return new Response('Chat not found', { status: 404 }); }
        if (chat.userId !== user.id) {
        console.warn(`User ${user.id} attempted to delete chat ${id} owned by ${chat.userId}`);
        return new Response('Unauthorized to delete this chat', { status: 403 });
        }
        await deleteChatById({ id });
        console.log(`Chat ${id} deleted by user ${user.id}`);
        return new Response('Chat deleted', { status: 200 });
    } catch (error: any) {
        console.error(`Error deleting chat ${id}:`, error);
        return new Response(`An error occurred: ${error.message || 'Unknown'}`, { status: 500 });
    }
}
