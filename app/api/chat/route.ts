// app/api/chat/route.ts

import {
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
  type CoreMessage,
} from 'ai'; // Import convertToCoreMessages directly, and CoreMessage type
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Message as AiMessage } from 'ai'; // Base message type from Vercel AI SDK
import { customModel } from '@/lib/ai';
import { models, reasoningModels } from '@/lib/ai/models';
import { rateLimiter } from '@/lib/rate-limit';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getUserById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../chat/actions';
import FirecrawlApp from '@mendable/firecrawl-js';

// Define Tool types
type AllowedTools = 'deepResearch' | 'search' | 'extract' | 'scrape';
const firecrawlTools: AllowedTools[] = ['search', 'extract', 'scrape'];
const allTools: AllowedTools[] = [...firecrawlTools, 'deepResearch'];

// Define the extended message type for storing messages with a chatId
// This combines parts of AiMessage with the more inclusive CoreMessage role
// and ensures content is a string for database storage.
type StoredMessage = Omit<AiMessage, 'role' | 'content'> & {
  // Omit AiMessage's role and content to redefine them
  chatId: string;
  role: CoreMessage['role']; // Use the more inclusive role type from CoreMessage (includes 'tool')
  content: string; // Ensure content is always a string for the database
  // id and createdAt are inherited from AiMessage (id: string, createdAt?: Date)
};

// Initialize Firecrawl App
const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || '',
});

