// components/Login.tsx (or similar)
'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react'; // Import useEffect
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
// Import the NEW Supabase actions
import { signInWithSupabase, signUpWithSupabase } from './actions'; // Adjust path if needed
import type { ActionState } from './actions'; // Import the state type
import { toast, Toaster } from 'react-hot-toast'; // Import toast

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');

  // Use the correct action based on mode
  const actionToUse = mode === 'signin' ? signInWithSupabase : signUpWithSupabase;

  // Initialize state
  const initialState: ActionState = { error: null, success: null, email: '' };
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    actionToUse,
    initialState
  );

  // Use useEffect to show toasts based on state changes
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      // For signup, show success message, user checks email.
      // For signin, redirect happens in the action, so no toast needed here.
      if (mode === 'signup') {
         toast.success(state.success);
      }
    }
  }, [state, mode]); // Depend on state and mode

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
       <Toaster position="top-right" /> {/* Add Toaster */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* ... header ... */}
         <div className="flex justify-center"> <CircleIcon className="h-12 w-12 text-orange-500" /> </div>
         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
           {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
         </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          {/* Hidden fields */}
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />

          {/* Email Input */}
          <div>
            <Label htmlFor="email" /* ... */ > Email </Label>
            <div className="mt-1">
              <Input id="email" name="email" type="email" required maxLength={64} /* ... */
               // Use defaultValue from state ONLY if there was an error to prefill
               defaultValue={state?.error ? state.email : ''}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <Label htmlFor="password" /* ... */ > Password </Label>
            <div className="mt-1">
              <Input id="password" name="password" type="password" required minLength={8} maxLength={100} /* ... */ />
            </div>
          </div>

          {/* Error Display - Handled by toast now, but can keep as fallback */}
          {/* {state?.error && ( <div className="text-red-500 text-sm">{state.error}</div> )} */}

          {/* Submit Button */}
          <div>
            <Button type="submit" /* ... */ disabled={pending}>
              {pending ? ( <><Loader2 className="animate-spin mr-2 h-4 w-4" />Loading...</> )
               : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </div>
        </form>

         {/* Toggle Link */}
         <div className="mt-6">
           {/* ... divider ... */}
           <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 text-gray-500">{mode === 'signin' ? 'New to our platform?' : 'Already have an account?'}</span></div></div>
           <div className="mt-6">
             <Link href={`${mode === 'signin' ? '/sign-up' : '/login'}?${searchParams.toString()}`} /* Keep existing params */
               className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
             >
               {mode === 'signin' ? 'Create an account' : 'Sign in to existing account'}
             </Link>
           </div>
         </div>
      </div>
    </div>
  );
}