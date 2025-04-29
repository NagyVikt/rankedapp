// /app/(auth)/actions.ts
'use server'; // Ensures all functions here run only on the server

import { z } from 'zod';
// Assuming 'signIn' comes from your NextAuth.js setup (e.g., '@/auth')
// Make sure this path is correct for your project structure.
import { signIn } from './auth';
import { createUser, getUserByEmail } from '@/lib/db/queries';
import { hash } from 'bcrypt';
// Import AuthError from NextAuth if you want specific error handling, otherwise catch general errors
import { AuthError } from 'next-auth';

// --- Schema Definition ---
// Using the same schema for login and register for simplicity here
const authFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  // Using min(6) for registration, adjust if needed
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// --- Login Action State Type ---
// Defines the shape of the state object returned by the 'login' action
export type LoginActionState = {
  status: 'idle' | 'success' | 'failed' | 'invalid_data';
  message?: string; // General message (e.g., error details)
  errors?: { // Field-specific errors from Zod
    email?: string[];
    password?: string[];
  };
};

// --- Register Action State Type --- ADDED THIS
// Defines the shape of the state object returned by the 'register' action
export type RegisterActionState = {
    status: 'idle' | 'success' | 'failed' | 'invalid_data' | 'user_exists';
    message?: string; // General message (e.g., error details or success message)
    errors?: { // Field-specific errors from Zod
        email?: string[];
        password?: string[];
    };
};


// --- Login Action Implementation ---
export const login = async (
  prevState: LoginActionState, // Previous state from useActionState
  formData: FormData
): Promise<LoginActionState> => {
  console.log('Login action invoked'); // Server log
  try {
    // Use a less strict schema for login if needed (e.g., no min length check)
    const loginSchema = z.object({
        email: z.string().email({ message: 'Please enter a valid email.' }),
        password: z.string().min(1, { message: 'Password cannot be empty.' }),
    });
    const validatedFields = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      console.log('Login validation failed:', validatedFields.error.flatten().fieldErrors);
      return {
        status: 'invalid_data',
        message: 'Invalid data received.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validatedFields.data;
    console.log(`Attempting login for email: ${email}`);

    await signIn('credentials', {
        email,
        password,
        redirect: false,
     });

    console.log(`Login successful for email: ${email}`);
     return { status: 'success', message: 'Login successful!' };

  } catch (error) {
     console.error('Login Action Error:', error);
    if (error instanceof AuthError) {
         switch (error.type) {
             case 'CredentialsSignin':
                 return { status: 'failed', message: 'Invalid email or password.' };
             default:
                return { status: 'failed', message: 'Authentication failed. Please try again.' };
         }
    }
    // Rethrow unexpected errors if needed, or return generic failure
    // throw error;
    return { status: 'failed', message: 'An unexpected error occurred during login.' };
  }
};


// --- Register Action (using the new RegisterActionState type) ---
export const register = async (
    prevState: RegisterActionState, // Use the specific type
    formData: FormData
): Promise<RegisterActionState> => { // Return the specific type
    console.log('Register action invoked');
  try {
    // Use the schema with password length check for registration
    const validatedFields = authFormSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
       console.log('Register validation failed:', validatedFields.error.flatten().fieldErrors);
       // Return type matching RegisterActionState
       return { status: 'invalid_data', message: 'Invalid email or password format.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password } = validatedFields.data;
    console.log(`Attempting registration for email: ${email}`);

    const [existing] = await getUserByEmail(email);
    if (existing) {
      console.log(`Registration failed: User exists for email: ${email}`);
      // Return type matching RegisterActionState
      return { status: 'user_exists', message: 'An account with this email already exists.' };
    }

    const hashedPassword = await hash(password, 10);
    // Ensure createUser uses the correct field name (e.g., passwordHash)
    await createUser(email, hashedPassword);
    console.log(`User created successfully for email: ${email}`);

    // Optional: Sign in immediately after registration
    await signIn('credentials', { email, password, redirect: false });
    console.log(`Auto-login after registration successful for email: ${email}`);

    // Return type matching RegisterActionState
    return { status: 'success', message: 'Registration successful!' };

  } catch (err) {
    console.error('Register Action Error:', err);
     if (err instanceof AuthError) {
         // Return type matching RegisterActionState
         return { status: 'failed', message: 'Registration succeeded, but auto-login failed.' };
     }
     // Return type matching RegisterActionState
    return { status: 'failed', message: 'Registration failed. Please try again.' };
  }
};
