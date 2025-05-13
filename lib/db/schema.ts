// lib/db/schema.ts

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
  integer,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// --- User Table ---
export const user = pgTable('User', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  pinHash: varchar('pinHash', { length: 255 }),
  isPinSet: boolean('isPinSet').default(false),
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
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

// --- Activity Logs ---
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// --- Invitations ---
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// --- Relations ---

export const usersRelations = relations(user, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations, { relationName: 'InvitationsSentByUsers' }),
  activityLogs: many(activityLogs),
  webshops: many(webshops),
  designs: many(designs),
  chats: many(chat),
  documents: many(document),
  suggestions: many(suggestion),
  votes: many(vote), // Added relation from user to their votes
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
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

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedByUser: one(user, {
    fields: [invitations.invitedBy],
    references: [user.id],
    relationName: 'InvitationsSentByUsers',
  }),
}));

// --- Webshops Table ---
export const webshops = pgTable('webshops', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  url: text('url'),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  platform: varchar('platform', { length: 50 }),
});

export const webshopsRelations = relations(webshops, ({ one, many }) => ({
    user: one(user, {
        fields: [webshops.userId],
        references: [user.id],
    }),
    customers: many(customers),
    campaigns: many(campaigns),
}));

// --- Designs Table ---
export const designs = pgTable('designs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  design: jsonb('design').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const designsRelations = relations(designs, ({ one }) => ({
    user: one(user, {
        fields: [designs.userId],
        references: [user.id],
    }),
}));

// --- Customers Table ---
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  webshopId: integer('webshop_id').notNull().references(() => webshops.id, { onDelete: 'cascade' }),
  shopIdentifier: varchar('shop_identifier', { length: 100 }),
  email: varchar('email', { length: 254 }).notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customersRelations = relations(customers, ({ one }) => ({
    webshop: one(webshops, {
        fields: [customers.webshopId],
        references: [webshops.id],
    }),
}));

// --- Campaigns Table ---
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  webshopId: integer('webshop_id').notNull().references(() => webshops.id, { onDelete: 'cascade' }),
  shopIdentifier: text('shop_identifier'),
  name: varchar('name', { length: 255 }).notNull(),
  sendNow: jsonb('send_now').notNull().default(sql`'[]'::jsonb`),
  weekly: jsonb('weekly').notNull().default(sql`'[]'::jsonb`),
  assignments: jsonb('assignments').notNull().default(sql`'{}'::jsonb`),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const campaignsRelations = relations(campaigns, ({ one }) => ({
    webshop: one(webshops, {
        fields: [campaigns.webshopId],
        references: [webshops.id],
    }),
}));

// --- Chat, Message, Vote, Document, Suggestion Tables ---

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export const chatRelations = relations(chat, ({ one, many }) => ({
    user: one(user, {
        fields: [chat.userId],
        references: [user.id],
    }),
    messages: many(message),
    votes: many(vote), // A chat can have many votes (on its messages)
}));

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const messageRelations = relations(message, ({ one, many }) => ({
    chat: one(chat, {
        fields: [message.chatId],
        references: [chat.id],
    }),
    votes: many(vote), // A message can have many votes
}));

// --- CORRECTED Vote Table Definition ---
export const vote = pgTable(
  'Vote',
  {
    // Columns are defined directly in this object
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id, { onDelete: 'cascade' }),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id, { onDelete: 'cascade' }),
    isUpvoted: boolean('isUpvoted').notNull(),
    // Moved userId here as a regular column
    userId: uuid('user_id') // Naming consistent with other FKs to user table
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => {
    // Constraints are defined in this callback
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId, table.userId] }),
    };
  },
);

export const voteRelations = relations(vote, ({ one }) => ({
    chat: one(chat, {
        fields: [vote.chatId],
        references: [chat.id],
    }),
    message: one(message, {
        fields: [vote.messageId],
        references: [message.id],
    }),
    user: one(user, { // User who made the vote
        fields: [vote.userId], // Now references the correctly defined column
        references: [user.id],
    }),
}));

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('kind', { enum: ['text', 'code', 'spreadsheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export const documentRelations = relations(document, ({ one, many }) => ({
    user: one(user, {
        fields: [document.userId],
        references: [user.id],
    }),
    suggestions: many(suggestion),
}));

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    documentFk: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }).onDelete('cascade'),
  }),
);

export const suggestionRelations = relations(suggestion, ({ one }) => ({
    document: one(document, {
        fields: [suggestion.documentId, suggestion.documentCreatedAt],
        references: [document.id, document.createdAt],
    }),
    user: one(user, {
        fields: [suggestion.userId],
        references: [user.id],
    }),
}));

// --- Export Types ---
export type User = typeof user.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type Webshop = typeof webshops.$inferSelect;
export type Design = typeof designs.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Chat = typeof chat.$inferSelect;
export type Message = typeof message.$inferSelect;
export type Vote = typeof vote.$inferSelect;
export type Document = typeof document.$inferSelect;
export type Suggestion = typeof suggestion.$inferSelect;

export type NewUser = typeof user.$inferInsert;
export type NewTeam = typeof teams.$inferInsert;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type NewInvitation = typeof invitations.$inferInsert;
export type NewWebshop = typeof webshops.$inferInsert;
export type NewDesign = typeof designs.$inferInsert;
export type NewCustomer = typeof customers.$inferInsert;
export type NewCampaign = typeof campaigns.$inferInsert;
export type NewChat = typeof chat.$inferInsert;
export type NewMessage = typeof message.$inferInsert;
export type NewVote = typeof vote.$inferInsert;
export type NewDocument = typeof document.$inferInsert;
export type NewSuggestion = typeof suggestion.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

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
  SET_PIN = 'SET_PIN',
}
