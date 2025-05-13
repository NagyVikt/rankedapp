// app/actions.ts (or relevant path)
'use server';

import { z } from 'zod';
import { and, eq, sql, isNull, ne } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache'; // For updating UI after actions
import { redirect } from 'next/navigation';
import { genSaltSync, hashSync, compare } from 'bcrypt-ts'; // Use compare instead of comparePasswords
import { ZodTypeAny } from 'zod';
// Import the entire schema
import * as schema from '@/lib/db/schema';
// Import specific types
import type {
  User,
  Team,
  TeamMember,
  ActivityLog,
  Invitation,
  NewUser,
  NewTeam,
  NewTeamMember,
  NewActivityLog,
  NewInvitation,
  TeamDataWithMembers,
} from '@/lib/db/schema';
import { ActivityType } from '@/lib/db/schema'; // Assuming enum is in schema file

// --- Database Connection ---
// biome-ignore lint: Forbidden non-null assertion.
const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);
const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// --- Supabase Auth Helper ---
/**
 * Gets the authenticated Supabase user for the current request from Supabase Auth
 * and verifies they exist in the local public.User table.
 * Returns the user record from public.User, or null if not authenticated/found/synced.
 */
async function getAuthenticatedUser(): Promise<schema.User | null> {
  const cookieStore = await cookies(); // Use await here as cookies() returns a promise-like object
  // Ensure Supabase URL and Anon Key are correctly set in environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      'Supabase URL or Anon Key is missing from environment variables.',
    );
    return null;
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Ensure cookieStore is resolved before accessing methods
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );
  try {
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error('Supabase getUser error:', error.message);
      return null;
    }
    if (!supabaseUser) {
      return null;
    } // Not authenticated

    // Verify user exists in your public.User table using the Supabase ID (UUID)
    // Assuming schema.user.id is the correct column name (UUID)
    const appUser = await db.query.user.findFirst({
      where: eq(schema.user.id, supabaseUser.id), // Match UUIDs
    });
    if (!appUser) {
      console.warn(
        `User ${supabaseUser.id} authenticated with Supabase but NOT FOUND in public.User table.`,
      );
    }
    return appUser || null;
  } catch (err) {
    console.error('Error in getCurrentSupabaseUser:', err);
    return null;
  }
}

// --- Activity Logging Helper ---
/**
 * Logs user activity.
 * @param teamId - The ID of the team (SERIAL, number). Can be null if action is not team-specific.
 * @param userId - The ID of the user performing the action (UUID, string).
 * @param type - The type of activity from the enum.
 * @param ipAddress - Optional IP address.
 */
async function logActivity(
  teamId: number | null | undefined, // Use camelCase to match schema definition
  userId: string, // Use camelCase to match schema definition
  type: ActivityType,
  ipAddress?: string, // Use camelCase to match schema definition
) {
  // Only proceed if userId is valid
  if (!userId) {
    console.warn('logActivity skipped: userId is missing.');
    return;
  }
  // Team ID can be null for certain actions (like account deletion before team association)
  if (teamId === undefined) {
    console.warn(
      `logActivity: teamId was undefined for action ${type}, logging without team context.`,
    );
    teamId = null; // Log as null if undefined
  }

  try {
    // Use camelCase matching Drizzle schema definition
    const newActivity: NewActivityLog = {
      teamId: teamId, // Corrected: camelCase
      userId: userId, // Corrected: camelCase
      action: type,
      ipAddress: ipAddress || undefined, // Corrected: camelCase
      // timestamp defaults via DB/schema
    };
    // Assuming schema.activityLogs is the correct table object from your schema import
    await db.insert(schema.activityLogs).values(newActivity);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't block the main action if logging fails, but log the error
  }
}

// Define a base state type for useActionState
export type ActionState = {
  error?: string | null;
  success?: string | null;
  email?: string; // Keep email for pre-filling form on error
  // Add other fields if needed
};

// --- Middleware/Validation Helper (Conceptual Rewrite) ---
// This replaces validatedAction and validatedActionWithUser to use Supabase SSR auth

/**
 * Wraps a server action, ensuring the user is authenticated via Supabase SSR.
 * @param action - The server action function to execute.
 * @returns A new function that performs the auth check before running the action.
 */

