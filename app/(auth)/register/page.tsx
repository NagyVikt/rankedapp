'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser'; // Assuming this is correctly configured
import {
  Input,
  Button,
  Checkbox,
  Alert, // Assuming Alert is correctly imported from @heroui/react
} from '@heroui/react';
import { Icon } from '@iconify/react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPwd] = useState(false);
  const [showConfirm, setShowCnf] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errorMessage, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!email || !password || !confirm) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!agree) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setLoading(true);

    const { error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      // You can add options here if needed, e.g., for redirect or user metadata
      // options: {
      //   emailRedirectTo: `${window.location.origin}/auth/callback`,
      // }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Optionally, you can show a success message or redirect with a query param
      // For example, redirect to login with a message to check email for verification
      router.push(
        '/login?message=Registration successful! Please check your email to verify your account.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-6 sm:p-8 shadow-lg dark:bg-gray-800">
        <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          Create an Account
        </h1>

        {errorMessage && (
          // Corrected: Using 'color' prop instead of 'severity' for HeroUI Alert (common pattern)
          // If 'color' is not the correct prop for HeroUI, please check its documentation.
          <Alert color="danger" onClose={() => setError(null)} className="mb-4">
            {errorMessage}
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            labelPlacement="outside"
            variant="bordered"
            autoComplete="email"
            className="dark:text-white" // Example for dark mode text if needed
          />

          <Input
            isRequired
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            labelPlacement="outside"
            variant="bordered"
            autoComplete="new-password"
            endContent={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icon
                  icon={
                    showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'
                  }
                  className="text-lg"
                />
              </button>
            }
          />

          <Input
            isRequired
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            labelPlacement="outside"
            variant="bordered"
            autoComplete="new-password"
            endContent={
              <button
                type="button"
                onClick={() => setShowCnf((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icon
                  icon={
                    showConfirm ? 'solar:eye-closed-bold' : 'solar:eye-bold'
                  }
                  className="text-lg"
                />
              </button>
            }
          />

          <Checkbox
            isRequired
            isSelected={agree}
            // Corrected: Using 'onValueChange' which typically passes the boolean value directly
            onValueChange={(isSelected) => setAgree(isSelected)}
            size="sm"
            className="dark:text-gray-300"
          >
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Privacy Policy
            </a>
          </Checkbox>

          <Button
            color="primary" // Added color for better styling
            disabled={loading}
            fullWidth
            size="lg"
            type="submit"
            className="text-white" // Ensure button text is visible
          >
            {loading ? 'Creating Account…' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