// --- Main POST Handler ---
export async function POST(request: Request) {
  const maxDuration = process.env.MAX_DURATION
    ? parseInt(process.env.MAX_DURATION)
    : 300;

  // --- 1. Parse Request Body ---
  const {
    id: chatId,
    messages,
    modelId,
    reasoningModelId,
    experimental_deepResearch = false,
  }: {
    id: string;
    messages: Array<AiMessage>; // Incoming messages from client are expected to conform to AiMessage
    modelId: string;
    reasoningModelId: string;
    experimental_deepResearch?: boolean;
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
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );

  console.log('--- Chat POST: Attempting supabase.auth.getUser() ---');
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('--- Chat POST: Supabase auth error:', authError.message);
    return new Response('Failed to verify authentication.', { status: 500 });
  }

  if (!user) {
    console.error(
      '--- Chat POST: No authenticated user found via Supabase SSR.',
    );
    return new Response(
      'Authentication required to start or continue a chat.',
      { status: 401 },
    );
  }

  const currentUserId = user.id;
  console.log(
    `--- Chat POST: Found authenticated Supabase user ID: ${currentUserId}`,
  );

  // --- 3. User Verification in DB ---
  try {
    console.log(
      `--- Chat POST: Verifying user ID ${currentUserId} in public.User table...`,
    );
    const appUserRecord = await getUserById(currentUserId);

    if (!appUserRecord) {
      console.error(
        `User ID ${currentUserId} (Email: ${user.email}) NOT FOUND in application's public.User table.`,
      );
      return new Response(
        'User record not found in application database. Ensure DB sync.',
        { status: 500 },
      );
    } else {
      console.log(
        `--- Chat POST: Verified user ${currentUserId} exists in public.User table.`,
      );
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
  const selectedReasoningModelInfo = reasoningModels.find(
    (m) => m.id === reasoningModelId,
  );
  if (!selectedModelInfo || !selectedReasoningModelInfo) {
    console.error(
      `Model not found: modelId=${modelId}, reasoningModelId=${reasoningModelId}`,
    );
    return new Response('Model not found', { status: 404 });
  }

  // --- 6. Message Processing ---
  // Use convertToCoreMessages (now correctly imported)
  const coreMessages: CoreMessage[] = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages); // userMessage is a CoreMessage
  if (!userMessage) {
    console.error(`No user message found in chat: ${chatId}`);
    return new Response('No user message found', { status: 400 });
  }

  // --- 7. Chat Handling (Create or Verify Ownership) ---
  try {
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      console.log(
        `--- Chat POST: Creating new chat ${chatId} for user ID: ${currentUserId} ---`,
      );
      // generateTitleFromUserMessage expects CoreMessage, which userMessage is.
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      await saveChat({
        id: chatId,
        userId: currentUserId,
        title,
        visibility: 'private',
      });
    } else {
      console.log(
        `--- Chat POST: Checking ownership for existing chat ${chatId}. Owner: ${chat.userId}, Current User: ${currentUserId} ---`,
      );
      if (chat.userId !== currentUserId) {
        console.error(
          `User ${currentUserId} attempted to post to chat ${chatId} owned by ${chat.userId}`,
        );
        return new Response('Unauthorized to post to this chat.', {
          status: 403,
        });
      }
      console.log(`User ${currentUserId} posting to existing chat ${chatId}`);
    }
  } catch (dbError: any) {
    console.error(
      `--- Chat POST: Database error during chat handling for chat ${chatId}:`,
      dbError,
    );
    if (
      dbError.code === '23503' &&
      dbError.constraint_name === 'Chat_userId_User_id_fk'
    ) {
      console.error(
        `--- UNEXPECTED FOREIGN KEY VIOLATION: User ID ${currentUserId} check passed but save failed? ---`,
      );
    }
    return new Response('A database error occurred while handling the chat.', {
      status: 500,
    });
  }

  // --- 8. Save User Message ---
  try {
    const userMessageId = generateUUID();
    // userMessage is CoreMessage. Its role is 'user'.
    // Its content can be string or Part[]. Convert to string if necessary.
    const userMessageToSave: StoredMessage = {
      id: userMessageId,
      role: userMessage.role, // This will be 'user', which is valid for StoredMessage.role
      content:
        typeof userMessage.content === 'string'
          ? userMessage.content
          : JSON.stringify(userMessage.content), // Ensure content is a string
      createdAt: new Date(), // Explicitly set createdAt
      chatId: chatId,
    };
    await saveMessages({ messages: [userMessageToSave] });
    console.log(
      `--- Chat POST: Saved user message ${userMessageId} for chat ${chatId}`,
    );

    // --- 9. AI Response Streaming ---
    return createDataStreamResponse({
      execute: (dataStream) => {
        dataStream.writeData({
          type: 'user-message-id',
          content: userMessageId,
        });
        const result = streamText({
          model: customModel(selectedModelInfo.apiIdentifier, false),
          system: systemPrompt,
          messages: coreMessages,
          maxSteps: 10,
          experimental_activeTools: experimental_deepResearch
            ? allTools
            : firecrawlTools,
          tools: {
            search: {
              description: 'Search for web pages.',
              parameters: z.object({
                query: z.string(),
                maxResults: z.number().optional(),
              }),
              execute: async ({ query, maxResults = 5 }) => {
                /* ... Firecrawl search logic ... */ return `Search results for: ${query}`;
              },
            },
            extract: {
              description: 'Extract structured data from web pages.',
              parameters: z.object({
                urls: z.array(z.string().url()),
                prompt: z.string(),
              }),
              execute: async ({ urls, prompt }) => {
                /* ... Firecrawl extract logic ... */ return `Extracted data from ${urls.join(', ')}`;
              },
            },
            scrape: {
              description: 'Scrape raw content from a single URL.',
              parameters: z.object({ url: z.string().url() }),
              execute: async ({ url }) => {
                /* ... Firecrawl scrape logic ... */ return `Scraped content from ${url}`;
              },
            },
            deepResearch: {
              description:
                'Perform deep research using coordinated search, extract, and analysis.',
              parameters: z.object({
                topic: z.string(),
                maxDepth: z.number().optional(),
              }),
              execute: async ({ topic: initialTopic, maxDepth = 7 }) => {
                /* ... Deep research logic ... */ return `Deep research summary for ${initialTopic}`;
              },
            },
          },
          onFinish: async ({
            text,
            toolCalls,
            toolResults,
            finishReason,
            usage,
          }) => {
            console.log(
              `--- Chat POST: AI stream finished for chat ${chatId}. Reason: ${finishReason} ---`,
            );
            const assistantMessageId = generateUUID();

            const finalMessagesToSave: StoredMessage[] = [];

            if (text) {
              finalMessagesToSave.push({
                id: assistantMessageId,
                role: 'assistant',
                content: text, // Text is already string
                createdAt: new Date(),
                chatId: chatId,
              });
            }

            if (toolCalls && toolCalls.length > 0) {
              toolCalls.forEach((toolCall) => {
                finalMessagesToSave.push({
                  id: generateUUID(),
                  role: 'assistant', // Assistant message *containing* the tool call
                  content: JSON.stringify([
                    {
                      // Content is stringified tool call structure
                      type: 'tool-call',
                      toolCallId: toolCall.toolCallId,
                      toolName: toolCall.toolName,
                      args: toolCall.args,
                    },
                  ]),
                  createdAt: new Date(),
                  chatId: chatId,
                });
              });
            }

            if (toolResults && toolResults.length > 0) {
              toolResults.forEach((toolResult) => {
                finalMessagesToSave.push({
                  id: generateUUID(),
                  role: 'tool', // Role is 'tool', now valid for StoredMessage
                  content: JSON.stringify([
                    {
                      // Content is stringified tool result structure
                      type: 'tool-result',
                      toolCallId: toolResult.toolCallId,
                      toolName: toolResult.toolName,
                      result: toolResult.result,
                    },
                  ]),
                  createdAt: new Date(),
                  chatId: chatId,
                });
              });
            }

            if (finalMessagesToSave.length > 0) {
              try {
                await saveMessages({ messages: finalMessagesToSave });
                console.log(
                  `--- Chat POST: Saved ${finalMessagesToSave.length} assistant/tool messages for chat ${chatId}.`,
                );
              } catch (dbSaveError) {
                console.error(
                  `--- Chat POST: Failed to save assistant/tool messages for chat ${chatId}:`,
                  dbSaveError,
                );
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text-supabase',
          },
        });
        result.mergeIntoDataStream(dataStream);
      },
      onError: (error) => {
        console.error('DataStreamResponse Error:', error);
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (dbError: any) {
    console.error(
      `--- Chat POST: Database error saving user message for chat ${chatId}:`,
      dbError,
    );
    return new Response('A database error occurred while saving the message.', {
      status: 500,
    });
  }
} // End POST handler

// --- DELETE Handler (Largely unchanged, ensure 'id' is treated as chatId) ---
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // This is the chatId
  if (!id) {
    return new Response('Chat ID is required', { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.warn('--- Chat DELETE: Authentication failed or no user found.');
    return new Response('Authentication required to delete chat.', {
      status: 401,
    });
  }

  try {
    const chat = await getChatById({ id });
    if (!chat) {
      console.log(`--- Chat DELETE: Chat ${id} not found.`);
      return new Response('Chat not found', { status: 404 });
    }
    if (chat.userId !== user.id) {
      console.warn(
        `User ${user.id} attempted to delete chat ${id} owned by ${chat.userId}`,
      );
      return new Response('Unauthorized to delete this chat', { status: 403 });
    }
    await deleteChatById({ id });
    console.log(`Chat ${id} deleted by user ${user.id}`);
    return new Response('Chat deleted', { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting chat ${id}:`, error);
    return new Response(
      `An error occurred: ${error.message || 'Unknown error'}`,
      { status: 500 },
    );
  }
}
