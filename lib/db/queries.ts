// Ensures this module only runs on the server
import 'server-only';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session'; // Assuming this path is correct

// Import the entire schema as an object
import * as schema from './schema';
// Import specific types needed for function signatures etc.
import { type User, type TeamDataWithMembers, type Suggestion, type Message } from './schema';

import { BlockKind } from '@/components/block'; // Assuming this path is correct

// biome-ignore lint: Forbidden non-null assertion. - Kept from original
const client = postgres(process.env.POSTGRES_URL!);

// Initialize drizzle with the schema for relational queries
const db = drizzle(client, { schema });

// --- User and Auth Related Functions ---

/**
 * Gets user based on session cookie. Returns null if no valid session.
 */
export async function getUser(): Promise<User | null> {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const sessionData = await verifyToken(sessionCookie.value);

    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      console.error('Invalid session data or user ID type:', sessionData);
      return null;
    }

    const userResult = await db
      .select()
      .from(schema.users) // Use schema.users
      .where(and(eq(schema.users.id, sessionData.user.id), isNull(schema.users.deletedAt))) // Use schema.users
      .limit(1);

    if (userResult.length === 0) {
      console.log('User not found for session ID:', sessionData.user.id);
      return null;
    }
    // Drizzle returns the correct type based on the select, casting might not be needed
    // but ensure the User type matches the selected fields
    return userResult[0] as User;

  } catch (error) {
      console.error('Failed to verify token or get user from session:', error);
      return null;
  }
}


/**
 * Gets user by email address.
 */
export async function getUserByEmail(email: string): Promise<Array<User>> {
  return db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email));
}


/**
 * Creates a new user with a hashed password.
 */
export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt); // Calculate the hash
  try {
    // Use the correct field name 'passwordHash' matching your schema
    return await db.insert(schema.users).values({
      email: email,
      passwordHash: hash // Corrected field name
    });
  } catch (error) {
    console.error('Failed to create user in database:', error);
    // Consider more specific error handling or re-throwing a custom error
    throw error;
  }
}


/**
 * Gets a user along with their associated team ID.
 */
export async function getUserWithTeam(userId: number) {
    try {
        const result = await db
            .select({
                user: schema.users, // Use schema.users
                teamId: schema.teamMembers.teamId // Use schema.teamMembers
            })
            .from(schema.users) // Use schema.users
            .leftJoin(schema.teamMembers, eq(schema.users.id, schema.teamMembers.userId)) // Use schema.users, schema.teamMembers
            .where(eq(schema.users.id, userId)) // Use schema.users
            .limit(1);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error(`Failed to get user with team for userId ${userId}:`, error);
        throw error;
    }
}


// --- Team Related Functions ---

/**
 * Gets the team associated with the currently authenticated user.
 * THIS IS THE FUNCTION THAT CAUSED THE ERROR.
 */
