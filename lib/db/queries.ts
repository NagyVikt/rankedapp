// Ensures this module only runs on the server
'use server'; // Ensures this module only runs on the server

import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  isNull,
  sql,
  SQLWrapper,
} from 'drizzle-orm';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { RowList } from 'postgres';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { v4 as generateUUID } from 'uuid'; // Import UUID generator
import { createServerClient } from '@supabase/ssr';

// Import the entire schema as an object
import * as schema from './schema';

// Import specific types needed for function signatures etc.
// Drizzle's $inferSelect and $inferInsert are preferred for table types.
import type {
  TeamMember,
  ActivityLog,
  Invitation,
  Webshop,
  Design,
  Customer,
  Campaign,
  Chat,
  Message,
  Vote,
  Document,
  Suggestion,
} from './schema'; // These are SELECT types (typeof schema.tableName.$inferSelect)
export type User = typeof schema.user.$inferSelect;
export type Team = typeof schema.teams.$inferSelect;
// For INSERT types, use Drizzle's $inferInsert
type NewUser = typeof schema.user.$inferInsert;
type NewTeam = typeof schema.teams.$inferInsert;
type NewTeamMember = typeof schema.teamMembers.$inferInsert;
type NewActivityLog = typeof schema.activityLogs.$inferInsert;
type NewInvitation = typeof schema.invitations.$inferInsert;
type NewWebshop = typeof schema.webshops.$inferInsert;
type NewDesign = typeof schema.designs.$inferInsert;
type NewCustomer = typeof schema.customers.$inferInsert;
type NewCampaign = typeof schema.campaigns.$inferInsert;
type NewChat = typeof schema.chat.$inferInsert;
type NewMessage = typeof schema.message.$inferInsert;
type NewVote = typeof schema.vote.$inferInsert;
type NewDocument = typeof schema.document.$inferInsert;
type NewSuggestion = typeof schema.suggestion.$inferInsert;

// Define DocumentKind based on the error message and common usage
type DocumentKind = 'text' | 'code' | 'spreadsheet';

// biome-ignore lint: Forbidden non-null assertion. - Kept from original
const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);

// Initialize drizzle with the schema for relational queries
// and standard query builder access
// Specify the schema type for better type checking with db.query
const db: PostgresJsDatabase<typeof schema> = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
}); // Enable logger in dev

// === Helper Function for Supabase Auth ===

export interface TeamMemberInfo {
  id: number; // Assuming team_members.id is number (SERIAL)
  role: string;
  // IMPORTANT: schema.teamMembers.userId in your './schema.ts' MUST be defined as a string-based getUser
  // (e.g., text() or uuid() that references user.id) for the 'eq' comparisons below to work.
  // The TypeScript error "Argument of type 'string' is not assignable to parameter of type 'number | SQLWrapper'"
  // indicates that Drizzle currently infers schema.teamMembers.userId as a number.
  // THIS IS THE ROOT CAUSE OF THE 'eq' ERRORS.
  userId: string;
  teamId: number;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface TeamDataWithMembers extends Team {
  // Extend the base Team type
  teamMembers: TeamMemberInfo[];
}

/**
 * Gets the authenticated Supabase user for the current request.
 * Returns null if not authenticated or on error.
 */

/**
 * Gets a server‐side Supabase client, using HTTP cookies for auth.
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (tos) =>
          tos.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );
}

/**
 * Retrieves the authenticated user via Supabase auth and maps to our Drizzle `User`.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await getSupabaseClient();
  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser();
  if (error || !supabaseUser) return null;
  return (
    (await db.query.user.findFirst({
      where: eq(schema.user.id, supabaseUser.id),
    })) ?? null
  );
}

// === User and Auth Related Functions ===

/**
 * Fetch a single user by email.
 * @param email The user's email address
 * @returns The User object or null if not found
 */
export async function getUser(email: string): Promise<User | null> {
  const results = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email));
  return results.length > 0 ? results[0] : null;
}

