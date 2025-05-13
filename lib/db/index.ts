// lib/db/index.ts
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// 1. Import your schema definitions so you can pass them to drizzle
import * as schema from './schema';

// re‑export your schema types/tables (this is good for convenience in other files)
export * from './schema';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

// 2. Pass the imported 'schema' to the drizzle function
export const db = drizzle(sql, {
  schema: schema,
  logger: process.env.NODE_ENV === 'development',
}); // Or just { schema } if using ES6 shorthand

// Using `logger: process.env.NODE_ENV === 'development'` is also recommended for debugging during development
