// lib/db/queries.ts

// Ensures this module only runs on the server
import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, isNull, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Import the entire schema as an object
import * as schema from './schema';

// Import specific types needed for function signatures etc.
// Note: InferSelectModel already covers basic selects. Use $inferInsert for inserts.
import type {
  User, NewUser,
  Team, NewTeam,
  TeamMember, NewTeamMember,
  ActivityLog, NewActivityLog,
  Invitation, NewInvitation,
  Webshop, NewWebshop,
  Design, NewDesign,
  Customer, NewCustomer,
  Campaign, NewCampaign,
  Chat, // Assuming Chat type is needed
  Message, // Assuming Message type is needed
  Vote, // Assuming Vote type is needed
  Document, // Assuming Document type is needed
  Suggestion // Assuming Suggestion type is needed
} from './schema';

// Assuming BlockKind is defined correctly elsewhere
import { BlockKind } from '@/components/block';

// biome-ignore lint: Forbidden non-null assertion. - Kept from original
const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);

// Initialize drizzle with the schema for relational queries
// and standard query builder access
const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' }); // Enable logger in dev


// === Helper Function for Supabase Auth ===

/**
 * Gets the authenticated Supabase user for the current request.
 * Returns null if not authenticated or on error.
 */
async function getCurrentSupabaseUser(): Promise<schema.User | null> {
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

    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Supabase getUser error:", error.message);
            return null;
        }
        if (!user) {
            return null; // Not authenticated
        }
        // Now, verify this user exists in *your* public.User table
        // This assumes your public.User.id matches Supabase auth.users.id (UUID)
        const appUser = await db.query.user.findFirst({
            where: eq(schema.user.id, user.id)
        });
        return appUser || null; // Return the user from your table, or null if not found/synced

    } catch (err) {
        console.error("Error fetching Supabase user or verifying in app DB:", err);
        return null;
    }
}


// === User and Auth Related Functions ===

/**
 * Gets the currently authenticated user based on Supabase session.
 * Uses the helper function.
 */
export async function getUser(): Promise<User | null> {
  // Note: This function name conflicts with the schema import 'user'.
  // Consider renaming this function, e.g., `getAuthenticatedUser`.
  // For now, keeping original name but implementation uses helper.
  return getCurrentSupabaseUser();
}

/**
 * Gets user by email address from your public.User table.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Drizzle's findFirst is convenient for getting one or none
    const userResult = await db.query.user.findFirst({
        where: and(eq(schema.user.email, email), isNull(schema.user.deletedAt))
    });
    return userResult || null;
  } catch (error) {
      console.error(`Failed to get user by email ${email}:`, error);
      throw error; // Re-throw or handle as needed
  }
}

/**
 * Gets user by ID from your public.User table.
 * Assumes ID is UUID (string).
 */
export async function getUserById(id: string): Promise<User | null> {
    if (!id) return null; // Prevent query with null/undefined id
    try {
        const userResult = await db.query.user.findFirst({
            where: and(eq(schema.user.id, id), isNull(schema.user.deletedAt))
        });
        return userResult || null;
    } catch (error) {
        console.error(`Failed to get user by ID ${id}:`, error);
        throw error;
    }
}


/**
 * Creates a new user in your public.User table with a hashed password.
 * IMPORTANT: This should typically only be called AFTER a user is created
 * in Supabase Auth (e.g., by a trigger) to ensure the ID matches.
 * If used for direct signup, ensure the ID passed matches Supabase Auth ID.
 */
export async function createUser(userData: NewUser): Promise<User[]> {
  // Hash password if provided (assuming direct creation, adjust if using trigger)
  if (userData.passwordHash) { // Check if passwordHash needs hashing or is already hashed
      // If userData.passwordHash contains a plain password, hash it here.
      // If it's already hashed (e.g., from Supabase trigger), use it directly.
      // Example hashing (if plain password was passed somehow):
      // const salt = genSaltSync(10);
      // userData.passwordHash = hashSync(userData.passwordHash, salt);
  }

  // Ensure essential fields are present if not defaulted in DB/schema
  const valuesToInsert: NewUser = {
      ...userData,
      // Ensure ID is provided if not using defaultRandom (which we removed)
      // id: userData.id, // This MUST match Supabase Auth ID
      createdAt: userData.createdAt ?? new Date(),
      updatedAt: userData.updatedAt ?? new Date(),
      role: userData.role ?? 'member',
      isPinSet: userData.isPinSet ?? false,
      // passwordHash should be set correctly before this point
  };

  try {
    // Drizzle returns the inserted rows by default
    const insertedUsers = await db.insert(schema.user).values(valuesToInsert).returning();
    return insertedUsers;
  } catch (error) {
    console.error('Failed to create user in database:', error);
    throw error;
  }
}

