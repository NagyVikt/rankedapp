// form-actions.ts
import { z } from 'zod';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
// Updated to import getCurrentUser and getUserByEmail (if needed elsewhere)
// and getTeamForUser (assuming it also uses getCurrentUser or similar)
import { getTeamForUser, getCurrentUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      // It's good practice to ensure the return type T can accommodate an error structure
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User, // Expecting a User object
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    // Call the new function to get the current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      // Handle cases where user is not authenticated or not found
      // Depending on T, this might need to return an error object or throw
      // For now, throwing an error as in the original code.
      // Consider returning { error: 'User is not authenticated' } as T;
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData, user);
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers, // Expecting TeamDataWithMembers
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    // Call the new function to get the current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      // If no user, redirect to sign-in page
      redirect('/sign-in'); // Make sure redirect is correctly handled in your environment
    }

    // getTeamForUser likely depends on the current user's ID,
    // so it should internally use getCurrentUser or be passed the user/userId.
    // Assuming getTeamForUser is refactored to work with the current user context.
    const team = await getTeamForUser(); // Or: await getTeamForUser(user.id);
    if (!team) {
      // Handle team not found case
      // Consider returning { error: 'Team not found' } as T or a custom error page
      throw new Error('Team not found for the current user.');
    }

    return action(formData, team);
  };
}
