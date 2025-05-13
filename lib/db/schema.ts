import { BLOCK_KINDS } from '@/components/block';
import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  serial,
  jsonb,
  uniqueIndex,
  integer,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm'
import { User } from 'lucide-react';




export const user = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  // --- Ensure you have a password column defined ---
  password: text('password').notNull(), // Add this line if missing
  // -------------------------------------------------
  pinHash: text('pinHash'),
  isPinSet: boolean('isPinSet').default(false).notNull(),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
});


// --- Teams ---
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  stripeCustomerId: text('stripeCustomerId').unique(),
  stripeSubscriptionId: text('stripeSubscriptionId').unique(),
  stripeProductId: text('stripeProductId'),
  planName: varchar('planName', { length: 50 }),
  subscriptionStatus: varchar('subscriptionStatus', { length: 20 }),
});

// --- Team Members ---
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// --- Activity Logs ---
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }), // Removed .notNull()
  userId: integer('user_id').references(() => user.id),
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
    .references(() => user.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // e.g., 'pending', 'accepted', 'declined', 'expired'
});


export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(user, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations, { relationName: 'InvitationsSent' }), // Explicit relation name if needed
  activityLogs: many(activityLogs), // Add relation if needed
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedByUser: one(user, { // Renamed for clarity
    fields: [invitations.invitedBy],
    references: [user.id],
    relationName: 'InvitationsSent' // Match relation name in usersRelations if specified
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(user, {
    fields: [teamMembers.userId],
    references: [user.id],
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
  user: one(user, {
    fields: [activityLogs.userId],
    references: [user.id],
  }),
}));

// --- Export Types ---
export type User = typeof user.$inferSelect;

export type NewUser = typeof user.$inferInsert;
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


// --- Webshops Table ---
// A user can own multiple webshops.
export const webshops = pgTable('webshops', {
  id: serial('id').primaryKey(),
  // Foreign key to the User table (UUID)
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  url: text('url'), // Optional URL for the webshop7
  slug:     varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  platform: varchar('platform', { length: 50 }), // e.g., Shopify, WooCommerce
});

// --- Designs Table ---
// A user can create multiple designs.
export const designs = pgTable('designs', {
  id: serial('id').primaryKey(),
  // Foreign key to the User table (UUID)
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }), // <--- Defined as NOT NULL
  name: text('name').notNull(),
  design: jsonb('design').notNull(), // Stores the design data/configuration
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Customers Table ---
// Customers belong to a specific webshop.
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  // Foreign key to the webshops table (INTEGER)
  webshopId: integer('webshop_id').notNull().references(() => webshops.id, { onDelete: 'cascade' }),
  shopIdentifier: varchar('shop_identifier', { length: 100 }), // Optional
  email: varchar('email', { length: 254 }).notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Campaigns Table ---
// Campaigns belong to a specific webshop.
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  // Foreign key to the webshops table (INTEGER)
  webshopId: integer('webshop_id').notNull().references(() => webshops.id, { onDelete: 'cascade' }),
  shopIdentifier: text('shop_identifier'), // Optional
  name: varchar('name', { length: 255 }).notNull(), // Campaign name
  sendNow: jsonb('send_now').notNull().default(sql`'[]'::jsonb`),
  weekly: jsonb('weekly').notNull().default(sql`'[]'::jsonb`),
  assignments: jsonb('assignments').notNull().default(sql`'{}'::jsonb`),
  isActive: boolean('is_active').notNull().default(true), // Status flag
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Export Types (Optional but recommended) ---
export type Webshop = typeof webshops.$inferSelect;
export type NewWebshop = typeof webshops.$inferInsert;
export type Design = typeof designs.$inferSelect;
export type NewDesign = typeof designs.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;


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



export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
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
  role: varchar('role').notNull(),
  content: json('content').notNull(),
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
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
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
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
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
