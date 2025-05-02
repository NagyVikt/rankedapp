// Ensure this directive is at the very top of the file
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Checkbox, Link, Divider } from '@heroui/react'; // Added Link, Divider
import { Icon } from '@iconify/react';
import toast, { Toaster } from 'react-hot-toast'; // Import toast

export default function LoginPageImproved() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false); // Changed default state behavior slightly
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    // Display a loading toast
    const loadingToastId = toast.loading('Signing in...');

    try {
      // --- Your API Call Logic ---
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ email, password }),
      });
      // --- End API Call Logic ---

      // Dismiss the loading toast
      toast.dismiss(loadingToastId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Login failed. Please try again.' }));
        // Show error toast
        toast.error(errorData?.error || 'Login failed. Invalid credentials.');
      } else {
        // Show success toast
        toast.success('Login successful! Redirecting...');
        // Redirect after a short delay to allow toast visibility
        setTimeout(() => {
          router.push('/chat'); // Or your desired dashboard/protected route
          router.refresh(); // Ensures layout reflects logged-in state if using server components
        }, 1000);
      }
    } catch (error) {
        toast.dismiss(loadingToastId);
        console.error("Login error:", error);
        toast.error('An unexpected error occurred. Please try again.');
    } finally {
        // Ensure loading is set to false even if redirection happens quickly
        // Though state might be lost on redirect anyway
       if (!router.pathname.startsWith('/chat')) { // Basic check to avoid state update post-redirect attempt
         setLoading(false);
       }
    }
  }

  // Placeholder handlers for social logins
  const handleGoogleLogin = () => {
    toast.loading('Redirecting to Google...');
    // Add your Google OAuth redirection logic here
    console.log("Attempting Google login");
     // Example: window.location.href = '/api/auth/google';
  };

  const handleGithubLogin = () => {
    toast.loading('Redirecting to GitHub...');
    // Add your GitHub OAuth redirection logic here
    console.log("Attempting GitHub login");
     // Example: window.location.href = '/api/auth/github';
  };


  return (
    // Provides context for toasts
    <>
      {/* --- Toast Container --- */}
      {/* Position can be adjusted: top-right, bottom-center, etc. */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* --- Main Login Layout --- */}
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-default-100 p-4">
        {/* --- Form Card --- */}
        {/* Using HeroUI styling concepts: rounded, shadow, padding */}
        <div className="flex w-full max-w-md flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-medium">
          {/* --- Header --- */}
          <div className="flex flex-col items-center gap-1 pb-2">
            {/* Optional: Add your logo here */}
            {/* <img src="/logo.png" alt="Acme Corp Logo" className="h-10 w-auto" /> */}
            <h1 className="text-xl font-medium">Welcome Back!</h1>
            <p className="text-small text-default-500">Sign in to continue</p>
          </div>

          {/* --- Login Form --- */}
          {/* Using standard form, can wrap with HeroUI <Form> if needed for specific features */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              isRequired
              label="Email Address"
              name="email"
              placeholder="you@example.com"
              type="email"
              variant="bordered" // Consistent bordered style
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              labelPlacement="outside" // Clearer label positioning
              autoComplete="email"
            />
            <Input
              isRequired
              label="Password"
              name="password"
              placeholder="Enter your password"
              variant="bordered" // Consistent bordered style
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              labelPlacement="outside" // Clearer label positioning
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              endContent={ // Using button for better accessibility & control
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon
                    icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-bold'}
                    className="pointer-events-none text-2xl text-default-400"
                  />
                </button>
              }
            />
            {/* --- Remember Me & Forgot Password --- */}
            <div className="flex items-center justify-between px-1 py-2">
              <Checkbox
                name="remember"
                size="sm"
                isSelected={remember}
                onValueChange={setRemember} // Use onValueChange for HeroUI Checkbox
              >
                Remember me
              </Checkbox>
              <Link href="/forgot-password" size="sm"> {/* Use HeroUI Link */}
                Forgot password?
              </Link>
            </div>

            {/* --- Submit Button --- */}
            <Button
                color="primary"
                type="submit"
                isLoading={loading} // Use HeroUI loading state
                fullWidth // Make button span full width
                size="lg" // Larger button for primary action
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* --- OR Divider --- */}
          <div className="flex items-center gap-4 py-2">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny font-medium text-default-500">OR CONTINUE WITH</p>
            <Divider className="flex-1" />
          </div>

          {/* --- Social Logins --- */}
          <div className="flex flex-col gap-3">
            <Button
              startContent={<Icon icon="flat-color-icons:google" width={24} />}
              variant="bordered" // Consistent bordered style
              fullWidth
              onClick={handleGoogleLogin}
              isDisabled={loading} // Disable while main login is processing
            >
              Continue with Google
            </Button>
            <Button
              startContent={<Icon className="text-default-700" icon="fe:github" width={24} />} // Adjusted icon color
              variant="bordered" // Consistent bordered style
              fullWidth
              onClick={handleGithubLogin}
              isDisabled={loading} // Disable while main login is processing
            >
              Continue with Github
            </Button>
          </div>

          {/* --- Sign Up Link --- */}
          <p className="mt-4 text-center text-small">
            Need an account?&nbsp;
            <Link href="/register" size="sm" className="font-medium"> {/* Use HeroUI Link */}
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}