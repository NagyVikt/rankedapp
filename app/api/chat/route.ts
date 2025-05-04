// app/api/chat/route.ts

import { type Message, convertToCoreMessages, createDataStreamResponse, generateText, streamText } from 'ai';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { customModel } from '@/lib/ai';
import { models, reasoningModels } from '@/lib/ai/models';
import { rateLimiter } from '@/lib/rate-limit';
import { systemPrompt } from '@/lib/ai/prompts';
// Import getUserById specifically
import { deleteChatById, getChatById, getUserById, saveChat, saveMessages } from '@/lib/db/queries';
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
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => allCookies,
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  console.log("--- Chat POST: Attempting supabase.auth.getUser() ---");
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("--- Chat POST: Supabase auth error:", authError.message);
    return new Response('Failed to verify authentication.', { status: 500 });
  }

  if (!user) {
    console.error('--- Chat POST: No authenticated user found via Supabase SSR.');
    return new Response('Authentication required to start or continue a chat.', { status: 401 });
  }

  const currentUserId = user.id; // This is the correct ID from Supabase Auth
  console.log(`--- Chat POST: Found authenticated Supabase user ID: ${currentUserId}`);

  // --- 3. User Verification in DB (Crucial Check) ---
  let appUserRecord;
  try {
    // *** FIX: Use getUserById with the ID from Supabase Auth ***
    console.log(`--- Chat POST: Verifying user ID ${currentUserId} in public.User table...`);
    appUserRecord = await getUserById(currentUserId); // Fetch by the correct ID

    // Check if the user was found in your DB with the matching ID
    if (!appUserRecord) {
      // This log is now accurate
      console.error(`User ID ${currentUserId} (Email: ${user.email}) NOT FOUND in application's public.User table.`);
      // You might still have a data sync issue if this happens, or the user truly doesn't exist in your table
      return new Response('User record not found in application database. Ensure DB sync.', { status: 500 });
    } else {
       // Verification successful!
       console.log(`--- Chat POST: Verified user ${currentUserId} exists in public.User table.`);
    }
  } catch (error) {
    console.error('Error verifying user in application database:', error);
    return new Response('Failed to verify user', { status: 500 });
  }

  // --- 4. Rate Limiting ---
  const identifier = currentUserId; // Use the verified ID
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
  // This section should now work correctly as currentUserId is verified against your DB
  try {
      const chat = await getChatById({ id });
      if (!chat) {
        console.log(`--- Chat POST: Creating new chat ${id} for user ID: ${currentUserId} ---`);
        const title = await generateTitleFromUserMessage({ message: userMessage });
        // saveChat uses currentUserId, which we now know exists in the User table
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
      // Errors here are less likely to be FK violations now, but keep catch block
      console.error(`--- Chat POST: Database error during chat handling for chat ${id}:`, dbError);
      if (dbError.code === '23503' && dbError.constraint_name === 'Chat_userId_User_id_fk') {
          console.error(`--- UNEXPECTED FOREIGN KEY VIOLATION: User ID ${currentUserId} check passed but save failed? ---`);
      }
      return new Response('A database error occurred while handling the chat.', { status: 500 });
  }


  // --- 8. Save User Message ---
  try {
      const userMessageId = generateUUID();
      // saveMessages should also work now
      await saveMessages({ messages: [{ ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id }] });
      console.log(`--- Chat POST: Saved user message ${userMessageId} for chat ${id}`);

      // --- 9. AI Response Streaming ---
      // (Keep the rest of the streaming logic as is)
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
               search: {
                    description: "Search for web pages.",
                    parameters: z.object({ query: z.string(), maxResults: z.number().optional() }),
                    execute: async ({ query, maxResults = 5 }) => { /* ... */ return "Search results..."; }
               },
               extract: {
                    description: "Extract structured data from web pages.",
                    parameters: z.object({ urls: z.array(z.string().url()), prompt: z.string() }),
                    execute: async ({ urls, prompt }) => { /* ... */ return "Extracted data..."; }
               },
               scrape: {
                    description: "Scrape raw content from a single URL.",
                    parameters: z.object({ url: z.string().url() }),
                    execute: async ({ url }) => { /* ... */ return "Scraped content..."; }
               },
               deepResearch: {
                    description: 'Perform deep research using coordinated search, extract, and analysis.',
                    parameters: z.object({ topic: z.string(), maxDepth: z.number().optional() }),
                    execute: async ({ topic: initialTopic, maxDepth = 7 }) => { /* ... */ return "Deep research summary..."; }
               },
            },
            onFinish: async ({ text, toolCalls, toolResults, finishReason, usage }) => {
                console.log(`--- Chat POST: AI stream finished for chat ${id}. Reason: ${finishReason} ---`);
                const assistantMessageId = generateUUID();
                const finalMessagesToSave: Message[] = [];
                if (text) { finalMessagesToSave.push({ id: assistantMessageId, role: 'assistant', content: text, createdAt: new Date(), chatId: id }); }
                if (toolCalls) { toolCalls.forEach(toolCall => finalMessagesToSave.push({ id: generateUUID(), role: 'assistant', content: [{ type: 'tool-call', toolCallId: toolCall.toolCallId, toolName: toolCall.toolName, args: toolCall.args }], createdAt: new Date(), chatId: id })); }
                if (toolResults) { toolResults.forEach(toolResult => finalMessagesToSave.push({ id: generateUUID(), role: 'tool', content: [{ type: 'tool-result', toolCallId: toolResult.toolCallId, toolName: toolResult.toolName, result: toolResult.result }], createdAt: new Date(), chatId: id })); }
                if (finalMessagesToSave.length > 0) {
                    try { await saveMessages({ messages: finalMessagesToSave }); console.log(`--- Chat POST: Saved ${finalMessagesToSave.length} assistant/tool messages for chat ${id}.`); }
                    catch (dbSaveError) { console.error(`--- Chat POST: Failed to save assistant/tool messages for chat ${id}:`, dbSaveError); }
                }
            },
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

// --- DELETE Handler (Keep as is) ---
export async function DELETE(request: Request) {
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