/**
 * Gets user by email address from your public.User table.
 */

/**
 * Gets user by ID from your public.User table.
 * Assumes ID is UUID (string).
 */
export async function getUserById(id: string): Promise<User | null> {
  if (!id) return null;
  try {
    const userResult = await db.query.user.findFirst({
      where: and(eq(schema.user.id, id), isNull(schema.user.deletedAt)),
    });
    return userResult || null;
  } catch (error) {
    console.error(`Failed to get user by ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new user record with hashed password.
 * @param email The user's email
 * @param passwordPlainText Plaintext password (will be hashed)
 * @param name Optional user name
 * @returns The newly created User
 */

export async function createUser(
  email: string,
  passwordPlainText: string,
  name?: string | null,
): Promise<User> {
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(passwordPlainText, salt);

  // Now include `id` in valuesToInsert
  const valuesToInsert: NewUser = {
    id: generateUUID(),
    email,
    name: name ?? undefined,
    role: 'member',
  };

  const [insertedUser] = await db
    .insert(schema.user)
    .values(valuesToInsert)
    .returning();

  return insertedUser;
}

// --- Team Related Functions ---

/**
 * Creates a new team.
 */
export async function createTeam(
  teamData: Omit<NewTeam, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Team> {
  // Note: Removed { id?: number } from input as 'id' is typically serial/auto-generated.
  // If you need to specify ID for some reason, ensure your schema supports it.
  const valuesToInsert: NewTeam = {
    ...teamData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  try {
    const [insertedTeam] = await db
      .insert(schema.teams)
      .values(valuesToInsert)
      .returning();
    return insertedTeam;
  } catch (error) {
    console.error('Failed to create team:', error);
    throw error;
  }
}

/**
 * Gets a team by its ID (SERIAL, number).
 */
export async function getTeamById(teamId: number): Promise<Team | null> {
  try {
    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.id, teamId),
    });
    return team || null;
  } catch (error) {
    console.error(`Failed to get team by ID ${teamId}:`, error);
    throw error;
  }
}

/**
 * Gets the team associated with the currently authenticated user.
 * Assumes a user belongs to only one team via team_members.
 * Returns the Team data along with members and their user details.
 *
 * !!! CRITICAL SCHEMA REQUIREMENT !!!
 * The 'eq' call below (eq(schema.teamMembers.userId, user.id))
 * WILL FAIL if schema.teamMembers.userId is not defined as a STRING-BASED type
 * (e.g., text() or uuid()) in your './schema.ts' file.
 * The error "Argument of type 'string' is not assignable to parameter of type 'number | SQLWrapper'"
 * means Drizzle infers schema.teamMembers.userId as a 'number'.
 * PLEASE VERIFY AND CORRECT YOUR './schema.ts' DEFINITION FOR 'teamMembers.userId'.
 */
export async function getTeamDataForCurrentUser(): Promise<TeamDataWithMembers | null> {
  const user = await getAuthenticatedUser();
  if (!user?.id) return null;

  // The following `eq` call requires schema.teamMembers.userId to be a string-based column type
  // in your schema.ts to match user.id (string).
  const membership = await db.query.teamMembers.findFirst({
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
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!membership?.team) return null;

  return membership.team as unknown as TeamDataWithMembers;
}

/**
 * Gets a team by its Stripe Customer ID.
 */
export async function getTeamByStripeCustomerId(
  customerId: string,
): Promise<Team | null> {
  if (!customerId) return null;
  try {
    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.stripeCustomerId, customerId),
    });
    return team || null;
  } catch (error) {
    console.error(
      `Failed to get team by Stripe customer ID ${customerId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Updates a team's subscription details. Assumes teamId is number (SERIAL).
 */
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: Partial<
    Pick<
      Team,
      | 'stripeSubscriptionId'
      | 'stripeProductId'
      | 'planName'
      | 'subscriptionStatus'
    >
  >,
): Promise<Team | null> {
  try {
    const [updatedTeam] = await db
      .update(schema.teams)
      .set({
        ...subscriptionData,
        updatedAt: new Date(), // Assuming 'teams' table has 'updatedAt' and it's manually settable
      })
      .where(eq(schema.teams.id, teamId))
      .returning();
    if (!updatedTeam) {
      console.warn(
        `Attempted to update subscription for non-existent team ID ${teamId}`,
      );
      return null;
    }
    return updatedTeam;
  } catch (error) {
    console.error(`Failed to update subscription for team ${teamId}:`, error);
    throw error;
  }
}

// --- Webshop Related Functions ---

/**
 * Creates a new webshop for a user.
 */
export async function createWebshop(
  webshopData: Omit<NewWebshop, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Webshop> {
  const valuesToInsert: NewWebshop = {
    ...webshopData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (!valuesToInsert.userId) {
    throw new Error('userId is required to create a webshop.');
  }
  try {
    const [insertedWebshop] = await db
      .insert(schema.webshops)
      .values(valuesToInsert)
      .returning();
    return insertedWebshop;
  } catch (error) {
    console.error(
      `Failed to create webshop for user ${valuesToInsert.userId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Gets all webshops belonging to a specific user.
 */
export async function getWebshopsByUserId(userId: string): Promise<Webshop[]> {
  try {
    return await db.query.webshops.findMany({
      where: eq(schema.webshops.userId, userId),
      orderBy: [desc(schema.webshops.createdAt)],
    });
  } catch (error) {
    console.error(`Failed to get webshops for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Gets a specific webshop by its ID (SERIAL, number).
 */
export async function getWebshopById(id: number): Promise<Webshop | null> {
  try {
    const webshop = await db.query.webshops.findFirst({
      where: eq(schema.webshops.id, id),
    });
    return webshop || null;
  } catch (error) {
    console.error(`Failed to get webshop by ID ${id}:`, error);
    throw error;
  }
}

// --- Design Related Functions ---

/**
 * Creates a new design for a user.
 */
export async function createDesign(
  designData: Omit<NewDesign, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Design> {
  const valuesToInsert: NewDesign = {
    ...designData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (!valuesToInsert.userId) {
    throw new Error('userId is required to create a design.');
  }
  try {
    const [insertedDesign] = await db
      .insert(schema.designs)
      .values(valuesToInsert)
      .returning();
    return insertedDesign;
  } catch (error) {
    console.error(
      `Failed to create design for user ${valuesToInsert.userId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Gets all designs belonging to a specific user.
 */
export async function getDesignsByUserId(userId: string): Promise<Design[]> {
  try {
    return await db.query.designs.findMany({
      where: eq(schema.designs.userId, userId),
      orderBy: [desc(schema.designs.createdAt)],
    });
  } catch (error) {
    console.error(`Failed to get designs for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Gets a specific design by its ID (SERIAL, number).
 */
export async function getDesignById(id: number): Promise<Design | null> {
  try {
    const design = await db.query.designs.findFirst({
      where: eq(schema.designs.id, id),
    });
    return design || null;
  } catch (error) {
    console.error(`Failed to get design by ID ${id}:`, error);
    throw error;
  }
}

// --- Customer Related Functions ---

/**
 * Creates a new customer for a specific webshop.
 */
export async function createCustomer(
  customerData: Omit<NewCustomer, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Customer> {
  const valuesToInsert: NewCustomer = {
    ...customerData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (!valuesToInsert.webshopId) {
    throw new Error('webshopId is required to create a customer.');
  }
  try {
    const [insertedCustomer] = await db
      .insert(schema.customers)
      .values(valuesToInsert)
      .returning();
    return insertedCustomer;
  } catch (error) {
    console.error(
      `Failed to create customer for webshop ${valuesToInsert.webshopId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Gets all customers belonging to a specific webshop.
 */
export async function getCustomersByWebshopId(
  webshopId: number,
): Promise<Customer[]> {
  try {
    return await db.query.customers.findMany({
      where: eq(schema.customers.webshopId, webshopId),
      orderBy: [desc(schema.customers.createdAt)],
    });
  } catch (error) {
    console.error(`Failed to get customers for webshop ${webshopId}:`, error);
    throw error;
  }
}

// --- Campaign Related Functions ---

/**
 * Creates a new campaign for a specific webshop.
 */
export async function createCampaign(
  campaignData: Omit<
    NewCampaign,
    'id' | 'createdAt' | 'updatedAt' | 'isActive'
  > & { isActive?: boolean },
): Promise<Campaign> {
  const valuesToInsert: NewCampaign = {
    ...campaignData,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: campaignData.isActive ?? true,
  };
  if (!valuesToInsert.webshopId) {
    throw new Error('webshopId is required to create a campaign.');
  }
  if (!valuesToInsert.name) {
    throw new Error('Campaign name is required.');
  }
  try {
    const [insertedCampaign] = await db
      .insert(schema.campaigns)
      .values(valuesToInsert)
      .returning();
    return insertedCampaign;
  } catch (error) {
    console.error(
      `Failed to create campaign for webshop ${valuesToInsert.webshopId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Gets all campaigns belonging to a specific webshop.
 */
export async function getCampaignsByWebshopId(
  webshopId: number,
): Promise<Campaign[]> {
  try {
    return await db.query.campaigns.findMany({
      where: eq(schema.campaigns.webshopId, webshopId),
      orderBy: [desc(schema.campaigns.createdAt)],
    });
  } catch (error) {
    console.error(`Failed to get campaigns for webshop ${webshopId}:`, error);
    throw error;
  }
}

/**
 * Gets a specific campaign by its ID (SERIAL, number).
 */
export async function getCampaignById(id: number): Promise<Campaign | null> {
  try {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, id),
    });
    return campaign || null;
  } catch (error) {
    console.error(`Failed to get campaign by ID ${id}:`, error);
    throw error;
  }
}

// --- Chat Related Functions (Adapted for UUIDs) ---

// Type definition for inserting messages (adapt content type if needed)
type NewMessageInput = Omit<NewMessage, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Date;
  content: any;
}; // Assuming content can be any for now

export async function saveChat(
  chatData: Omit<NewChat, 'createdAt' | 'updatedAt' | 'visibility'> & {
    visibility?: 'private' | 'public';
  },
): Promise<Chat> {
  if (!chatData.id || !chatData.userId) {
    throw new Error('Chat ID and User ID are required and must be UUIDs.');
  }
  const valuesToInsert: NewChat = {
    ...chatData, // id and userId must be present here
    createdAt: new Date(),
    // updatedAt is intentionally not set here. It should be handled by DB trigger or set in specific update functions.
    visibility: chatData.visibility ?? 'private',
  };
  try {
    const [insertedChat] = await db
      .insert(schema.chat)
      .values(valuesToInsert)
      .returning();
    return insertedChat;
  } catch (error) {
    console.error('Failed to save chat in database:', error);
    if (
      (error as any)?.code === '23503' &&
      (error as any)?.constraint?.includes('Chat_userId_User_id_fk')
    ) {
      console.error(
        `FOREIGN KEY VIOLATION: User ID ${valuesToInsert.userId} does not exist in public.User table.`,
      );
    }
    throw error;
  }
}

export async function deleteChatById({
  id,
}: {
  id: string;
}): Promise<Chat | null> {
  try {
    const [deletedChat] = await db.transaction(async (tx) => {
      await tx.delete(schema.vote).where(eq(schema.vote.chatId, id));
      await tx.delete(schema.message).where(eq(schema.message.chatId, id));
      const result = await tx
        .delete(schema.chat)
        .where(eq(schema.chat.id, id))
        .returning();
      return result;
    });
    return deletedChat || null;
  } catch (error) {
    console.error(`Failed to delete chat ${id} from database:`, error);
    throw error;
  }
}

export async function getChatsByUserId({
  id,
}: {
  id: string;
}): Promise<Chat[]> {
  try {
    return await db.query.chat.findMany({
      where: eq(schema.chat.userId, id),
      orderBy: [desc(schema.chat.createdAt)],
    });
  } catch (error) {
    console.error(`Failed to get chats for user ${id} from database:`, error);
    throw error;
  }
}

export async function getChatById({
  id,
}: {
  id: string;
}): Promise<Chat | null> {
  try {
    const selectedChat = await db.query.chat.findFirst({
      where: eq(schema.chat.id, id),
    });
    return selectedChat || null;
  } catch (error) {
    console.error(`Failed to get chat by id ${id} from database:`, error);
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}): Promise<Chat | null> {
  try {
    // CORRECTED: Removed 'updatedAt' from set clause.
    // If 'schema.chat' has an 'updatedAt' field that should be manually updated,
    // ensure it's defined correctly in 'schema.ts' and Drizzle infers it as settable.
    // Often, 'updatedAt' is handled by database triggers (e.g., ON UPDATE CURRENT_TIMESTAMP).
    const updateOps: Partial<NewChat> = { visibility };
    // Conditionally add updatedAt if your schema supports it and it's intended here
    // if (schema.chat.updatedAt) { // This is a pseudo-check, actual check depends on your schema definition
    //    updateOps.updatedAt = new Date();
    // }

    const [updatedChat] = await db
      .update(schema.chat)
      .set(updateOps)
      .where(eq(schema.chat.id, chatId))
      .returning();
    return updatedChat || null;
  } catch (error) {
    console.error(`Failed to update visibility for chat ${chatId}:`, error);
    throw error;
  }
}

// --- Message Related Functions (Adapted for UUIDs) ---

export async function saveMessages({
  messages,
}: {
  messages: NewMessageInput[];
}): Promise<Message[]> {
  if (!messages || messages.length === 0) {
    return [];
  }
  const messagesToInsert: NewMessage[] = messages.map((msg) => ({
    id: msg.id ?? generateUUID(),
    chatId: msg.chatId, // Must be provided
    role: msg.role, // Must be provided
    content: msg.content, // Ensure schema.message.content can handle 'any' or define a more specific type
    createdAt: msg.createdAt ?? new Date(),
  }));

  try {
    const insertedMessages = await db
      .insert(schema.message)
      .values(messagesToInsert)
      .returning();
    return insertedMessages;
  } catch (error) {
    console.error('Failed to save messages in database:', error);
    if (
      (error as any)?.code === '23503' &&
      (error as any)?.constraint?.includes('Message_chatId_Chat_id')
    ) {
      // Check specific constraint name
      console.error(
        `FOREIGN KEY VIOLATION: One or more chatIds provided do not exist in the Chat table.`,
      );
    }
    throw error;
  }
}

export async function getMessagesByChatId({
  id,
}: {
  id: string;
}): Promise<Message[]> {
  try {
    return await db.query.message.findMany({
      where: eq(schema.message.chatId, id),
      orderBy: [asc(schema.message.createdAt)],
    });
  } catch (error) {
    console.error(
      `Failed to get messages for chat ${id} from database:`,
      error,
    );
    throw error;
  }
}

export async function getMessageById({
  id,
}: {
  id: string;
}): Promise<Message | null> {
  try {
    const messageResult = await db.query.message.findFirst({
      // Renamed to avoid conflict
      where: eq(schema.message.id, id),
    });
    return messageResult || null;
  } catch (error) {
    console.error(`Failed to get message by id ${id} from database:`, error);
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}): Promise<{ count: number }> {
  try {
    const result: RowList<any[]> | { count: number } = await db
      .delete(schema.message)
      .where(
        and(
          eq(schema.message.chatId, chatId),
          gte(schema.message.createdAt, timestamp),
        ),
      );

    let count = 0;
    // The actual structure of 'result' from postgres.js delete operation (without .returning())
    // is an array-like object that also has a 'count' property.
    if (result && typeof (result as any).count === 'number') {
      count = (result as any).count;
    } else if (Array.isArray(result)) {
      // Fallback if it's just an array (e.g., if .returning() was used)
      count = result.length;
    }

    console.log(
      `Deleted ${count} messages for chat ${chatId} after ${timestamp.toISOString()}`,
    );
    return { count };
  } catch (error) {
    console.error(
      `Failed to delete messages for chat ${chatId} after timestamp:`,
      error,
    );
    throw error;
  }
}

// --- Vote Related Functions (Adapted for UUIDs) ---

export async function voteMessage({
  userId, // ← add this
  chatId,
  messageId,
  type,
}: {
  userId: string;
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}): Promise<Vote> {
  const isUpvoted = type === 'up';

  try {
    const [upsertedVote] = await db
      .insert(schema.vote)
      .values({
        userId, // ← now included
        chatId,
        messageId,
        isUpvoted,
      })
      .onConflictDoUpdate({
        target: [schema.vote.chatId, schema.vote.messageId, schema.vote.userId],
        set: { isUpvoted },
      })
      .returning();

    return upsertedVote;
  } catch (error) {
    console.error(
      `Failed to vote on message ${messageId} by ${userId}:`,
      error,
    );
    throw error;
  }
}

export async function getVotesByChatId({
  id,
}: {
  id: string;
}): Promise<Vote[]> {
  try {
    return await db.query.vote.findMany({
      where: eq(schema.vote.chatId, id),
    });
  } catch (error) {
    console.error(`Failed to get votes for chat ${id} from database:`, error);
    throw error;
  }
}

// --- Document & Suggestion Related Functions (Adapted for UUIDs) ---

export async function saveDocument(
  docData: Omit<NewDocument, 'createdAt' | 'updatedAt' | 'kind'> & {
    kind?: DocumentKind;
  },
): Promise<Document> {
  if (!docData.id || !docData.userId) {
    throw new Error('Document ID and User ID are required and must be UUIDs.');
  }
  const valuesToInsert: NewDocument = {
    ...docData,
    createdAt: new Date(),
    // updatedAt is intentionally not set here.
    kind: docData.kind ?? 'text',
  };
  try {
    const [insertedDoc] = await db
      .insert(schema.document)
      .values(valuesToInsert)
      .returning();
    return insertedDoc;
  } catch (error) {
    console.error('Failed to save document in database:', error);
    if (
      (error as any)?.code === '23503' &&
      (error as any)?.constraint?.includes('Document_userId_User_id_fk')
    ) {
      console.error(
        `FOREIGN KEY VIOLATION: User ID ${valuesToInsert.userId} does not exist in public.User table.`,
      );
    }
    throw error;
  }
}

export async function getDocumentsById({
  id,
}: {
  id: string;
}): Promise<Document[]> {
  try {
    return await db.query.document.findMany({
      where: eq(schema.document.id, id),
      orderBy: [asc(schema.document.createdAt)],
    });
  } catch (error) {
    console.error(`Failed to get documents by id ${id} from database:`, error);
    throw error;
  }
}

export async function getDocumentById({
  id,
}: {
  id: string;
}): Promise<Document | null> {
  try {
    const documentResult = await db.query.document.findFirst({
      where: eq(schema.document.id, id),
      orderBy: [desc(schema.document.createdAt)],
    });
    return documentResult || null;
  } catch (error) {
    console.error(
      `Failed to get latest document by id ${id} from database:`,
      error,
    );
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}): Promise<{ docCount: number; sugCount: number }> {
  try {
    const result = await db.transaction(async (tx) => {
      const deletedSuggestionsResult = await tx
        .delete(schema.suggestion)
        .where(
          and(
            eq(schema.suggestion.documentId, id),
            gt(schema.suggestion.documentCreatedAt, timestamp),
          ),
        );
      const deletedDocumentsResult = await tx
        .delete(schema.document)
        .where(
          and(
            eq(schema.document.id, id),
            gt(schema.document.createdAt, timestamp),
          ),
        );

      const sugCount = (deletedSuggestionsResult as any)?.count ?? 0;
      const docCount = (deletedDocumentsResult as any)?.count ?? 0;

      console.log(
        `Deleted ${docCount} document versions and ${sugCount} suggestions for doc ${id} after ${timestamp.toISOString()}`,
      );
      return { docCount, sugCount };
    });
    return result;
  } catch (error) {
    console.error(
      `Failed to delete documents/suggestions for doc ${id} after timestamp:`,
      error,
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: (Omit<NewSuggestion, 'id' | 'createdAt' | 'isResolved'> & {
    id?: string;
    createdAt?: Date;
    isResolved?: boolean;
  })[];
}): Promise<Suggestion[]> {
  if (!suggestions || suggestions.length === 0) {
    return [];
  }
  const suggestionsToInsert: NewSuggestion[] = suggestions.map((s) => ({
    ...s,
    id: s.id ?? generateUUID(),
    createdAt: s.createdAt ?? new Date(),
    isResolved: s.isResolved ?? false,
  }));
  try {
    const insertedSuggestions = await db
      .insert(schema.suggestion)
      .values(suggestionsToInsert)
      .returning();
    return insertedSuggestions;
  } catch (error) {
    console.error('Failed to save suggestions in database:', error);
    if ((error as any)?.code === '23503') {
      console.error(
        `FOREIGN KEY VIOLATION: Ensure document/user referenced in suggestions exists.`,
      );
    }
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}): Promise<Suggestion[]> {
  try {
    return await db.query.suggestion.findMany({
      where: eq(schema.suggestion.documentId, documentId),
      orderBy: [asc(schema.suggestion.createdAt)],
    });
  } catch (error) {
    console.error(
      `Failed to get suggestions for document ${documentId}:`,
      error,
    );
    throw error;
  }
}

// --- Activity Log Functions (Adapted for UUIDs) ---

export type NewActivityLogInput = Omit<NewActivityLog, 'id' | 'timestamp'> & {
  timestamp?: Date;
};

/**
 * Inserts a new activity log into the database.
 * @param logData Properties for the new log (teamId and action required).
 * @returns The inserted ActivityLog record.
 */
export async function createActivityLog(
  logData: NewActivityLogInput,
): Promise<ActivityLog> {
  // Validate required fields
  if (!logData.teamId || !logData.action) {
    throw new Error('teamId and action are required for activity logs.');
  }

  // Assemble the values to insert. We do NOT set 'id' here—
  // the database schema should auto-generate a numeric ID.
  const valuesToInsert: NewActivityLog = {
    ...logData,
    timestamp: logData.timestamp ?? new Date(),
  };

  try {
    const [insertedLog] = await db
      .insert(schema.activityLogs)
      .values(valuesToInsert)
      .returning();

    return insertedLog;
  } catch (error) {
    console.error(
      `Failed to create activity log for team ${logData.teamId}:`,
      error,
    );
    throw error;
  }
}

export async function getActivityLogsByTeamId(
  teamId: number,
  limit: number = 20,
): Promise<ActivityLog[]> {
  try {
    return await db.query.activityLogs.findMany({
      where: eq(schema.activityLogs.teamId, teamId),
      orderBy: [desc(schema.activityLogs.timestamp)],
      limit: limit,
      with: { user: { columns: { name: true, id: true } } },
    });
  } catch (error) {
    console.error(`Failed to get activity logs for team ${teamId}:`, error);
    throw error;
  }
}

async function getUserIdFromSession(): Promise<string | null> {
  // EXAMPLE: using NextAuth.js
  // import { getServerSession } from "next-auth/next"
  // import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Your auth options
  // const session = await getServerSession(authOptions);
  // return session?.user?.id || null;

  // EXAMPLE: using Supabase server client
  // import { createServerClient } from '@supabase/ssr'
  // import { cookies } from 'next/headers'
  // const cookieStore = cookies()
  // const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll() }});
  // const { data: { user } } = await supabase.auth.getUser();
  // return user?.id || null;

  console.warn(
    'getUserIdFromSession is a placeholder. Implement your actual auth logic.',
  );
  // Replace with your actual logic to get the authenticated user's ID
  // For demonstration, returning a hardcoded ID or null:
  // return "some-user-id";
  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return null; // Not authenticated or session error
  }

  try {
    const results = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId)) // Assuming your user schema has an 'id' field
      .limit(1);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Fetches a single user by their email address.
 * @param email - The user's email address.
 * @returns The User object or null if not found.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) return null;
  try {
    const results = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email.toLowerCase())) // Normalize email
      .limit(1);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error fetching user by email ${email}:`, error);
    return null;
  }
}

// --- TeamForUser (Corrected based on previous discussions) ---
/**
 * !!! CRITICAL SCHEMA REQUIREMENT !!!
 * The 'eq' call below (eq(schema.teamMembers.userId, authUser.id))
 * WILL FAIL if schema.teamMembers.userId is not defined as a STRING-BASED type
 * (e.g., text() or uuid()) in your './schema.ts' file.
 * The error "Argument of type 'string' is not assignable to parameter of type 'number | SQLWrapper'"
 * means Drizzle infers schema.teamMembers.userId as a 'number'.
 * PLEASE VERIFY AND CORRECT YOUR './schema.ts' DEFINITION FOR 'teamMembers.userId'.
 */
export async function getTeamForUser(): Promise<TeamDataWithMembers | null> {
  console.log('getTeamForUser() called...');
  const authUser = await getAuthenticatedUser();
  if (!authUser?.id) {
    console.log('getTeamForUser: No authenticated user found.');
    return null;
  }
  console.log(
    `getTeamForUser: Found user ${authUser.id}. Fetching team membership...`,
  );

  try {
    // The following `eq` call requires schema.teamMembers.userId to be a string-based column type
    // in your schema.ts to match authUser.id (string).
    const membership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.userId, authUser.id),
      with: {
        team: {
          with: {
            teamMembers: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership?.team) {
      console.log(
        `getTeamForUser: No team membership found for user ${authUser.id}.`,
      );
      return null;
    } else {
      console.log(`getTeamForUser: Found team data for user ${authUser.id}.`);
      return membership.team as unknown as TeamDataWithMembers;
    }
  } catch (error) {
    console.error(`Failed to get team data for user ${authUser.id}:`, error);
    throw error;
  }
}

/**
 * Adds a user to a team.
 * CRITICAL ASSUMPTION: schema.teamMembers.userId must be compatible with NewTeamMember['userId'] (string UUID)
 * and schema.teamMembers.teamId must be compatible with NewTeamMember['teamId'] (number).
 * Ensure your schema.ts reflects these types for teamMembers.userId and teamMembers.teamId.
 */
export async function addTeamMember(
  memberData: NewTeamMember,
): Promise<TeamMember> {
  if (!memberData.teamId || !memberData.userId) {
    throw new Error('teamId and userId are required to add a team member.');
  }
  const dataToInsert: NewTeamMember = {
    ...memberData,
    joinedAt: memberData.joinedAt || new Date(),
  };
  try {
    const [newMember] = await db
      .insert(schema.teamMembers)
      .values(dataToInsert)
      .returning();
    return newMember;
  } catch (error) {
    console.error(
      `Failed to add member to team ${memberData.teamId} for user ${memberData.userId}:`,
      error,
    );
    if ((error as any)?.code === '23503') {
      // Foreign key violation
      if ((error as any)?.constraint?.includes('user_id')) {
        // Check if constraint name involves user_id
        console.error(
          `FOREIGN KEY VIOLATION: User ID ${memberData.userId} might not exist or type is mismatched.`,
        );
      } else if ((error as any)?.constraint?.includes('team_id')) {
        // Check if constraint name involves team_id
        console.error(
          `FOREIGN KEY VIOLATION: Team ID ${memberData.teamId} might not exist.`,
        );
      }
    }
    throw error;
  }
}