function authenticatedAction<
  TInput extends ZodTypeAny | null,
  TOutput extends ActionState,
>(
  inputSchema: TInput,
  action: (
    data: TInput extends ZodTypeAny ? z.infer<TInput> : unknown,
    user: User,
    formData?: FormData,
  ) => Promise<TOutput>,
): (currentState: TOutput, formData: FormData) => Promise<TOutput> {
  return async (currentState, formData) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { ...currentState, error: 'Authentication required.' } as TOutput;
    }

    let validatedData: any = {};
    if (inputSchema) {
      // 1) convert entire FormData into a plain object
      const raw: Record<string, any> = Object.fromEntries(formData.entries());
      // 2) validate with Zod
      const result = inputSchema.safeParse(raw);
      if (!result.success) {
        const errors = result.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        return {
          ...currentState,
          error: `Invalid input: ${errors}`,
        } as TOutput;
      }
      validatedData = result.data;
    }

    try {
      return await action(validatedData, user, formData);
    } catch (err: any) {
      console.error('Error in authenticatedAction:', err);
      return {
        ...currentState,
        error: err.message ?? 'Unexpected server error.',
      } as TOutput;
    }
  };
}

// --- Sign In Action (Using Supabase SSR) ---
const signInSchema = z.object({
  email: z.string().email('Invalid email format.').min(1, 'Email is required.'),
  password: z.string().min(1, 'Password is required.'), // Min length validation handled by Supabase/DB
});

export const signInWithSupabase = async (
  currentState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    return { error: `Invalid input: ${errors}` };
  }

  const { email, password } = result.data;
  const cookieStore = await cookies(); // Use await
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Ensure cookieStore is resolved before passing
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach((co) => cookieStore.set(co)),
      },
    },
  );

  console.log(`Attempting Supabase sign in for: ${email}`);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error(`Supabase sign in error for ${email}:`, error.message);
    return { error: `Sign in failed: ${error.message}`, email }; // Return email for pre-fill
  }

  console.log(`Supabase sign in successful for: ${email}`);

  // --- Log Sign-In Activity (Optional but Recommended) ---
  const {
    data: { user: signedInUser },
  } = await supabase.auth.getUser();
  if (signedInUser) {
    // Use camelCase matching Drizzle schema
    const membership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.userId, signedInUser.id), // Corrected: camelCase userId
      columns: { teamId: true }, // Corrected: camelCase teamId
    });
    await logActivity(
      membership?.teamId ?? null,
      signedInUser.id,
      ActivityType.SIGN_IN,
    ); // Pass teamId
  } else {
    console.warn('Could not get user immediately after sign-in for logging.');
  }
  // --- End Logging ---

  revalidatePath('/', 'layout');
  redirect('/dashboard');
};

// --- Sign Up Action (Using Supabase SSR) ---
const signUpSchema = z.object({
  email: z
    .string()
    .email('Invalid email format.')
    .min(1, 'Email is required.')
    .max(64),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100),
  inviteId: z.string().optional(),
});

export const signUpWithSupabase = async (
  currentState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    return { error: `Invalid input: ${errors}` };
  }
  const { email, password, inviteId } = result.data;
  const cookieStore = await cookies(); // Use await
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Ensure cookieStore is resolved before passing
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach((co) => cookieStore.set(co)),
      },
    },
  );

  console.log(`Attempting Supabase sign up for: ${email}`);
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Include emailRedirectTo if you want users redirected after confirmation
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      // Include data for user_metadata if needed (like name)
      // data: { name: name } // Assuming 'name' variable exists if needed
    },
  });

  if (error) {
    console.error(`Supabase sign up error for ${email}:`, error.message);
    // Provide more specific errors if possible
    if (error.message.includes('User already registered')) {
      return { error: 'An account with this email already exists.', email };
    }
    return { error: `Sign up failed: ${error.message}`, email };
  }

  // Handle case where user exists but is unconfirmed (resend confirmation)
  if (signUpData.user && signUpData.user.identities?.length === 0) {
    console.log(
      `User ${email} exists but is unconfirmed. Resending confirmation.`,
    );
    // Optionally resend confirmation email here if needed, though Supabase might handle it.
    // await supabase.auth.resend({ type: 'signup', email: email });
    return {
      success:
        'Please check your email to confirm your account (confirmation resent).',
      email,
    };
  }

  // Check if user was created (implies confirmation needed or auto-confirmed)
  if (!signUpData.user) {
    console.error(
      `Supabase sign up for ${email} did not return a user object and no error.`,
    );
    return {
      error: 'Sign up failed for an unknown reason. Please try again.',
      email,
    };
  }

  console.log(
    `Supabase sign up successful for: ${email}. User ID: ${signUpData.user.id}. Confirmation required: ${signUpData.user.email_confirmed_at === null}`,
  );
  // IMPORTANT: Rely on the database trigger ('handle_new_user') to sync the user
  // from auth.users to public.User. Do not call createUser() here.
  return {
    success:
      'Account created successfully! Please check your email to confirm your account.',
    email,
  };
};

