// app/(auth)/register/action.ts
import { NextResponse } from 'next/server';
import { drizzle } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { signIn } from 'next-auth/react';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // simple upsert; in production hash your password!
  try {
    await drizzle.insert(user).values({ name, email, password }).run();
  } catch (err) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  // auto-login
  await signIn('credentials', { email, password, redirect: false });
  return NextResponse.json({ ok: true });
}
