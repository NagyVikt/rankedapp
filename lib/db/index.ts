// lib/db/index.ts
import postgres from 'postgres'
// 1. You IMPORT a function named 'drizzle' here from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'

// re‑export your schema types/tables
export * from './schema' // Good, you're exporting your schema

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined')
}

const sql = postgres(process.env.POSTGRES_URL, { max: 1 })
// 2. You CALL the imported 'drizzle' function and export its RESULT as 'db'
export const db = drizzle(sql)