'use client';

import React, { useActionState, Suspense } from 'react';
import { Button } from '@/components/stripe/button'; // Assuming these are correct paths
import { Input } from '@/components/stripe/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/stripe/card';
import { Label } from '@/components/stripe/label';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions'; // Assuming this is your server action
import { User } from '@/lib/db/schema'; // Assuming this is your User type
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Discriminated union for error vs success states
export type ActionState =
  | { name: string; email: string; error: string; success?: never }
  | { name: string; email: string; success: string; error?: never };

// Simple form component: displays name/email inputs
function AccountForm({
  state,
  nameInitialValue = '',
  emailInitialValue = '',
}: {
  state: ActionState;
  nameInitialValue?: string;
  emailInitialValue?: string;
}) {
  return (
    <>
      <div>
        <Label htmlFor="name" className="mb-2 block">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          defaultValue={state.name || nameInitialValue}
          required
          className="w-full rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={state.email || emailInitialValue}
          required
          className="w-full rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
        />
      </div>
    </>
  );
}

// Suspense wrapper to load existing user data
function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user, isLoading } = useSWR<User>('/api/user', fetcher);

  if (isLoading && !user) {
    return (
      <>
        <div>
          <Label htmlFor="name" className="mb-2 block">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={state.name}
            disabled
            placeholder="Loading name..."
            className="w-full rounded-md"
          />
        </div>
        <div>
          <Label htmlFor="email" className="mb-2 block">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={state.email}
            disabled
            placeholder="Loading email..."
            className="w-full rounded-md"
          />
        </div>
      </>
    );
  }

  return (
    <AccountForm
      state={state}
      nameInitialValue={user?.name ?? ''}
      emailInitialValue={user?.email ?? ''}
    />
  );
}

export default function GeneralPage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  // Initial state matches the "error" variant with empty string
  const initialActionState: ActionState = React.useMemo(
    () => ({
      name: user?.name ?? '',
      email: user?.email ?? '',
      error: '',
    }),
    [user?.name, user?.email],
  );

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    initialActionState,
  );

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50 dark:bg-neutral-900">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-neutral-100 mb-6">
        General Settings
      </h1>

      <Card className="max-w-2xl mx-auto bg-white dark:bg-neutral-800 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-neutral-200">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" action={formAction}>
            <Suspense
              fallback={
                <AccountForm
                  state={state}
                  nameInitialValue={initialActionState.name}
                  emailInitialValue={initialActionState.email}
                />
              }
            >
              <AccountFormWithData state={state} />
            </Suspense>

            {state.error && (
              <p className="text-red-500 text-sm px-1 py-2 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-700">
                {state.error}
              </p>
            )}
            {state.success && (
              <p className="text-green-600 text-sm px-1 py-2 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-700">
                {state.success}
              </p>
            )}

            <Button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
