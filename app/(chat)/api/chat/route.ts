import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  generateObject,
  generateText,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { auth, signIn } from '@/app/(auth)/auth';
import { customModel } from '@/lib/ai';
import { models, reasoningModels } from '@/lib/ai/models';
import { rateLimiter } from '@/lib/rate-limit';
import {
  codePrompt,
  systemPrompt,
  updateDocumentPrompt,
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  getUser,
  saveChat,
  saveDocument,
  saveMessages,
  getUserByEmail, // Use this one for email lookups

  saveSuggestions,
} from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import FirecrawlApp from '@mendable/firecrawl-js';

type AllowedTools =
  | 'deepResearch'
  | 'search'
  | 'extract'
  | 'scrape';


const firecrawlTools: AllowedTools[] = ['search', 'extract', 'scrape'];

const allTools: AllowedTools[] = [...firecrawlTools, 'deepResearch'];

const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || '',
});

// --- DEVELOPMENT ONLY: Hardcode User ---
// WARNING: NEVER USE THIS IN PRODUCTION. REMOVE BEFORE DEPLOYING.
const DEV_USER_EMAIL = 'nagy.viktordp@gmail.com';
// --- END DEVELOPMENT ONLY ---


export async function POST(request: Request) {
  const maxDuration = process.env.MAX_DURATION
    ? parseInt(process.env.MAX_DURATION)
    : 300;

  const {
    id,
    messages,
    modelId,
    reasoningModelId,
    experimental_deepResearch = false,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    reasoningModelId: string;
    experimental_deepResearch?: boolean;
  } = await request.json();


  // --- DEVELOPMENT ONLY: Fetch Hardcoded User ---
  // WARNING: This section bypasses authentication. Remove for production.
  console.warn(`--- DEVELOPMENT MODE: POST using hardcoded user ${DEV_USER_EMAIL} ---`);
  let developmentUser: User | null = null; // Assuming User type from schema
  try {
      const users = await getUserByEmail(DEV_USER_EMAIL);
      if (users.length === 0) {
          console.error(`FATAL DEV ERROR: Hardcoded user ${DEV_USER_EMAIL} not found in database.`);
          // Respond with an error, as proceeding is impossible
          return new Response(`Development user ${DEV_USER_EMAIL} not found`, { status: 500 });
      }
      developmentUser = users[0]; // Get the first user found

      // Ensure the fetched user has a valid UUID id
      if (!developmentUser.id || typeof developmentUser.id !== 'string') {
           console.error(`FATAL DEV ERROR: Hardcoded user ${DEV_USER_EMAIL} found but missing valid UUID 'id'. DB record:`, developmentUser);
           return new Response(`Development user ${DEV_USER_EMAIL} has invalid ID`, { status: 500 });
      }

      console.log(`Using hardcoded user: ${developmentUser.email} (ID: ${developmentUser.id})`);

  } catch (error) {
      console.error(`Error fetching hardcoded user ${DEV_USER_EMAIL}:`, error);
      return new Response('Failed to fetch development user', { status: 500 });
  }
  // Ensure we actually got the user before proceeding
  if (!developmentUser) {
     // Should have been caught above, but as a safeguard:
     return new Response('Failed to load development user', { status: 500 });
  }
  // --- END DEVELOPMENT ONLY ---


  /* --- REMOVE OR COMMENT OUT ORIGINAL AUTH LOGIC ---

  let session = await auth();

  // If no session exists, create an anonymous session
  if (!session?.user) {
    // ... (anonymous session creation logic removed for brevity) ...
  }

  if (!session?.user?.id || !session?.user?.email) {
    return new Response('Failed to create session', { status: 500 });
  }

   // Verify user exists in database before proceeding (REDUNDANT NOW)
   try {
    // *** CORRECTION 2: Use getUserByEmail ***
    const users = await getUserByEmail(session.user.email); // Check by email
    if (users.length === 0) {
      // ... (verification logic removed) ...
    }
     console.log(`Verified user ${session.user.email} exists.`);
  } catch (error) {
    // ... (error handling removed) ...
  }
  --- END REMOVED AUTH LOGIC --- */


  // Apply rate limiting using the hardcoded user's ID (UUID)
  const identifier = developmentUser.id; // Use the fetched UUID
  const { success, limit, reset, remaining } =
    await rateLimiter.limit(identifier);

  if (!success) {
    // Log which user hit the limit for debugging
    console.warn(`Rate limit exceeded for hardcoded user: ${developmentUser.email} (ID: ${identifier})`);
    return new Response(`Too many requests`, { status: 429 });
  }

  const model = models.find((model) => model.id === modelId);
  const reasoningModel = reasoningModels.find((model) => model.id === reasoningModelId);

  if (!model || !reasoningModel) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  // Use the hardcoded user's ID (UUID) when saving the chat
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    // Ensure userId is the UUID from the fetched developmentUser
    console.log(`Attempting to save chat info for ID: ${id}, UserID: ${developmentUser.id}`);
    await saveChat({ id, userId: developmentUser.id, title });
    console.log(`Successfully saved chat info for ID: ${id}`);
  }

  const userMessageId = generateUUID();

  // Save messages associated with the chat (no direct user ID needed here)
  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });


  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const result = streamText({
        // Router model
        model: customModel(model.apiIdentifier, false),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 10,
        experimental_activeTools: experimental_deepResearch ? allTools : firecrawlTools,
        tools: {
          search: {
            description:
              "Search for web pages. Normally you should call the extract tool after this one to get a spceific data point if search doesn't the exact data you need.",
            parameters: z.object({
              query: z
                .string()
                .describe('Search query to find relevant web pages'),
              maxResults: z
                .number()
                .optional()
                .describe('Maximum number of results to return (default 10)'),
            }),
            execute: async ({ query, maxResults = 5 }) => {
              try {
                const searchResult = await app.search(query);

                if (!searchResult.success) {
                  return {
                    error: `Search failed: ${searchResult.error}`,
                    success: false,
                  };
                }

                // Add favicon URLs to search results
                const resultsWithFavicons = searchResult.data.map((result: any) => {
                  const url = new URL(result.url);
                  const favicon = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
                  return {
                    ...result,
                    favicon
                  };
                });

                searchResult.data = resultsWithFavicons;

                return {
                  data: searchResult.data,
                  success: true,
                };
              } catch (error: any) {
                return {
                  error: `Search failed: ${error.message}`,
                  success: false,
                };
              }
            },
          },
          extract: {
            description:
              'Extract structured data from web pages. Use this to get whatever data you need from a URL. Any time someone needs to gather data from something, use this tool.',
            parameters: z.object({
              urls: z.array(z.string()).describe(
                'Array of URLs to extract data from',
                // , include a /* at the end of each URL if you think you need to search for other pages insides that URL to extract the full data from',
              ),
              prompt: z
                .string()
                .describe('Description of what data to extract'),
            }),
            execute: async ({ urls, prompt }) => {
              try {
                const scrapeResult = await app.extract(urls, {
                  prompt,
                });

                if (!scrapeResult.success) {
                  return {
                    error: `Failed to extract data: ${scrapeResult.error}`,
                    success: false,
                  };
                }

                return {
                  data: scrapeResult.data,
                  success: true,
                };
              } catch (error: any) {
                console.error('Extraction error:', error);
                console.error(error.message);
                console.error(error.error);
                return {
                  error: `Extraction failed: ${error.message}`,
                  success: false,
                };
              }
            },
          },
          scrape: {
            description:
              'Scrape web pages. Use this to get from a page when you have the url.',
            parameters: z.object({
              url: z.string().describe('URL to scrape'),
            }),
            execute: async ({ url }: { url: string }) => {
              try {
                const scrapeResult = await app.scrapeUrl(url);

                if (!scrapeResult.success) {
                  return {
                    error: `Failed to extract data: ${scrapeResult.error}`,
                    success: false,
                  };
                }

                return {
                  data:
                    scrapeResult.markdown ??
                    'Could get the page content, try using search or extract',
                  success: true,
                };
              } catch (error: any) {
                console.error('Extraction error:', error);
                console.error(error.message);
                console.error(error.error);
                return {
                  error: `Extraction failed: ${error.message}`,
                  success: false,
                };
              }
            },
          },
          deepResearch: {
            description:
              'Perform deep research on a topic using an AI agent that coordinates search, extract, and analysis tools with reasoning steps.',
            parameters: z.object({
              topic: z.string().describe('The topic or question to research'),
            }),
            execute: async ({ topic, maxDepth = 7 }) => {
              const startTime = Date.now();
              const timeLimit = 4.5 * 60 * 1000; // 4 minutes 30 seconds in milliseconds

              const researchState = {
                findings: [] as Array<{ text: string; source: string }>,
                summaries: [] as Array<string>,
                nextSearchTopic: '',
                urlToSearch: '',
                currentDepth: 0,
                failedAttempts: 0,
                maxFailedAttempts: 3,
                completedSteps: 0,
                totalExpectedSteps: maxDepth * 5,
              };

              // Initialize progress tracking
              dataStream.writeData({
                type: 'progress-init',
                content: {
                  maxDepth,
                  totalSteps: researchState.totalExpectedSteps,
                },
              });

              const addSource = (source: {
                url: string;
                title: string;
                description: string;
              }) => {
                dataStream.writeData({
                  type: 'source-delta',
                  content: source,
                });
              };

              const addActivity = (activity: {
                type:
                | 'search'
                | 'extract'
                | 'analyze'
                | 'reasoning'
                | 'synthesis'
                | 'thought';
                status: 'pending' | 'complete' | 'error';
                message: string;
                timestamp: string;
                depth: number;
              }) => {
                if (activity.status === 'complete') {
                  researchState.completedSteps++;
                }

                dataStream.writeData({
                  type: 'activity-delta',
                  content: {
                    ...activity,
                    depth: researchState.currentDepth,
                    completedSteps: researchState.completedSteps,
                    totalSteps: researchState.totalExpectedSteps,
                  },
                });
              };

              const analyzeAndPlan = async (
                findings: Array<{ text: string; source: string }>,
              ) => {
                try {
                  const timeElapsed = Date.now() - startTime;
                  const timeRemaining = timeLimit - timeElapsed;
                  const timeRemainingMinutes =
                    Math.round((timeRemaining / 1000 / 60) * 10) / 10;

                  // Reasoning model
                  const result = await generateText({
                    model: customModel(reasoningModel.apiIdentifier, true),
                    prompt: `You are a research agent analyzing findings about: ${topic}
                            You have ${timeRemainingMinutes} minutes remaining to complete the research but you don't need to use all of it.
                            Current findings: ${findings
                        .map((f) => `[From ${f.source}]: ${f.text}`)
                        .join('\n')}
                            What has been learned? What gaps remain? What specific aspects should be investigated next if any?
                            If you need to search for more information, include a nextSearchTopic.
                            If you need to search for more information in a specific URL, include a urlToSearch.
                            Important: If less than 1 minute remains, set shouldContinue to false to allow time for final synthesis.
                            If I have enough information, set shouldContinue to false.
                            
                            Respond in this exact JSON format:
                            {
                              "analysis": {
                                "summary": "summary of findings",
                                "gaps": ["gap1", "gap2"],
                                "nextSteps": ["step1", "step2"],
                                "shouldContinue": true/false,
                                "nextSearchTopic": "optional topic",
                                "urlToSearch": "optional url"
                              }
                            }`,
                  });

                  try {
                    const parsed = JSON.parse(result.text);
                    return parsed.analysis;
                  } catch (error) {
                    console.error('Failed to parse JSON response:', error);
                    return null;
                  }
                } catch (error) {
                  console.error('Analysis error:', error);
                  return null;
                }
              };

              const extractFromUrls = async (urls: string[]) => {
                const extractPromises = urls.map(async (url) => {
                  try {
                    addActivity({
                      type: 'extract',
                      status: 'pending',
                      message: `Analyzing ${new URL(url).hostname}`,
                      timestamp: new Date().toISOString(),
                      depth: researchState.currentDepth,
                    });

                    const result = await app.extract([url], {
                      prompt: `Extract key information about ${topic}. Focus on facts, data, and expert opinions. Analysis should be full of details and very comprehensive.`,
                    });

                    if (result.success) {
                      addActivity({
                        type: 'extract',
                        status: 'complete',
                        message: `Extracted from ${new URL(url).hostname}`,
                        timestamp: new Date().toISOString(),
                        depth: researchState.currentDepth,
                      });

                      if (Array.isArray(result.data)) {
                        return result.data.map((item) => ({
                          text: item.data,
                          source: url,
                        }));
                      }
                      return [{ text: result.data, source: url }];
                    }
                    return [];
                  } catch {
                    // console.warn(`Extraction failed for ${url}:`);
                    return [];
                  }
                });

                const results = await Promise.all(extractPromises);
                return results.flat();
              };

              try {
                while (researchState.currentDepth < maxDepth) {
                  const timeElapsed = Date.now() - startTime;
                  if (timeElapsed >= timeLimit) {
                    break;
                  }

                  researchState.currentDepth++;

                  dataStream.writeData({
                    type: 'depth-delta',
                    content: {
                      current: researchState.currentDepth,
                      max: maxDepth,
                      completedSteps: researchState.completedSteps,
                      totalSteps: researchState.totalExpectedSteps,
                    },
                  });

                  // Search phase
                  addActivity({
                    type: 'search',
                    status: 'pending',
                    message: `Searching for "${topic}"`,
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  let searchTopic = researchState.nextSearchTopic || topic;
                  const searchResult = await app.search(searchTopic);

                  if (!searchResult.success) {
                    addActivity({
                      type: 'search',
                      status: 'error',
                      message: `Search failed for "${searchTopic}"`,
                      timestamp: new Date().toISOString(),
                      depth: researchState.currentDepth,
                    });

                    researchState.failedAttempts++;
                    if (
                      researchState.failedAttempts >=
                      researchState.maxFailedAttempts
                    ) {
                      break;
                    }
                    continue;
                  }

                  addActivity({
                    type: 'search',
                    status: 'complete',
                    message: `Found ${searchResult.data.length} relevant results`,
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  // Add sources from search results
                  searchResult.data.forEach((result: any) => {
                    addSource({
                      url: result.url,
                      title: result.title,
                      description: result.description,
                    });
                  });

                  // Extract phase
                  const topUrls = searchResult.data
                    .slice(0, 3)
                    .map((result: any) => result.url);

                  const newFindings = await extractFromUrls([
                    researchState.urlToSearch,
                    ...topUrls,
                  ]);
                  researchState.findings.push(...newFindings);

                  // Analysis phase
                  addActivity({
                    type: 'analyze',
                    status: 'pending',
                    message: 'Analyzing findings',
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  const analysis = await analyzeAndPlan(researchState.findings);
                  researchState.nextSearchTopic =
                    analysis?.nextSearchTopic || '';
                  researchState.urlToSearch = analysis?.urlToSearch || '';
                  researchState.summaries.push(analysis?.summary || '');

                  console.log(analysis);
                  if (!analysis) {
                    addActivity({
                      type: 'analyze',
                      status: 'error',
                      message: 'Failed to analyze findings',
                      timestamp: new Date().toISOString(),
                      depth: researchState.currentDepth,
                    });

                    researchState.failedAttempts++;
                    if (
                      researchState.failedAttempts >=
                      researchState.maxFailedAttempts
                    ) {
                      break;
                    }
                    continue;
                  }

                  addActivity({
                    type: 'analyze',
                    status: 'complete',
                    message: analysis.summary,
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  if (!analysis.shouldContinue || analysis.gaps.length === 0) {
                    break;
                  }

                  topic = analysis.gaps.shift() || topic;
                }

                // Final synthesis
                addActivity({
                  type: 'synthesis',
                  status: 'pending',
                  message: 'Preparing final analysis',
                  timestamp: new Date().toISOString(),
                  depth: researchState.currentDepth,
                });

                const finalAnalysis = await generateText({
                  model: customModel(reasoningModel.apiIdentifier, true),
                  maxTokens: 16000,
                  prompt: `Create a comprehensive long analysis of ${topic} based on these findings:
                          ${researchState.findings
                      .map((f) => `[From ${f.source}]: ${f.text}`)
                      .join('\n')}
                          ${researchState.summaries
                            .map((s) => `[Summary]: ${s}`)
                            .join('\n')}
                          Provide all the thoughts processes including findings details,key insights, conclusions, and any remaining uncertainties. Include citations to sources where appropriate. This analysis should be very comprehensive and full of details. It is expected to be very long, detailed and comprehensive.`,
                });

                addActivity({
                  type: 'synthesis',
                  status: 'complete',
                  message: 'Research completed',
                  timestamp: new Date().toISOString(),
                  depth: researchState.currentDepth,
                });

                dataStream.writeData({
                  type: 'finish',
                  content: finalAnalysis.text,
                });

                return {
                  success: true,
                  data: {
                    findings: researchState.findings,
                    analysis: finalAnalysis.text,
                    completedSteps: researchState.completedSteps,
                    totalSteps: researchState.totalExpectedSteps,
                  },
                };
              } catch (error: any) {
                console.error('Deep research error:', error);

                addActivity({
                  type: 'thought',
                  status: 'error',
                  message: `Research failed: ${error.message}`,
                  timestamp: new Date().toISOString(),
                  depth: researchState.currentDepth,
                });

                return {
                  success: false,
                  error: error.message,
                  data: {
                    findings: researchState.findings,
                    completedSteps: researchState.completedSteps,
                    totalSteps: researchState.totalExpectedSteps,
                  },
                };
              }
            },
          },
        },
        onFinish: async ({ response }) => {
          // *** IMPORTANT: Use developmentUser here if in dev mode ***
          // if (session.user?.id) { // Original code
          if (developmentUser?.id) { // Should be this in your dev setup
            try {    // Add this log:
              console.log(`[onFinish] Value of 'id' (chatId) right before mapping messages:`, id);
        
              if (!id) {
                 console.error("[onFinish] CRITICAL: 'id' (chatId) is NULL or UNDEFINED before mapping messages! Cannot save.");
                 return; // Exit early to prevent the error
              }

              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(response.messages);
              console.log('[onFinish] Output of sanitizeResponseMessages:', JSON.stringify(responseMessagesWithoutIncompleteToolCalls, null, 2));

              // --- Log Correction: This log message should describe saving ASSISTANT messages ---
              // console.log(`Attempting to save initial user message for ChatID: ${id}`); // Incorrect log text

              await saveMessages({ // ---> Potential Error Point 3 <---
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message, index) => {
                    console.log(`[onFinish .map() index ${index}] Processing message object:`, JSON.stringify(message, null, 2));

                    const messageId = generateUUID();
                    if (message.role === 'assistant') {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }
                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  },
                ),
              });

              // --- Log Correction: This log message should describe saving ASSISTANT messages ---
              // console.log(`Successfully saved initial user message for ChatID: ${id}`); // Incorrect log text

            } catch (error) {
              console.error('Failed to save chat');
            }
          } else {
             console.warn("onFinish skipped saving messages: developmentUser ID was missing.");
          }
        },
        
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  // --- DEVELOPMENT ONLY: Hardcode User for DELETE ---
  // WARNING: This section bypasses authentication. Remove for production.
  console.warn(`--- DEVELOPMENT MODE: DELETE using hardcoded user ${DEV_USER_EMAIL} ---`);
  let developmentUser: User | null = null;
  try {
      const users = await getUserByEmail(DEV_USER_EMAIL);
      if (users.length === 0) {
          console.error(`FATAL DEV ERROR: Hardcoded user ${DEV_USER_EMAIL} not found in database for DELETE.`);
          return new Response(`Development user ${DEV_USER_EMAIL} not found`, { status: 500 });
      }
      developmentUser = users[0];
       if (!developmentUser.id || typeof developmentUser.id !== 'string') {
           console.error(`FATAL DEV ERROR: Hardcoded user ${DEV_USER_EMAIL} found but missing valid UUID 'id' for DELETE.`);
           return new Response(`Development user ${DEV_USER_EMAIL} has invalid ID`, { status: 500 });
       }
      console.log(`DELETE using hardcoded user: ${developmentUser.email} (ID: ${developmentUser.id})`);
  } catch (error) {
      console.error(`Error fetching hardcoded user ${DEV_USER_EMAIL} for DELETE:`, error);
      return new Response('Failed to fetch development user for DELETE', { status: 500 });
  }
   if (!developmentUser) {
     return new Response('Failed to load development user for DELETE', { status: 500 });
  }
  // --- END DEVELOPMENT ONLY ---

  /* --- REMOVE OR COMMENT OUT ORIGINAL AUTH LOGIC FOR DELETE ---
  let session = await auth();

  if (!session?.user) {
    // ... (anonymous session creation logic removed) ...
  }

  if (!session?.user?.id) {
    // ... (error handling removed) ...
  }
  --- END REMOVED AUTH LOGIC --- */

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // This is the Chat ID

  if (!id) {
    return new Response('Not Found - Chat ID missing', { status: 404 });
  }

  try {
    const chat = await getChatById({ id });

    // Check if chat exists
    if (!chat) {
        console.warn(`DELETE failed: Chat with ID ${id} not found.`);
        return new Response('Chat Not Found', { status: 404 });
    }

    // Authorize using the hardcoded user's ID (UUID)
    if (chat.userId !== developmentUser.id) {
      console.warn(`Unauthorized DELETE attempt: Chat user ${chat.userId}, Hardcoded user ${developmentUser.id}`);
      return new Response('Unauthorized', { status: 401 });
    }

    // Proceed with deletion
    await deleteChatById({ id });
    console.log(`Chat ${id} deleted successfully by hardcoded user ${developmentUser.email}`);
    return new Response('Chat deleted', { status: 200 });

  } catch (error) {
    console.error(`Error during chat deletion (Chat ID: ${id}):`, error); // Log error with Chat ID
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}