'use server';

import { z } from 'zod';
// Import isNull and ne operators from drizzle
import { and, eq, sql, isNull, ne } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType, // Assuming SET_PIN will be added here
  invitations,
  // Explicitly import Team type if needed
  type Team
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
// Assuming getUserWithTeam returns something like: { user: User; teamId: number | null; role: string | null; team: Team | null }
// Adjust the import and usage based on the actual definition in queries.ts
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

// Helper function to log user activity
async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType, // Ensure ActivityType enum includes SET_PIN
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  try {
    const newActivity: NewActivityLog = {
      teamId,
      userId,
      action: type,
      ipAddress: ipAddress || ''
    };
    await db.insert(activityLogs).values(newActivity);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// --- Sign In Action ---
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams // Select the whole team object
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    // Use isNull to check for deletedAt
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (userWithTeam.length === 0) {
    return { error: 'Invalid email or password. Please try again.', email };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return { error: 'Invalid email or password. Please try again.', email };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout' && foundTeam) {
    const priceId = formData.get('priceId') as string;
    if (!priceId) {
        console.error("Checkout redirect requested without priceId");
        redirect('/dashboard');
    } else {
        // Pass the actual team object if required by createCheckoutSession
        return createCheckoutSession({ team: foundTeam, priceId });
    }
  }

  redirect('/dashboard');
});

// --- Sign Up Action ---
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    // Use isNull to check for deletedAt
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: 'An account with this email already exists.', email };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = { email, passwordHash, role: 'owner' };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return { error: 'Failed to create user. Please try again.', email };
  }

  let teamId: number;
  let userRole: string = 'owner';
  let createdTeam: typeof teams.$inferSelect | null = null;
  let teamName: string = `${email}'s Team`;

  if (inviteId) {
    const parsedInviteId = parseInt(inviteId, 10);
    if (isNaN(parsedInviteId)) {
        return { error: 'Invalid invitation ID format.', email };
    }

    const [invitation] = await db
      .select()
      .from(invitations)
      .where( and( eq(invitations.id, parsedInviteId), eq(invitations.email, email), eq(invitations.status, 'pending') ))
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await Promise.all([
          db.update(invitations).set({ status: 'accepted' }).where(eq(invitations.id, invitation.id)),
          db.update(users).set({ role: userRole }).where(eq(users.id, createdUser.id)),
          logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION)
      ]);

      [createdTeam] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
      if (!createdTeam) {
          console.error(`Team with ID ${teamId} not found for accepted invitation ${inviteId}`);
          return { error: 'Associated team not found. Please contact support.', email };
      }
      teamName = createdTeam.name;

    } else {
      return { error: 'Invalid or expired invitation.', email };
    }
  } else {
    const newTeam: NewTeam = { name: teamName };
    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
        await db.delete(users).where(eq(users.id, createdUser.id));
        return { error: 'Failed to create team. Please try again.', email };
    }
    teamId = createdTeam.id;
    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = { userId: createdUser.id, teamId: teamId, role: userRole };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout' && createdTeam) {
    const priceId = formData.get('priceId') as string;
     if (!priceId) {
        console.error("Checkout redirect requested without priceId during signup");
        redirect('/dashboard');
    } else {
       return createCheckoutSession({ team: createdTeam, priceId });
    }
  }

  redirect('/dashboard');
});

// --- Sign Out Action ---
export async function signOut() {
  try {
    const user = await getUser()
    if (user) {
      const userWithTeam = await getUserWithTeam(user.id)
      await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT)
    }
  } catch (error) {
    console.error("Error fetching user or logging sign-out:", error)
  } finally {
    // await cookies() to get the mutable RequestCookies object …
    const cookieStore = await cookies()
    // … then delete your session cookie
    cookieStore.delete('session')
    // and finally redirect
    redirect('/sign-in')
  }
}

// --- Update Password Action ---
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password is too short").max(100),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
  confirmPassword: z.string().min(8).max(100)
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password do not match.",
    path: ["confirmPassword"],
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords( currentPassword, user.passwordHash );
    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return { error: 'New password must be different from the current password.' };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return { success: 'Password updated successfully.' };
  }
);

// --- Delete Account Action ---
const deleteAccountSchema = z.object({
  password: z.string().min(8, "Password is required").max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(userWithTeam?.teamId, user.id, ActivityType.DELETE_ACCOUNT);

    await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({
            deletedAt: sql`CURRENT_TIMESTAMP`,
            email: sql`CONCAT(${users.email}, '-${user.id}-deleted')`
          })
          .where(eq(users.id, user.id));

        if (userWithTeam?.teamId) {
          await tx
            .delete(teamMembers)
            .where( and( eq(teamMembers.userId, user.id), eq(teamMembers.teamId, userWithTeam.teamId) ));
        }
    });
    const cookieStore = await cookies()
    // Correct: Call delete directly on cookies()
    cookieStore.delete('session')
    redirect('/sign-in?message=Account+deleted+successfully');
  }
);

