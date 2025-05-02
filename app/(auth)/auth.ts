// auth.ts
import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser, createUser } from '@/lib/db/queries'; // Assuming these are correct
import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  // Ensure your User type includes id and email if not default
  user: User & {
    id?: string | null;
    email?: string | null;
  };
}

// Function to explicitly create an anonymous user IF NEEDED elsewhere
// Note: This is no longer called automatically by the JWT callback
async function createAnonymousUserExplicitly() {
  const anonymousEmail = `anon_${Date.now()}@anonymous.user`;
  // Consider a more secure way to handle potential "password" for anon users if needed
  const anonymousPassword = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  try {
    // First create the user
    await createUser(anonymousEmail, anonymousPassword);

    // Then verify the user was created by fetching it
    const [user] = await getUser(anonymousEmail);
    if (!user) {
        throw new Error('Failed to fetch newly created anonymous user.');
    }
    console.log(`Explicitly created anonymous user: ${user.id}`);
    return user;

  } catch (error) {
    console.error('Failed to explicitly create anonymous user:', error);
    // Instead of returning null, throw an error
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
      // Optional: Define credentials fields if you want NextAuth to generate a form
      // credentials: {
      //   email: { label: "Email", type: "email" },
      //   password: { label: "Password", type: "password" }
      // },
      async authorize(credentials: any) { // Use 'credentials' directly
        try {
          const { email, password } = credentials ?? {}; // Safely destructure

          // --- Handle regular authentication ---
          if (email && password) {
            console.log(`Authorizing user: ${email}`); // Debug log
            const users = await getUser(email);
            if (users.length === 0) {
                console.log(`Authorization failed: User ${email} not found.`);
                return null; // User not found
            }

            // biome-ignore lint: Forbidden non-null assertion (consider checking if password exists)
            const user = users[0];
            if (!user.password) {
                console.log(`Authorization failed: User ${email} has no password set.`);
                return null; // User exists but has no password
            }

            const passwordsMatch = await compare(password, user.password);
            if (!passwordsMatch) {
                console.log(`Authorization failed: Password mismatch for ${email}.`);
                return null; // Passwords don't match
            }

            console.log(`Authorization successful for ${email}, user ID: ${user.id}`);
            // Return the user object expected by NextAuth (must include id)
            return { id: user.id, email: user.email, name: user.name }; // Adjust fields as needed
          }

          // --- Handle Anonymous/Guest Access ---
          // If NO email/password provided, previously created anonymous user.
          // NOW: We explicitly DO NOT create an anonymous user here during authorize.
          // Returning null signifies failed credential login.
          // If you want a specific "Sign in as Guest" button, it would call
          // signIn with specific parameters, or you'd handle guest session differently.
          console.log("Authorize called without email/password - denying credential auth.");
          return null;

        } catch (error) {
          console.error('Error during authorization:', error);
          return null; // Return null on any error
        }
      },
    }),
    // Add other providers like Google, GitHub here if needed
  ],
  // Add proxy configuration for Docker environment if needed
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`, // Or your preferred cookie name
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Consider setting domain and maxAge/expires
      },
    },
    // Add other cookies (CSRF, callbackUrl) if customizing them
  },
  trustHost: true, // Useful for reverse proxies/deployments
  callbacks: {
    // --- MODIFIED JWT Callback ---
    async jwt({ token, user, account, profile, isNewUser }) {
      // 'user' is only passed on sign-in/sign-up
      if (user?.id) {
        // Successful sign-in, update token with user ID and email
        console.log(`JWT Callback: User object present (sign-in). Assigning ID: ${user.id}`);
        token.id = user.id;
        token.email = user.email; // Add email to token
        // Add other user details to token if needed (e.g., name, role)
        // token.name = user.name;
      } else {
        // This runs on subsequent requests when user is not logging in.
        // We simply return the existing token.
        // DO NOT create anonymous user here.
        console.log(`JWT Callback: No user object (subsequent request). Token ID: ${token.id}`);
      }
      return token; // Return the token (might lack 'id' if user never logged in)
    },
    // --- Session Callback ---
    async session({ session, token }: { session: ExtendedSession; token: any }) {
      // Assign the user ID from the token (if it exists) to the session object
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string; // Assign email from token
        // Assign other details from token if needed
        // session.user.name = token.name as string;
        console.log(`Session Callback: Assigning user ID ${token.id} to session.`);
      } else {
        // If no token.id, the user is not authenticated
        console.log("Session Callback: No token ID found, user is unauthenticated.");
        // Ensure session.user reflects unauthenticated state if necessary
        // session.user = undefined; // Or adjust based on your needs
      }
      return session;
    },
  },
  // Optional: Add session strategy (jwt is default and recommended)
  // session: { strategy: "jwt" },
  // Optional: Add debug flag for development
  // debug: process.env.NODE_ENV === 'development',
});
