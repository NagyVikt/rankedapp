// lib/db/index.ts
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

// pull in your table definitions
export * from './schema'

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined')
}

const sql = postgres(process.env.POSTGRES_URL, { max: 1 })
export const db = drizzle(sql)

export default async function Home() {
  // 1️⃣ Call the server helper to get a Supabase client
  const supabase = await supabaseServer();

  // 2️⃣ Now you can safely call auth methods
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3️⃣ Redirect based on session presence
  redirect(session ? '/chat' : '/login');
}
