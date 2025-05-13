import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser, createUser } from '@/lib/db/queries'; // Assuming these are correct
import { authConfig } from './auth.config';

// Define the expected shape of the user object fetched from the database,
// especially for the authorization logic.
// IMPORTANT: For password-based authentication to work, the `getUser` function
// from '@/lib/db/queries' MUST be modified to select and return the user's password hash.
interface DbUserForAuth {
  id: string;
  name: string | null;
  email: string;
  password?: string | null; // Password hash from the database. Optional in type for safety, but required at runtime for this logic.
  // Include other fields that getUser returns, based on your error message:
  createdAt?: Date;
  pinHash?: string | null;
  isPinSet?: boolean;
  role?: string;
  updatedAt?: Date;
  deletedAt?: Date | null;
  emailVerified?: Date | null;
  // Add any other fields your application might expect on dbUser
}


interface ExtendedSession extends Session {
  user: User & {
    id?: string | null;
    email?: string | null;
  };
}

async function createAnonymousUserExplicitly() {
  const anonymousEmail = `anon_${Date.now()}@anonymous.user`;
  const anonymousPassword = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  try {
    await createUser(anonymousEmail, anonymousPassword);
    // The type of fetchedUser will be inferred from getUser.
    // If getUser's return type doesn't include all necessary fields for other operations,
    // a similar type assertion might be needed here, or preferably, getUser's return type
    // should be accurately defined in @/lib/db/queries.
    const fetchedUser = await getUser(anonymousEmail);
    if (!fetchedUser) {
        throw new Error('Failed to fetch newly created anonymous user.');
    }
    // Assuming fetchedUser has an 'id' property from the actual getUser implementation.
    // The error message indicates 'id' is present.
    console.log(`Explicitly created anonymous user: ${(fetchedUser as DbUserForAuth).id}`);
    return fetchedUser as DbUserForAuth; // Return with the more specific type if needed downstream

  } catch (error) {
    console.error('Failed to explicitly create anonymous user:', error);
    throw new Error(`Anonymous user creation failed: ${error instanceof Error ? error.message : String(error)}`);
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
      async authorize(credentials: any) {
        try {
          const { email, password } = credentials ?? {};

          if (email && password) {
            console.log(`Authorizing user: ${email}`);

            // Use type assertion to inform TypeScript about the expected shape of dbUser, including 'password'.
            // CRITICAL: The actual 'getUser' implementation in '@/lib/db/queries'
            // MUST fetch the password hash from the database.
            const dbUser = await getUser(email) as DbUserForAuth | null;

            if (!dbUser) {
                console.log(`Authorization failed: User ${email} not found.`);
                return null;
            }

            // This check is now valid from TypeScript's perspective.
            // It remains crucial for runtime safety: if 'getUser' doesn't return a password, this will catch it.
            if (!dbUser.password) {
                console.log(`Authorization failed: User ${email} has no password set (or password not fetched by getUser).`);
                return null;
            }

            const passwordsMatch = await compare(password, dbUser.password);
            if (!passwordsMatch) {
                console.log(`Authorization failed: Password mismatch for ${email}.`);
                return null;
            }

            console.log(`Authorization successful for ${email}, user ID: ${dbUser.id}`);
            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
            };
          }

          console.log("Authorize called without email/password - denying credential auth.");
          return null;

        } catch (error) {
          console.error('Error during authorization:', error);
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
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        console.log(`JWT Callback: User object present (sign-in). Assigning ID: ${user.id}`);
        token.id = user.id;
        token.email = user.email;
        // token.name = user.name; // If you added name to the object returned by authorize
      } else {
        console.log(`JWT Callback: No user object (subsequent request or failed login). Token ID (if any): ${token.id}`);
      }
      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: any }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        if (token.email) {
          session.user.email = token.email as string;
        }
        // if (token.name) {
        //   session.user.name = token.name as string;
        // }
        console.log(`Session Callback: Assigning user ID ${token.id} to session.`);
      } else {
        console.log("Session Callback: No token ID found or session.user is undefined, user is unauthenticated.");
      }
      return session;
    },
  },
});