export async function getTeamForUser(): Promise<TeamDataWithMembers | null> { // Adjust TeamDataWithMembers type if needed
  const user = await getUser();
  if (!user) {
    return null;
  }

  try {
    // Now db.query.teamMembers should be defined because schema was passed to drizzle()
    const result = await db.query.teamMembers.findFirst({
      // Use schema object for table fields in where clause for consistency
      where: eq(schema.teamMembers.userId, user.id),
      with: {
        team: {
          with: {
            teamMembers: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });
    // Ensure the type matches what you expect TeamDataWithMembers to be
    // The relational query directly returns nested structure based on 'with'
    return result?.team || null;
  } catch (error) {
      // The error log now correctly points here if something else goes wrong
      console.error(`Failed to get team for user ${user.id}:`, error);
      throw error;
  }
}

/**
 * Gets a team by its Stripe Customer ID.
 */
export async function getTeamByStripeCustomerId(customerId: string) {
    try {
        const result = await db
            .select()
            .from(schema.teams) // Use schema.teams
            .where(eq(schema.teams.stripeCustomerId, customerId)) // Use schema.teams
            .limit(1);
        // Ensure result[0] matches the Team type from your schema if needed
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error(`Failed to get team by Stripe customer ID ${customerId}:`, error);
        throw error;
    }
}

/**
 * Updates a team's subscription details.
 */
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  try {
    await db
      .update(schema.teams) // Use schema.teams
      .set({
        ...subscriptionData,
        updatedAt: new Date()
      })
      .where(eq(schema.teams.id, teamId)); // Use schema.teams
  } catch (error) {
      console.error(`Failed to update subscription for team ${teamId}:`, error);
      throw error;
  }
}

// --- Chat Related Functions ---

export async function saveChat({
  id,
  userId, // Ensure this ID type (string/number) matches schema.chat.userId
  title,
}: {
  id: string;
  userId: string; // Kept as string, adjust if needed
  title: string;
}) {
  try {
    return await db.insert(schema.chat).values({ // Use schema.chat
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database:', error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Consider transaction: await db.transaction(async (tx) => { ... });
    await db.delete(schema.vote).where(eq(schema.vote.chatId, id)); // Use schema.vote
    await db.delete(schema.message).where(eq(schema.message.chatId, id)); // Use schema.message
    return await db.delete(schema.chat).where(eq(schema.chat.id, id)); // Use schema.chat
  } catch (error) {
    console.error('Failed to delete chat by id from database:', error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) { // Ensure ID type matches schema.chat.userId
  try {
    return await db
      .select()
      .from(schema.chat) // Use schema.chat
      .where(eq(schema.chat.userId, id)) // Use schema.chat
      .orderBy(desc(schema.chat.createdAt)); // Use schema.chat
  } catch (error) {
    console.error('Failed to get chats by user from database:', error);
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(schema.chat).where(eq(schema.chat.id, id)); // Use schema.chat
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database:', error);
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(schema.chat).set({ visibility }).where(eq(schema.chat.id, chatId)); // Use schema.chat
  } catch (error) {
    console.error('Failed to update chat visibility in database:', error);
    throw error;
  }
}


// --- Message Related Functions ---

export async function saveMessages({ messages }: { messages: Array<Message> }) { // Ensure Message type matches schema.message
  try {
    // Make sure fields in Message[] match columns in schema.message
    return await db.insert(schema.message).values(messages); // Use schema.message
  } catch (error) {
    console.error('Failed to save messages in database:', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(schema.message) // Use schema.message
      .where(eq(schema.message.chatId, id)) // Use schema.message
      .orderBy(asc(schema.message.createdAt)); // Use schema.message
  } catch (error) {
    console.error('Failed to get messages by chat id from database:', error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
    try {
        const result = await db.select().from(schema.message).where(eq(schema.message.id, id)).limit(1); // Use schema.message
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Failed to get message by id from database:', error);
        throw error;
    }
}


export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(schema.message) // Use schema.message
      .where(
        and(eq(schema.message.chatId, chatId), gte(schema.message.createdAt, timestamp)), // Use schema.message
      );
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database:',
      error
    );
    throw error;
  }
}


// --- Vote Related Functions ---

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(schema.vote) // Use schema.vote
      .where(eq(schema.vote.messageId, messageId)); // Use schema.vote

    if (existingVote) {
      return await db
        .update(schema.vote) // Use schema.vote
        .set({ isUpvoted: type === 'up' })
        // Use schema.vote in where clause
        .where(and(eq(schema.vote.messageId, messageId), eq(schema.vote.chatId, chatId)));
    }
    // Ensure values match schema.vote columns
    return await db.insert(schema.vote).values({ // Use schema.vote
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to vote message in database:', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(schema.vote).where(eq(schema.vote.chatId, id)); // Use schema.vote
  } catch (error) {
    console.error('Failed to get votes by chat id from database:', error);
    throw error;
  }
}


// --- Document & Suggestion Related Functions ---

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId, // Ensure this ID type matches schema.document.userId
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string; // Kept as string, adjust if needed
}) {
  try {
    // Ensure values match schema.document columns
    return await db.insert(schema.document).values({ // Use schema.document
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database:', error);
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(schema.document) // Use schema.document
      .where(eq(schema.document.id, id)) // Use schema.document
      .orderBy(asc(schema.document.createdAt)); // Use schema.document
    return documents;
  } catch (error) {
    console.error('Failed to get documents by id from database:', error);
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
    try {
        const result = await db
            .select()
            .from(schema.document) // Use schema.document
            .where(eq(schema.document.id, id)) // Use schema.document
            .orderBy(desc(schema.document.createdAt)) // Use schema.document
            .limit(1);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Failed to get latest document by id from database:', error);
        throw error;
    }
}


export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    // Consider transaction
    await db
      .delete(schema.suggestion) // Use schema.suggestion
      .where(
        and(
          eq(schema.suggestion.documentId, id), // Use schema.suggestion
          // Use schema.suggestion if documentCreatedAt exists there
          gt(schema.suggestion.documentCreatedAt, timestamp),
        ),
      );
    return await db
      .delete(schema.document) // Use schema.document
      // Use schema.document in where clause
      .where(and(eq(schema.document.id, id), gt(schema.document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database:',
      error
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>; // Ensure Suggestion type matches schema.suggestion
}) {
  try {
    // Ensure fields in Suggestion[] match columns in schema.suggestion
    return await db.insert(schema.suggestion).values(suggestions); // Use schema.suggestion
  } catch (error) {
    console.error('Failed to save suggestions in database:', error);
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(schema.suggestion) // Use schema.suggestion
      .where(eq(schema.suggestion.documentId, documentId)); // Use schema.suggestion
  } catch (error) {
    console.error(
      'Failed to get suggestions by document id from database:',
      error
    );
    throw error;
  }
}

// --- Activity Log Functions ---

export async function getActivityLogs() {
    const user = await getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    try {
        return await db
            .select({
                id: schema.activityLogs.id, // Use schema.activityLogs
                action: schema.activityLogs.action, // Use schema.activityLogs
                timestamp: schema.activityLogs.timestamp, // Use schema.activityLogs
                ipAddress: schema.activityLogs.ipAddress, // Use schema.activityLogs
                userName: schema.users.name // Use schema.users
            })
            .from(schema.activityLogs) // Use schema.activityLogs
            .leftJoin(schema.users, eq(schema.activityLogs.userId, schema.users.id)) // Use schema.activityLogs, schema.users
            .where(eq(schema.activityLogs.userId, user.id)) // Use schema.activityLogs
            .orderBy(desc(schema.activityLogs.timestamp)) // Use schema.activityLogs
            .limit(10);
    } catch (error) {
        console.error(`Failed to get activity logs for user ${user.id}:`, error);
        throw error;
    }
}