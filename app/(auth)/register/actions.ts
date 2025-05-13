// app/(auth)/register/action.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Correctly importing 'db'
import { user } from '@/lib/db/schema'; // Assuming 'user' is your user table schema
import { signIn } from 'next-auth/react'; // For client-side usage, consider if this is intended for a server action

// It's highly recommended to hash passwords before storing them.
// Import a hashing library like bcrypt or bcrypt-ts
// import { hash } from 'bcrypt-ts'; // Or your preferred hashing library

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // --- Input Validation (Recommended) ---
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields (name, email, password)' }, { status: 400 });
    }
    if (password.length < 8) { // Example: Minimum password length
        return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    // Add more validation as needed (e.g., email format)


    // --- Password Hashing (CRITICAL for production) ---
    // const hashedPassword = await hash(password, 10); // 10 is the salt rounds

    // --- Insert User ---
    // In a real application, you should check if the user already exists by email before inserting.
    // For example:
    // const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);
    // if (existingUser.length > 0) {
    //   return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 }); // 409 Conflict
    // }

    // Corrected: Using 'db' to call Drizzle methods


    // --- Auto-login ---
    // Note: signIn from 'next-auth/react' is typically for client-side components.
    // For server-side route handlers in Next.js App Router, you'd usually redirect
    // or use the `signIn` function from your `auth.ts` (NextAuth.js v5+)
    // if you intend to programmatically sign in from the server.
    // However, if you just want to tell the client to attempt a sign-in,
    // returning a success and letting the client call signIn might be intended.

    // For now, assuming this is what you intend for the client to handle:
    // The client would receive this response and then call signIn('credentials', {...})

    return NextResponse.json({ ok: true, message: 'User registered successfully. Please sign in.' }, { status: 201 }); // 201 Created

  } catch (err: any) {
    console.error("Registration error:", err);

    // More specific error handling (e.g., Drizzle's unique constraint violation)
    if (err.code === '23505') { // PostgreSQL unique violation error code
        return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
    }

    return NextResponse.json({ message: 'An unexpected error occurred during registration.' }, { status: 500 });
  }
}
