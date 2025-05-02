'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import {
  Input,
  Button,
  Checkbox,
  Alert,
} from '@heroui/react';  
import { Icon } from '@iconify/react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPassword, setShowPwd]  = useState(false);
  const [showConfirm, setShowCnf]   = useState(false);
  const [agree, setAgree]           = useState(false);
  const [errorMessage, setError]    = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match'); 
      return;
    }
    if (!agree) {
      setError('You must agree to Terms & Privacy');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabaseBrowser.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
          Create an Account

        {errorMessage && (
          <Alert severity="error" onClose={() => setError(null)}>
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
            endContent={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1"
              >
                <Icon
                  icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                  className="text-lg text-gray-500"
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
            endContent={
              <button
                type="button"
                onClick={() => setShowCnf((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="p-1"
              >
                <Icon
                  icon={showConfirm ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                  className="text-lg text-gray-500"
                />
              </button>
            }
          />

          <Checkbox
            isRequired
            isSelected={agree}
            onChange={(val) => setAgree(val)}
            size="sm"
          >
            I agree to the{' '}
            <a href="/terms" className="font-medium text-primary-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-primary-600 hover:underline">
              Privacy Policy
            </a>
          </Checkbox>

          <Button disabled={loading} fullWidth size="lg" type="submit">
            {loading ? 'Creating Account…' : 'Sign Up'}
          </Button>
        </form>

          Already have an account?{' '}
          <a href="/login" className="font-medium text-primary-600 hover:underline">
            Log In
          </a>
      </div>
    </div>
  );
}