// --- Sign Up / Setup Action ---
// This action should be called AFTER the user has confirmed their email and logged in.
// It sets up their initial team or processes an invitation.
const completeSetupSchema = z.object({
  teamName: z.string().min(1, 'Team name cannot be empty').max(100).optional(),
  inviteId: z.string().optional(),
});
export const completeSetupAfterSignUp = authenticatedAction(
  completeSetupSchema,
  async (data, user, formData) => {
    const { teamName: providedTeamName, inviteId } = data;
    console.log(`completeSetupAfterSignUp called for user ${user.id}`); // Debug Log

    // Use camelCase matching Drizzle schema
    const existingMembership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
    });
    if (existingMembership) {
      console.log(
        `User ${user.id} already has team membership. Skipping setup.`,
      );
      redirect('/dashboard');
    }

    let teamId: number; // Changed back to camelCase to match schema type
    let userRole: string = 'owner';
    let teamForSetup:
      | {
          id: number;
          name: string;
          createdAt: Date;
          updatedAt: Date;
          /* … */
        }
      | null
      | undefined = undefined;

    const teamName = providedTeamName || `${user.email}'s Team`;

    // --- Handle Invitation (If applicable) ---
    if (inviteId) {
      const parsedInviteId = parseInt(inviteId, 10);
      if (isNaN(parsedInviteId))
        return { error: 'Invalid invitation ID format.' };
      // Use camelCase matching Drizzle schema
      const invitation = await db.query.invitations.findFirst({
        where: and(
          eq(schema.invitations.id, parsedInviteId),
          eq(schema.invitations.email, user.email!),
          eq(schema.invitations.status, 'pending'),
        ),
      });
      if (invitation) {
        console.log(`Processing invitation ${inviteId} for user ${user.id}`);
        teamId = invitation.teamId; // Corrected: camelCase
        userRole = invitation.role;
        await Promise.all([
          db
            .update(schema.invitations)
            .set({ status: 'accepted' })
            .where(eq(schema.invitations.id, invitation.id)),
          logActivity(teamId, user.id, ActivityType.ACCEPT_INVITATION),
        ]);
        teamForSetup = await db.query.teams.findFirst({
          where: eq(schema.teams.id, teamId),
        });
        if (!teamForSetup) {
          console.error(
            `Team with ID ${teamId} not found for accepted invitation ${inviteId}`,
          );
          return { error: 'Associated team not found.' };
        }
        console.log(
          `User ${user.id} accepted invite to team ${teamId} with role ${userRole}`,
        );
      } else {
        console.warn(
          `Invalid or expired invitation ${inviteId} for user ${user.id}. Creating new team.`,
        );
        // Fall through to create a new team
      }
    }

    // --- Create New Team (If no valid invitation processed) ---
    if (!teamForSetup) {
      console.log(`Creating new team "${teamName}" for user ${user.id}`);
      const newTeamData: NewTeam = { name: teamName };
      const [insertedTeam] = await db
        .insert(schema.teams)
        .values(newTeamData)
        .returning();
      if (!insertedTeam) {
        console.error(`Failed to create team for user ${user.id}`);
        return { error: 'Failed to create team.' };
      }
      teamForSetup = insertedTeam;
      teamId = teamForSetup.id;
      userRole = 'owner';
      await logActivity(teamId, user.id, ActivityType.CREATE_TEAM);
      console.log(`Created new team ${teamId} for user ${user.id}`);
    } else {
      teamId = teamForSetup.id; // Ensure teamId is set if using invitation
    }

    // --- Create Team Membership ---
    // Use camelCase matching Drizzle schema
    const newTeamMember: NewTeamMember = {
      userId: user.id, // Corrected: camelCase
      teamId: teamId!, // Corrected: camelCase - Use non-null assertion as teamId is guaranteed to be set
      role: userRole,
    };
    await db.insert(schema.teamMembers).values(newTeamMember);
    console.log(
      `Created team membership for user ${user.id} in team ${teamId!}`,
    );

    // Log general sign-up completion activity (optional)
    await logActivity(teamId!, user.id, ActivityType.SIGN_UP);

    // --- Handle Checkout Redirect ---
    const redirectTo = formData?.get('redirect') as string | null;
    if (redirectTo === 'checkout' && teamForSetup) {
      const priceId = formData?.get('priceId') as string | null;
      if (!priceId) {
        console.error(
          'Checkout redirect requested without priceId during setup',
        );
        // Fall through to dashboard redirect
      } else {
        console.log(
          `Redirecting user ${user.id} to checkout for team ${teamId!}, price ${priceId}`,
        );
        // Assuming createCheckoutSession is adapted for Server Actions or you redirect differently
        // return createCheckoutSession({ team: teamForSetup, priceId }); // This might need adjustment
        redirect(`/checkout?teamId=${teamId!}&priceId=${priceId}`); // Example redirect
      }
    }

    // --- Redirect to Dashboard ---
    console.log(
      `Setup complete for user ${user.id}. Redirecting to dashboard.`,
    );
    redirect('/dashboard');
    // This action implicitly returns success via redirect
    // If not redirecting, might need: return { success: 'Setup complete!' };
  },
);

