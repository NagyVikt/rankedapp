// lib/db/index.ts
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

// pull in your table definitions
export * from './schema'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined')
}

const sql = postgres(process.env.POSTGRES_URL, { max: 1 })
export const db = drizzle(sql)
