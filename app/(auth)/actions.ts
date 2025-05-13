// app/(auth)/actions.ts
'use server';

import { z } from 'zod';
import { createUser, getUser } from '@/lib/db/queries';
import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    // Validate FormData entries are strings
    const emailRaw = formData.get('email');
    const passwordRaw = formData.get('password');
    if (typeof emailRaw !== 'string' || typeof passwordRaw !== 'string') {
      return { status: 'invalid_data' };
    }

    // Now parse with Zod
    const validatedData = authFormSchema.parse({
      email: emailRaw,
      password: passwordRaw,
    });

    // Lookup by email
    const user = await getUser(validatedData.email);
    if (user) {
      return { status: 'user_exists' };
    }

    // Create and then sign in
    await createUser(validatedData.email, validatedData.password);
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};