// --- Sign Out Action ---
export async function signOut() {
  console.log('signOut() action called...');
  const cookieStore = await cookies(); // Use await
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Ensure cookieStore is resolved before passing
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach((co) => cookieStore.set(co)),
      },
    },
  );
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Use camelCase matching Drizzle schema
      const membership = await db.query.teamMembers.findFirst({
        where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
        columns: { teamId: true }, // Corrected: camelCase
      });
      await logActivity(
        membership?.teamId ?? null,
        user.id,
        ActivityType.SIGN_OUT,
      ); // Pass teamId
    }
  } catch (error) {
    console.error('Error fetching user or logging sign-out:', error);
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase signOut error:', error);
  } else {
    console.log('Supabase signOut successful.');
  }
  redirect('/login');
}

// --- Update Password Action ---
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation password do not match.',
    path: ['confirmPassword'],
  });
export const updatePassword = authenticatedAction(
  updatePasswordSchema,
  async (data, user) => {
    const { currentPassword, newPassword } = data;
    const cookieStore = await cookies(); // Use await
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (c) => c.forEach((co) => cookieStore.set(co)),
        },
      },
    );
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });
    if (reauthError) {
      console.warn(
        `Password re-authentication failed for user ${user.id}: ${reauthError.message}`,
      );
      return { error: 'Current password is incorrect.' };
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) {
      console.error(
        `Supabase updateUser (password) error for user ${user.id}:`,
        updateError,
      );
      return { error: `Failed to update password: ${updateError.message}` };
    }
    // Use camelCase matching Drizzle schema
    const membership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
      columns: { teamId: true }, // Corrected: camelCase
    });
    await logActivity(
      membership?.teamId ?? null,
      user.id,
      ActivityType.UPDATE_PASSWORD,
    ); // Pass teamId
    return { success: 'Password updated successfully.' };
  },
);