// --- Team Related Functions ---

/**
 * Creates a new team.
 */
export async function createTeam(teamData: NewTeam): Promise<Team[]> {
    const valuesToInsert: NewTeam = {
        ...teamData,
        createdAt: teamData.createdAt ?? new Date(),
        updatedAt: teamData.updatedAt ?? new Date(),
    };
    try {
        const insertedTeams = await db.insert(schema.teams).values(valuesToInsert).returning();
        return insertedTeams;
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
            where: eq(schema.teams.id, teamId)
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
 */
export async function getTeamDataForCurrentUser(): Promise<TeamDataWithMembers | null> {
  const user = await getCurrentSupabaseUser(); // Use Supabase auth helper
  if (!user?.id) { // Check for user and user.id
    return null;
  }

  try {
    // Find the first team membership for the user
    const membership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.userId, user.id), // Match UUID
      // Use 'with' to fetch related data based on schema relations
      with: {
        team: { // Fetch the associated team
          with: {
            teamMembers: { // Within the team, fetch all members
              with: {
                user: { // For each member, fetch user details
                  // Select specific user columns to avoid over-fetching
                  columns: {
                    id: true,
                    name: true, // Ensure 'name' column exists in your User table
                    email: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    // The result structure matches TeamDataWithMembers if relations are set up correctly
    return membership?.team || null;
  } catch (error) {
      console.error(`Failed to get team data for user ${user.id}:`, error);
      throw error; // Re-throw or handle as needed
  }
}

/**
 * Gets a team by its Stripe Customer ID.
 */
export async function getTeamByStripeCustomerId(customerId: string): Promise<Team | null> {
    if (!customerId) return null;
    try {
        const team = await db.query.teams.findFirst({
            where: eq(schema.teams.stripeCustomerId, customerId)
        });
        return team || null;
    } catch (error) {
        console.error(`Failed to get team by Stripe customer ID ${customerId}:`, error);
        throw error;
    }
}

/**
 * Updates a team's subscription details. Assumes teamId is number (SERIAL).
 */
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: Partial<Pick<Team, 'stripeSubscriptionId' | 'stripeProductId' | 'planName' | 'subscriptionStatus'>>
): Promise<Team[]> {
  try {
    const updatedTeams = await db
      .update(schema.teams)
      .set({
        ...subscriptionData,
        updatedAt: new Date() // Automatically update updatedAt timestamp
      })
      .where(eq(schema.teams.id, teamId))
      .returning(); // Return the updated record(s)
     if (updatedTeams.length === 0) {
         console.warn(`Attempted to update subscription for non-existent team ID ${teamId}`);
     }
     return updatedTeams;
  } catch (error) {
      console.error(`Failed to update subscription for team ${teamId}:`, error);
      throw error;
  }
}

// --- Webshop Related Functions ---

/**
 * Creates a new webshop for a user.
 */
export async function createWebshop(webshopData: NewWebshop): Promise<Webshop[]> {
    const valuesToInsert: NewWebshop = {
        ...webshopData,
        // userId must be provided and should be a valid UUID from User table
        createdAt: webshopData.createdAt ?? new Date(),
        updatedAt: webshopData.updatedAt ?? new Date(),
    };
    if (!valuesToInsert.userId) {
        throw new Error("userId is required to create a webshop.");
    }
    try {
        const inserted = await db.insert(schema.webshops).values(valuesToInsert).returning();
        return inserted;
    } catch (error) {
        console.error(`Failed to create webshop for user ${valuesToInsert.userId}:`, error);
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
            orderBy: [desc(schema.webshops.createdAt)]
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
            where: eq(schema.webshops.id, id)
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
export async function createDesign(designData: NewDesign): Promise<Design[]> {
     const valuesToInsert: NewDesign = {
        ...designData,
        // userId must be provided and should be a valid UUID from User table
        createdAt: designData.createdAt ?? new Date(),
        updatedAt: designData.updatedAt ?? new Date(),
    };
     if (!valuesToInsert.userId) {
        throw new Error("userId is required to create a design.");
    }
    try {
        const inserted = await db.insert(schema.designs).values(valuesToInsert).returning();
        return inserted;
    } catch (error) {
        console.error(`Failed to create design for user ${valuesToInsert.userId}:`, error);
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
            orderBy: [desc(schema.designs.createdAt)]
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
            where: eq(schema.designs.id, id)
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
export async function createCustomer(customerData: NewCustomer): Promise<Customer[]> {
      const valuesToInsert: NewCustomer = {
        ...customerData,
        // webshopId must be provided
        createdAt: customerData.createdAt ?? new Date(),
        updatedAt: customerData.updatedAt ?? new Date(),
    };
     if (!valuesToInsert.webshopId) {
        throw new Error("webshopId is required to create a customer.");
    }
    try {
        const inserted = await db.insert(schema.customers).values(valuesToInsert).returning();
        return inserted;
    } catch (error) {
        // Handle potential unique constraint violation (webshopId, email)
        console.error(`Failed to create customer for webshop ${valuesToInsert.webshopId}:`, error);
        throw error;
    }
}

/**
 * Gets all customers belonging to a specific webshop.
 */
export async function getCustomersByWebshopId(webshopId: number): Promise<Customer[]> {
      try {
        return await db.query.customers.findMany({
            where: eq(schema.customers.webshopId, webshopId),
            orderBy: [desc(schema.customers.createdAt)]
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
export async function createCampaign(campaignData: NewCampaign): Promise<Campaign[]> {
       const valuesToInsert: NewCampaign = {
        ...campaignData,
        // webshopId must be provided
        createdAt: campaignData.createdAt ?? new Date(),
        updatedAt: campaignData.updatedAt ?? new Date(),
        isActive: campaignData.isActive ?? true,
        // JSON fields default in DB/schema
    };
     if (!valuesToInsert.webshopId) {
        throw new Error("webshopId is required to create a campaign.");
    }
     if (!valuesToInsert.name) {
        throw new Error("Campaign name is required.");
    }
    try {
        const inserted = await db.insert(schema.campaigns).values(valuesToInsert).returning();
        return inserted;
    } catch (error) {
        console.error(`Failed to create campaign for webshop ${valuesToInsert.webshopId}:`, error);
        throw error;
    }
}

/**
 * Gets all campaigns belonging to a specific webshop.
 */
export async function getCampaignsByWebshopId(webshopId: number): Promise<Campaign[]> {
       try {
        return await db.query.campaigns.findMany({
            where: eq(schema.campaigns.webshopId, webshopId),
            orderBy: [desc(schema.campaigns.createdAt)] // Order by creation or update?
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
            where: eq(schema.campaigns.id, id)
        });
        return campaign || null;
    } catch (error) {
        console.error(`Failed to get campaign by ID ${id}:`, error);
        throw error;
    }
}

// --- Chat Related Functions (Adapted for UUIDs) ---

// Type definition for inserting messages (adapt content type if needed)
type NewMessageInput = Omit<schema.NewMessage, 'id' | 'createdAt'> & { id?: string, createdAt?: Date, content: any };

export async function saveChat(chatData: schema.NewChat): Promise<Chat[]> {
  // Ensure ID and userId are provided and are UUIDs (string)
  if (!chatData.id || !chatData.userId) {
      throw new Error("Chat ID and User ID are required.");
  }
  const valuesToInsert: schema.NewChat = {
      ...chatData,
      createdAt: chatData.createdAt ?? new Date(),
      visibility: chatData.visibility ?? 'private', // Default visibility
  };
  try {
    // Use schema.chat for consistency
    const inserted = await db.insert(schema.chat).values(valuesToInsert).returning();
    return inserted;
  } catch (error) {
    console.error('Failed to save chat in database:', error);
    // Check for foreign key violation specifically
    if ((error as any)?.code === '23503' && (error as any)?.constraint_name === 'Chat_userId_User_id_fk') {
        console.error(`FOREIGN KEY VIOLATION: User ID ${valuesToInsert.userId} does not exist in public.User table.`);
    }
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }): Promise<Chat[]> {
  try {
    // Use a transaction for multi-table deletes
    const deletedChats = await db.transaction(async (tx) => {
        await tx.delete(schema.vote).where(eq(schema.vote.chatId, id));
        await tx.delete(schema.message).where(eq(schema.message.chatId, id));
        // Delete the chat itself and return it
        return await tx.delete(schema.chat).where(eq(schema.chat.id, id)).returning();
    });
    return deletedChats;
  } catch (error) {
    console.error(`Failed to delete chat ${id} from database:`, error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }): Promise<Chat[]> {
  try {
    // Use db.query for consistency if relations are defined, otherwise select() is fine
    return await db.query.chat.findMany({
        where: eq(schema.chat.userId, id),
        orderBy: [desc(schema.chat.createdAt)]
    });
  } catch (error) {
    console.error(`Failed to get chats for user ${id} from database:`, error);
    throw error;
  }
}

export async function getChatById({ id }: { id: string }): Promise<Chat | null> {
  try {
    const selectedChat = await db.query.chat.findFirst({
        where: eq(schema.chat.id, id)
    });
    return selectedChat || null;
  } catch (error) {
    console.error(`Failed to get chat by id ${id} from database:`, error);
    throw error;
  }
}

export async function updateChatVisiblityById({ chatId, visibility }: {
  chatId: string; visibility: 'private' | 'public';
}): Promise<Chat[]> {
  try {
    const updated = await db.update(schema.chat)
      .set({ visibility, updatedAt: new Date() }) // Also update updatedAt
      .where(eq(schema.chat.id, chatId))
      .returning();
    return updated;
  } catch (error) {
    console.error(`Failed to update visibility for chat ${chatId}:`, error);
    throw error;
  }
}


// --- Message Related Functions (Adapted for UUIDs) ---

export async function saveMessages({ messages }: { messages: NewMessageInput[] }): Promise<Message[]> {
  if (!messages || messages.length === 0) {
    return [];
  }
  // Prepare messages for insertion
  const messagesToInsert = messages.map(msg => ({
      id: msg.id ?? generateUUID(), // Generate UUID if not provided
      chatId: msg.chatId, // Must be provided
      role: msg.role, // Must be provided
      content: msg.content, // Must be provided
      createdAt: msg.createdAt ?? new Date(), // Default to now
  }));

  try {
    // Use bulk insert
    const inserted = await db.insert(schema.message).values(messagesToInsert).returning();
    return inserted;
  } catch (error) {
    console.error('Failed to save messages in database:', error);
    // Check for foreign key violation on chatId
     if ((error as any)?.code === '23503' && (error as any)?.constraint_name?.includes('Message_chatId_Chat_id')) { // Adapt constraint name if needed
        console.error(`FOREIGN KEY VIOLATION: One or more chatIds provided do not exist in the Chat table.`);
    }
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }): Promise<Message[]> {
  try {
    return await db.query.message.findMany({
        where: eq(schema.message.chatId, id),
        orderBy: [asc(schema.message.createdAt)]
    });
  } catch (error) {
    console.error(`Failed to get messages for chat ${id} from database:`, error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }): Promise<Message | null> {
    try {
        const message = await db.query.message.findFirst({
            where: eq(schema.message.id, id)
        });
        return message || null;
    } catch (error) {
        console.error(`Failed to get message by id ${id} from database:`, error);
        throw error;
    }
}


export async function deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp }: {
  chatId: string; timestamp: Date;
}): Promise<{ count: number }> { // Drizzle delete often returns count
  try {
    const result = await db
      .delete(schema.message)
      .where(
        and(eq(schema.message.chatId, chatId), gte(schema.message.createdAt, timestamp)),
      );
    // Drizzle's delete result might vary by driver, adjust if needed
    // Assuming it returns something with a count or affected rows
    const count = result.rowCount ?? 0; // Example for node-postgres
    console.log(`Deleted ${count} messages for chat ${chatId} after ${timestamp.toISOString()}`);
    return { count };
  } catch (error) {
    console.error(`Failed to delete messages for chat ${chatId} after timestamp:`, error);
    throw error;
  }
}


// --- Vote Related Functions (Adapted for UUIDs) ---

export async function voteMessage({ chatId, messageId, type }: {
  chatId: string; messageId: string; type: 'up' | 'down';
}): Promise<Vote[]> { // Return updated/inserted vote
  const isUpvoted = type === 'up';
  try {
    // Use ON CONFLICT (UPSERT) for simplicity and atomicity
    const upsertedVote = await db.insert(schema.vote)
        .values({ chatId, messageId, isUpvoted })
        .onConflictDoUpdate({
            target: [schema.vote.chatId, schema.vote.messageId], // Conflict target (primary key)
            set: { isUpvoted: isUpvoted } // Update this column on conflict
        })
        .returning(); // Return the inserted or updated row
    return upsertedVote;
  } catch (error) {
    console.error(`Failed to vote on message ${messageId} in database:`, error);
     // Check for foreign key violations
    if ((error as any)?.code === '23503') {
        console.error(`FOREIGN KEY VIOLATION: chatId ${chatId} or messageId ${messageId} does not exist.`);
    }
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }): Promise<Vote[]> {
  try {
    return await db.query.vote.findMany({
        where: eq(schema.vote.chatId, id)
    });
  } catch (error) {
    console.error(`Failed to get votes for chat ${id} from database:`, error);
    throw error;
  }
}


// --- Document & Suggestion Related Functions (Adapted for UUIDs) ---
// Assuming Document ID and User ID are UUIDs (string)

export async function saveDocument(docData: schema.NewDocument): Promise<Document[]> {
  // Ensure ID, userId are provided and are UUIDs
   if (!docData.id || !docData.userId) {
      throw new Error("Document ID and User ID are required.");
  }
   const valuesToInsert: schema.NewDocument = {
      ...docData,
      createdAt: docData.createdAt ?? new Date(),
      kind: docData.kind ?? 'text', // Default kind
  };
  try {
    const inserted = await db.insert(schema.document).values(valuesToInsert).returning();
    return inserted;
  } catch (error) {
    console.error('Failed to save document in database:', error);
     if ((error as any)?.code === '23503' && (error as any)?.constraint_name?.includes('Document_userId_User_id')) { // Adapt constraint name
        console.error(`FOREIGN KEY VIOLATION: User ID ${valuesToInsert.userId} does not exist in public.User table.`);
    }
    throw error;
  }
}

// getDocumentsById seems redundant if getDocumentById exists and ID is unique?
// Keeping it for now, but might be removable. Assumes ID is unique despite composite PK.
export async function getDocumentsById({ id }: { id: string }): Promise<Document[]> {
  try {
    return await db.query.document.findMany({
        where: eq(schema.document.id, id),
        orderBy: [asc(schema.document.createdAt)] // Order by creation time
    });
  } catch (error) {
    console.error(`Failed to get documents by id ${id} from database:`, error);
    throw error;
  }
}

// Gets the LATEST version of a document by ID
export async function getDocumentById({ id }: { id: string }): Promise<Document | null> {
    try {
        const document = await db.query.document.findFirst({
            where: eq(schema.document.id, id),
            orderBy: [desc(schema.document.createdAt)] // Get the most recent one
        });
        return document || null;
    } catch (error) {
        console.error(`Failed to get latest document by id ${id} from database:`, error);
        throw error;
    }
}


export async function deleteDocumentsByIdAfterTimestamp({ id, timestamp }: {
  id: string; timestamp: Date;
}): Promise<{ docCount: number; sugCount: number }> {
  try {
    // Use transaction for multi-table deletes
    const result = await db.transaction(async (tx) => {
        // Delete suggestions first due to foreign key
        const deletedSuggestions = await tx
          .delete(schema.suggestion)
          .where(
            and(
              eq(schema.suggestion.documentId, id),
              gt(schema.suggestion.documentCreatedAt, timestamp), // Compare against suggestion's timestamp
            )
          );
        // Delete document versions
        const deletedDocuments = await tx
          .delete(schema.document)
          .where(and(eq(schema.document.id, id), gt(schema.document.createdAt, timestamp)));

        const sugCount = deletedSuggestions.rowCount ?? 0;
        const docCount = deletedDocuments.rowCount ?? 0;
        console.log(`Deleted ${docCount} document versions and ${sugCount} suggestions for doc ${id} after ${timestamp.toISOString()}`);
        return { docCount, sugCount };
    });
    return result;
  } catch (error) {
    console.error(`Failed to delete documents/suggestions for doc ${id} after timestamp:`, error);
    throw error;
  }
}

export async function saveSuggestions({ suggestions }: {
  suggestions: schema.NewSuggestion[];
}): Promise<Suggestion[]> {
   if (!suggestions || suggestions.length === 0) {
    return [];
  }
   // Prepare suggestions for insertion
   const suggestionsToInsert = suggestions.map(s => ({
       ...s,
       id: s.id ?? generateUUID(), // Generate UUID if not provided
       createdAt: s.createdAt ?? new Date(), // Default to now
       isResolved: s.isResolved ?? false,
       // Ensure documentId, documentCreatedAt, userId are provided
   }));
  try {
    const inserted = await db.insert(schema.suggestion).values(suggestionsToInsert).returning();
    return inserted;
  } catch (error) {
    console.error('Failed to save suggestions in database:', error);
    // Check for foreign key violations
     if ((error as any)?.code === '23503') {
        console.error(`FOREIGN KEY VIOLATION: Ensure document/user referenced in suggestions exists.`);
    }
    throw error;
  }
}

export async function getSuggestionsByDocumentId({ documentId }: {
  documentId: string;
}): Promise<Suggestion[]> {
  try {
    // Get suggestions for a specific document ID (all versions)
    return await db.query.suggestion.findMany({
        where: eq(schema.suggestion.documentId, documentId),
        orderBy: [asc(schema.suggestion.createdAt)] // Order suggestions by creation time
    });
  } catch (error) {
    console.error(`Failed to get suggestions for document ${documentId}:`, error);
    throw error;
  }
}

// --- Activity Log Functions (Adapted for UUIDs) ---

// Type for inserting activity logs
type NewActivityLogInput = Omit<NewActivityLog, 'id' | 'timestamp'> & { timestamp?: Date };

/**
 * Creates a new activity log entry.
 */
export async function createActivityLog(logData: NewActivityLogInput): Promise<ActivityLog[]> {
    // teamId must be provided. userId can be null.
    if (!logData.teamId || !logData.action) {
        throw new Error("teamId and action are required for activity logs.");
    }
    const valuesToInsert: NewActivityLog = {
        ...logData,
        timestamp: logData.timestamp ?? new Date(),
    };
    try {
        const inserted = await db.insert(schema.activityLogs).values(valuesToInsert).returning();
        return inserted;
    } catch (error) {
        console.error(`Failed to create activity log for team ${logData.teamId}:`, error);
        throw error;
    }
}

/**
 * Gets recent activity logs for a specific team.
 * Optionally filters by user if needed later.
 */
export async function getActivityLogsByTeamId(teamId: number, limit: number = 20): Promise<ActivityLog[]> {
    try {
        // Use db.query with relations for potentially richer data later
        return await db.query.activityLogs.findMany({
            where: eq(schema.activityLogs.teamId, teamId),
            orderBy: [desc(schema.activityLogs.timestamp)],
            limit: limit,
            // Example: Include user name if relation exists
            // with: {
            //     user: { columns: { name: true } }
            // }
        });
    } catch (error) {
        console.error(`Failed to get activity logs for team ${teamId}:`, error);
        throw error;
    }
}

// --- Invitation Functions ---
// ... Add functions for creating, accepting, declining invitations ...

// --- Team Member Functions ---
// ... Add functions for adding, removing, updating team members ...



export async function getTeamForUser(): Promise<TeamDataWithMembers | null> {
 console.log("getTeamForUser() called..."); // Debug Log
 const user = await getCurrentSupabaseUser(); // Use Supabase auth helper
 if (!user?.id) { // Check for user and user.id
   console.log("getTeamForUser: No authenticated user found."); // Debug Log
   return null;
 }
 console.log(`getTeamForUser: Found user ${user.id}. Fetching team membership...`); // Debug Log

 try {
   // Find the first team membership for the user
   // IMPORTANT: Assumes teamMembers.userId is UUID to match user.id
   // IMPORTANT: Assumes TeamDataWithMembers type expects user.name (ensure column exists)
   const membership = await db.query.teamMembers.findFirst({
     where: eq(schema.teamMembers.userId, user.id), // Match UUID
     with: {
       team: { // Fetch the associated team
         with: {
           teamMembers: { // Within the team, fetch all members
             with: {
               user: { // For each member, fetch user details
                 columns: {
                   id: true,
                   name: true, // Make sure 'name' exists in your public.User table schema
                   email: true,
                 }
               }
             }
           }
         }
       }
     }
   });

   if (!membership?.team) {
        console.log(`getTeamForUser: No team membership found for user ${user.id}.`); // Debug Log
   } else {
        console.log(`getTeamForUser: Found team data for user ${user.id}.`); // Debug Log
   }
   // The result structure matches TeamDataWithMembers if relations are set up correctly
   // and the 'name' column exists on the user table.
   return membership?.team || null;
 } catch (error) {
     console.error(`Failed to get team data for user ${user.id}:`, error);
     throw error; // Re-throw or handle as needed
 }
}