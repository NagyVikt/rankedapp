import { BLOCK_KINDS } from '@/components/block'; // Assuming this is used elsewhere
import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  serial,
  timestamp,
  json,
  jsonb,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  uniqueIndex,
  integer,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm'

// ── Users ──────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // --- Added PIN fields ---
  pinHash: text('pin_hash'), // Stores the hashed PIN (nullable if PIN is not set)
  isPinSet: boolean('is_pin_set').notNull().default(false), // Tracks if a PIN has been set
  // ------------------------
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  // Add emailVerified column if it's missing from your original schema but used in actions.ts
  emailVerified: timestamp('email_verified'), // Stores timestamp of verification, null if not verified
});

// --- Teams ---
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

// --- Team Members ---
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// --- Activity Logs ---
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(), // Consider making this an enum type if your DB supports it
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// --- Invitations ---
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // e.g., 'pending', 'accepted', 'declined', 'expired'
});

// --- Relations ---

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations, { relationName: 'InvitationsSent' }), // Explicit relation name if needed
  activityLogs: many(activityLogs), // Add relation if needed
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedByUser: one(users, { // Renamed for clarity
    fields: [invitations.invitedBy],
    references: [users.id],
    relationName: 'InvitationsSent' // Match relation name in usersRelations if specified
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// --- Export Types ---

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// Example composite type
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// --- Enums ---

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  SET_PIN = 'SET_PIN', // --- Added SET_PIN ---
  // Add other activity types as needed
  // TOGGLE_PIN_REQUIREMENT = 'TOGGLE_PIN_REQUIREMENT',
}


// ── Other Tables (Designs, Customers, Campaigns, etc. - kept as is) ───────

export const designs = pgTable('designs', {
  id:         serial('id').primaryKey(),
  name:       text('name').notNull(),
  design:     jsonb('design').notNull(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
})

export const customers = pgTable('customers', {
  id:         serial('id').primaryKey(),
  shop:       varchar('shop',  { length: 100 }).notNull(),
  email:      varchar('email', { length: 254 }).notNull(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
})

export const campaigns = pgTable('campaigns', {
  id:           serial('id').primaryKey(),
  shop:         text('shop').notNull(),
  send_now:     jsonb('send_now').notNull().default(sql`'[]'`),
  weekly:       jsonb('weekly').notNull().default(sql`'[]'`),
  assignments:  jsonb('assignments').notNull().default(sql`'{}'`),
  updated_at:   timestamp('updated_at').defaultNow().notNull(),
})


// Note: You have two 'user' table definitions. This might cause issues.
// I'll assume the first 'users' table is the primary one used by the actions.
// Commenting out the second 'user' table definition for now.
/*
export const user = pgTable('User', { // Table name 'User' vs 'users'
  id: uuid('id').primaryKey().notNull().defaultRandom(), // Different ID type (uuid vs serial)
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }), // Stores plain password? Should use hash.
});
*/

// --- Chat, Message, Vote, Document, Suggestion Tables (kept as is) ---
// Ensure the userId reference points to the correct user table ('users' or 'User')

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  // This should reference the primary user table's ID type (serial/integer)
  // If using the first 'users' table:
  userId: integer('userId') // Changed from uuid
    .notNull()
    .references(() => users.id), // References 'users' table
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(), // e.g., 'user', 'assistant'
  content: json('content').notNull(), // Consider jsonb for better indexing if querying content
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('kind', { enum: ['text', 'code', 'spreadsheet'] })
      .notNull()
      .default('text'),
    // This should reference the primary user table's ID type (serial/integer)
    // If using the first 'users' table:
    userId: integer('userId') // Changed from uuid
      .notNull()
      .references(() => users.id), // References 'users' table
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
     // This should reference the primary user table's ID type (serial/integer)
    // If using the first 'users' table:
    userId: integer('userId') // Changed from uuid
      .notNull()
      .references(() => users.id), // References 'users' table
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