// --- Delete Account Action ---
const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});
export const deleteAccount = authenticatedAction(
  deleteAccountSchema,
  async (data, user) => {
    const { password } = data;
    const cookieStore = await cookies(); // Use await
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (c) => c.forEach((co) => cookieStore.set(co)),
        },
      },
    );
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
    });
    if (reauthError) {
      console.warn(
        `Password re-authentication failed for account deletion (user ${user.id}): ${reauthError.message}`,
      );
      return { error: 'Incorrect password. Account deletion failed.' };
    }
    // --- Implementing Option 3: Soft Delete in public.User ---
    try {
      // Use camelCase matching Drizzle schema
      const membership = await db.query.teamMembers.findFirst({
        where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
        columns: { teamId: true }, // Corrected: camelCase
      });
      await logActivity(
        membership?.teamId ?? null,
        user.id,
        ActivityType.DELETE_ACCOUNT,
      ); // Pass teamId
      const deletedEmail = `${user.email}-deleted-${Date.now()}`;
      await db
        .update(schema.user) // make sure you reference the correct exported identifier
        .set({
          deletedAt: new Date(),
          email: deletedEmail,
          name: 'Deleted User',
          emailVerified: null,
          updatedAt: new Date(), // keep your updatedAt timestamp in sync
        })
        .where(eq(schema.user.id, user.id));

      await supabase.auth.signOut();
    } catch (error) {
      console.error(
        `Error during soft delete process for user ${user.id}:`,
        error,
      );
      return { error: 'An error occurred during account deletion.' };
    }
    redirect('/login?message=Account+deleted+successfully');
  },
);

// --- Update Account (Name/Email) Action ---
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(255).trim(),
  email: z.string().email('Invalid email address').max(64),
});
export const updateAccount = authenticatedAction(
  updateAccountSchema,
  async (data, user) => {
    const { name, email } = data;
    let needsReverification = false;
    if (email !== user.email) {
      const existingUser = await db.query.user.findFirst({
        where: and(
          eq(schema.user.email, email),
          isNull(schema.user.deletedAt),
          ne(schema.user.id, user.id),
        ),
        columns: { id: true },
      });
      if (existingUser) {
        return { name, email, error: 'This email address is already in use.' };
      }
      needsReverification = true;
    }
    const cookieStore = await cookies(); // Use await
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (c) => c.forEach((co) => cookieStore.set(co)),
        },
      },
    );
    const { error: updateError } = await supabase.auth.updateUser({
      email: email,
      data: { name: name },
    });
    if (updateError) {
      return {
        name,
        email,
        error: `Failed to update authentication details: ${updateError.message}`,
      };
    }
    try {
      await db
        .update(schema.user)
        .set({
          name: name,
          email: email,
          emailVerified: needsReverification ? null : user.emailVerified,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, user.id));
      // Use camelCase matching Drizzle schema
      const membership = await db.query.teamMembers.findFirst({
        where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
        columns: { teamId: true }, // Corrected: camelCase
      });
      await logActivity(
        membership?.teamId ?? null,
        user.id,
        ActivityType.UPDATE_ACCOUNT,
      ); // Pass teamId
      if (needsReverification) {
        /* ... TODO: Trigger verification ... */
      }
      revalidatePath('/account');
      return {
        name,
        email,
        success:
          'Account updated successfully.' +
          (needsReverification ? ' Please check your email...' : ''),
      };
    } catch (dbError) {
      console.error(
        `Error updating public.User table for user ${user.id}:`,
        dbError,
      );
      return {
        name,
        email,
        error: 'Failed to update user details in database.',
      };
    }
  },
);

// --- Set Account PIN Action ---
const setPinSchema = z.object({
  pin: z
    .string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
});
export const setAccountPin = authenticatedAction(
  setPinSchema,
  async (data, user) => {
    const { pin } = data;
    try {
      const salt = genSaltSync(10);
      const pinHash = hashSync(pin, salt);
      await db
        .update(schema.user)
        .set({ pinHash: pinHash, isPinSet: true, updatedAt: new Date() })
        .where(eq(schema.user.id, user.id));
      // Use camelCase matching Drizzle schema
      const membership = await db.query.teamMembers.findFirst({
        where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
        columns: { teamId: true }, // Corrected: camelCase
      });
      await logActivity(
        membership?.teamId ?? null,
        user.id,
        ActivityType.SET_PIN,
      ); // Pass teamId
      revalidatePath('/account');
      return { success: 'PIN set successfully.' };
    } catch (error) {
      console.error(`Error setting PIN for user ${user.id}:`, error);
      return { error: 'Failed to set PIN. Please try again.' };
    }
  },
);