// --- Update Account (Name/Email) Action ---
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).trim(),
  email: z.string().email('Invalid email address').max(255)
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    if (email !== user.email) {
        const existingUser = await db.select({ id: users.id })
            .from(users)
            // Fix: Use ne operator instead of == false
            .where(and(eq(users.email, email), isNull(users.deletedAt), ne(users.id, user.id)))
            .limit(1);
        if (existingUser.length > 0) {
            return { name, email, error: 'This email address is already in use.' };
        }
    }

    const userWithTeam = await getUserWithTeam(user.id);
    const needsReverification = email !== user.email;

    await Promise.all([
      db.update(users).set({
          name,
          email,
          // Fix: Ensure 'emailVerified' column exists in your Drizzle schema (schema.ts)
          // If the column name is different (e.g., email_verified), update it here.
          emailVerified: needsReverification ? null : user.emailVerified
       }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    // TODO: Trigger email verification if needsReverification is true

    return { name, email, success: 'Account updated successfully.' };
  }
);


// --- Set Account PIN Action ---
const setPinSchema = z.object({
    pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d{4}$/, "PIN must contain only digits"),
});

export const setAccountPin = validatedActionWithUser(
    setPinSchema,
    async (data, _, user) => {
        const { pin } = data;

        try {
            const pinHash = await hashPassword(pin);
            const userWithTeam = await getUserWithTeam(user.id);

            await Promise.all([
                db.update(users).set({
                    // Ensure these column names match your schema exactly in schema.ts
                    pinHash: pinHash,
                    isPinSet: true
                }).where(eq(users.id, user.id)),
                logActivity(userWithTeam?.teamId, user.id, ActivityType.SET_PIN) // Ensure SET_PIN exists in ActivityType
            ]);

            return { success: 'PIN set successfully.' };

        } catch (error) {
            console.error("Error setting PIN:", error);
            return { error: 'Failed to set PIN. Please try again.' };
        }
    }
);


// --- Remove Team Member Action ---
const removeTeamMemberSchema = z.object({
  memberId: z.number().int().positive("Invalid member ID")
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) { return { error: 'You are not part of a team.' }; }
    if (memberId === user.id) { return { error: 'You cannot remove yourself from the team using this option.' }; }
    if (userWithTeam.user.role !== 'owner') {
      return { error: 'You do not have permission to remove team members.' };
    }
    
    const memberToRemove = await db.select({ id: teamMembers.userId })
        .from(teamMembers)
        .where(and(eq(teamMembers.userId, memberId), eq(teamMembers.teamId, userWithTeam.teamId)))
        .limit(1);
    if (memberToRemove.length === 0) { return { error: 'Team member not found in this team.' }; }

    await db.delete(teamMembers).where( and( eq(teamMembers.userId, memberId), eq(teamMembers.teamId, userWithTeam.teamId) ));
    await logActivity(userWithTeam.teamId, user.id, ActivityType.REMOVE_TEAM_MEMBER);

    return { success: 'Team member removed successfully.' };
  }
);

// --- Invite Team Member Action ---
const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) { return { error: 'You must be part of a team to invite members.' }; }
    if (userWithTeam.user.role !== 'owner') {
      return { error: 'You do not have permission to remove team members.' };
    }
    
    const existingMember = await db
      .select({ id: users.id })
      .from(users)
      .innerJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where( and( eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId), isNull(users.deletedAt) )) // Use isNull
      .limit(1);
    if (existingMember.length > 0) { return { error: 'This user is already a member of your team.', email, role }; }

    const existingInvitation = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where( and( eq(invitations.email, email), eq(invitations.teamId, userWithTeam.teamId), eq(invitations.status, 'pending') ))
      .limit(1);
    if (existingInvitation.length > 0) { return { error: 'An invitation has already been sent to this email address.', email, role }; }

    const [newInvitation] = await db.insert(invitations).values({
      teamId: userWithTeam.teamId, email, role, invitedBy: user.id, status: 'pending'
    }).returning();
    if (!newInvitation) { return { error: 'Failed to create invitation. Please try again.', email, role }; }

    await logActivity(userWithTeam.teamId, user.id, ActivityType.INVITE_TEAM_MEMBER);

    // TODO: Implement Email Sending
    // const teamNameForEmail = userWithTeam.team?.name ?? 'your team'; // Ensure userWithTeam includes team object if needed
    // console.log(`TODO: Send invitation email to ${email} for team ${teamNameForEmail} with role ${role}`);

    return { success: 'Invitation sent successfully.' };
  }
);
