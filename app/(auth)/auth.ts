// /app/(auth)/auth.ts

import { compare } from 'bcrypt-ts'; // Or import { compare } from 'bcrypt';
import NextAuth, { type User, type Session } from 'next-auth';
import type { AdapterSession, AdapterUser } from "next-auth/adapters"; // Import adapter types if needed, or remove if not using an adapter
import type { JWT } from "next-auth/jwt"; // Import JWT type
import Credentials from 'next-auth/providers/credentials';

// Make sure these imports point to the correct functions in your queries file
import { getUserByEmail, createUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';

// Define the User type based on your actual schema if possible
interface AppUser extends User {
  id: string; // Must be string for NextAuth compatibility
  name: string | null;
  email: string;
  // Add other relevant user fields you might want in the session/token
  // role?: string;
}

// Define the type returned by your database query
interface DbUser {
    id: number; // Assuming DB uses number for ID
    name: string | null;
    email: string;
    passwordHash: string; // *** ADJUST THIS NAME if your field is different (e.g., password) ***
    role?: string;
    // Add other fields from your users table as needed
}


interface ExtendedSession extends Session {
  // Ensure user here matches AppUser which now has id: string
  user: AppUser;
  // Add any other custom session properties if needed
  // accessToken?: string;
}

// This function now needs to return a user matching AppUser (id: string)
async function createAnonymousUser(): Promise<AppUser | null> {
  const anonymousEmail = `anon_${Date.now()}@anonymous.user`;
  const anonymousPassword = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  try {
    // Assuming createUser handles hashing. If not, hash anonymousPassword first.
    await createUser(anonymousEmail, anonymousPassword);

    const usersResult: DbUser[] = await getUserByEmail(anonymousEmail); // Expects DbUser array

    if (usersResult.length === 0) {
        console.error('Failed to retrieve anonymous user immediately after creation.');
        throw new Error('Anonymous user creation verification failed');
    }

    const dbUser = usersResult[0];

    // Convert DbUser to AppUser format for NextAuth (especially id to string)
    const appUser: AppUser = {
        id: dbUser.id.toString(), // Convert number ID to string
        name: dbUser.name,
        email: dbUser.email,
    };
    return appUser;

  } catch (error) {
    console.error('Failed to create anonymous user:', error);
    throw new Error('Anonymous user creation failed');
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // Authorize must return a type compatible with NextAuth's User (id: string)
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials?.password) {
            console.log('Authorize called without email/password');
             return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // Fetch user data including the password hash field
          const users: DbUser[] = await getUserByEmail(email); // Expects DbUser array

          if (users.length === 0) {
            console.log(`Authentication failed: No user found for email ${email}`);
            return null;
          }

          const dbUser = users[0];

          // *** CRITICAL: Use the correct field name for the password hash ***
          const storedPasswordHash = dbUser.passwordHash; // Adjust if needed

          if (!storedPasswordHash) {
             console.error(`Authentication failed: User object for ${email} missing password hash field.`);
             return null;
          }

          // Compare the provided password with the stored hash
          const passwordsMatch = await compare(password, storedPasswordHash);

          if (!passwordsMatch) {
            console.log(`Authentication failed: Incorrect password for email ${email}`);
            return null;
          }

          console.log(`Authentication successful for email ${email}`);

          // Return user object in AppUser format (id as string, no password hash)
          const appUser: AppUser = {
              id: dbUser.id.toString(), // Convert number ID to string
              name: dbUser.name,
              email: dbUser.email,
              // role: dbUser.role // Include other needed fields
          };
          return appUser;

        } catch (error) {
          console.error(`Authentication error for email ${email}:`, error);
          return null;
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      },
    },
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      // 'user' here is the object returned by 'authorize' (AppUser type)
      if (user) {
        // Persist required info to the token
        token.id = user.id; // user.id is string here
        // Add other fields from AppUser to token if needed for session
        // token.name = user.name; // Example
        // token.email = user.email; // Example
        // token.role = user.role; // Example
      }
      return token;
    },
    // Corrected session callback signature
    async session(params: { session: Session; token: JWT; user: User /* May differ if using adapter */ }) {
        // Destructure for convenience, respecting the input param structure
        const { session, token } = params;

        // Ensure session.user exists and token has the id we added in jwt callback
        // Assign properties from the token to the session.user object
        // This ensures the session reflects the data stored in the secure JWT
        if (token && session.user) {
            // Assign the id (which should be a string from the token)
            session.user.id = token.id as string;

            // Assign other properties persisted in the token back to the session user
            // Make sure these properties exist on your AppUser/ExtendedSession['user'] type
            // session.user.name = token.name as string | null; // Example
            // session.user.email = token.email as string; // Example
            // session.user.role = token.role as string; // Example
        }
        // Return the potentially modified session object
        // Ensure the returned object structure matches what NextAuth expects
        // (TypeScript might still complain if ExtendedSession differs too much from base Session)
        return session as ExtendedSession; // Cast back to your extended type if needed, be cautious
    },
  },
});