// --- Remove Team Member Action ---
const removeTeamMemberSchema = z.object({
  memberId: z.string().uuid('Invalid member ID format'),
});
export const removeTeamMember = authenticatedAction(
  removeTeamMemberSchema,
  async (data, user) => {
    const { memberId } = data;
    // Use camelCase matching Drizzle schema
    const actorMembership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
      columns: { teamId: true, role: true }, // Corrected: camelCase
    });
    if (!actorMembership?.teamId) {
      return { error: 'You are not part of a team.' };
    } // Corrected: camelCase
    if (memberId === user.id) {
      return { error: 'You cannot remove yourself using this action.' };
    }
    if (actorMembership.role !== 'owner') {
      return { error: 'You do not have permission to remove team members.' };
    }

    // Use camelCase matching Drizzle schema
    const memberToRemove = await db.query.teamMembers.findFirst({
      where: and(
        eq(schema.teamMembers.userId, memberId), // Corrected: camelCase
        eq(schema.teamMembers.teamId, actorMembership.teamId), // Corrected: camelCase
      ),
      columns: { userId: true }, // Corrected: camelCase
    });
    if (!memberToRemove) {
      return { error: 'Team member not found in this team.' };
    }

    // Use camelCase matching Drizzle schema
    await db.delete(schema.teamMembers).where(
      and(
        eq(schema.teamMembers.userId, memberId), // Corrected: camelCase
        eq(schema.teamMembers.teamId, actorMembership.teamId), // Corrected: camelCase
      ),
    );
    await logActivity(
      actorMembership.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER,
    ); // Pass teamId
    revalidatePath('/team/settings');
    return { success: 'Team member removed successfully.' };
  },
);

// --- Invite Team Member Action ---
const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address').max(64),
  role: z.enum(['member', 'owner']),
});
export const inviteTeamMember = authenticatedAction(
  inviteTeamMemberSchema,
  async (data, user) => {
    const { email, role } = data;
    // Use camelCase matching Drizzle schema
    const inviterMembership = await db.query.teamMembers.findFirst({
      where: eq(schema.teamMembers.userId, user.id), // Corrected: camelCase
      columns: { teamId: true, role: true }, // Corrected: camelCase
    });
    if (!inviterMembership?.teamId) {
      return { error: 'You must be part of a team to invite members.' };
    } // Corrected: camelCase
    if (inviterMembership.role !== 'owner') {
      return { error: 'You do not have permission to invite team members.' };
    }

    // Use camelCase matching Drizzle schema
    const existingMember = await db.query.user.findFirst({
      where: and(eq(schema.user.email, email), isNull(schema.user.deletedAt)),
      with: {
        teamMembers: {
          where: eq(schema.teamMembers.teamId, inviterMembership.teamId), // Corrected: camelCase
          columns: { userId: true }, // Corrected: camelCase
        },
      },
      columns: { id: true },
    });
    if (existingMember && existingMember.teamMembers.length > 0) {
      return {
        error: 'This user is already a member of your team.',
        email,
        role,
      };
    }

    // Use camelCase matching Drizzle schema
    const existingInvitation = await db.query.invitations.findFirst({
      where: and(
        eq(schema.invitations.email, email),
        eq(schema.invitations.teamId, inviterMembership.teamId), // Corrected: camelCase
        eq(schema.invitations.status, 'pending'),
      ),
      columns: { id: true },
    });
    if (existingInvitation) {
      return {
        error:
          'An invitation has already been sent to this email address for this team.',
        email,
        role,
      };
    }

    // Use camelCase matching Drizzle schema
    const newInvitationData: NewInvitation = {
      teamId: inviterMembership.teamId, // Corrected: camelCase
      email: email,
      role: role,
      invitedBy: user.id, // Corrected: camelCase
      status: 'pending',
    };
    const [createdInvitation] = await db
      .insert(schema.invitations)
      .values(newInvitationData)
      .returning();
    if (!createdInvitation) {
      return {
        error: 'Failed to create invitation. Please try again.',
        email,
        role,
      };
    }

    await logActivity(
      inviterMembership.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER,
    ); // Pass teamId
    /* ... TODO: Send email ... */
    revalidatePath('/team/settings');
    return { success: 'Invitation sent successfully.' };
  },
);

// --- Add other actions for designs, webshops, customers, campaigns as needed ---
