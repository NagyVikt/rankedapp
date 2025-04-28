'use node';

import { z } from 'zod';

import { createUser, getUserByEmail } from '@/lib/db/queries';
import { hash } from 'bcrypt';              // ← bcrypt, not bcryptjs
import { signIn } from './auth';

const authFormSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const register = async (_: any, formData: FormData) => {
  try {
    const { email, password } = authFormSchema.parse({
      email:    formData.get('email'),
      password: formData.get('password'),
    });

    // 1) fetch array and destructure
    const [existing] = await getUserByEmail(email);
    if (existing) {
      return { status: 'user_exists' };
    }

    // 2) hash with real bcrypt
    const hashedPassword = await hash(password, 10);

    // 3) store and sign in
    await createUser(email, hashedPassword);
    await signIn('credentials', { email, password, redirect: false });

    return { status: 'success' };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};
