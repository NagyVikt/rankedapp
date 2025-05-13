'use client';

import React from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/stripe/button';
import { Input } from '@/components/stripe/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/stripe/label';
import { Lock, Trash2, Loader2 } from 'lucide-react';
import { updatePassword, deleteAccount } from '@/app/(login)/actions';

// 1) Discriminated union for the password‐update form
type PasswordState =
  | {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      error: string;
      success?: never;
    }
  | {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      success: string;
      error?: never;
    };

// 2) Single‐variant for delete: only an error can be surfaced here
type DeleteState = {
  password?: string;
  error: string;
};

export default function SecurityPage() {
  // 3) Hook into the password‐update action
  const [passwordState, passwordAction, isPasswordPending] =
    useActionState<PasswordState, FormData>(
      updatePassword,
      { currentPassword: '', newPassword: '', confirmPassword: '', error: '' }
    );

  // 4) Hook into the delete‐account action
  const [deleteState, deleteAction, isDeletePending] =
    useActionState<DeleteState, FormData>(
      deleteAccount,
      { password: '', error: '' }
    );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Security Settings
      </h1>

      {/* --- Update Password --- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={passwordAction}>
            <div>
              <Label htmlFor="current-password" className="mb-2">
                Current Password
              </Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.currentPassword}
              />
            </div>

            <div>
              <Label htmlFor="new-password" className="mb-2">
                New Password
              </Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.newPassword}
              />
            </div>

            <div>
              <Label htmlFor="confirm-password" className="mb-2">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.confirmPassword}
              />
            </div>

            {passwordState.error && (
              <p className="text-red-500 text-sm">{passwordState.error}</p>
            )}
            {passwordState.success && (
              <p className="text-green-500 text-sm">{passwordState.success}</p>
            )}

            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- Delete Account --- */}
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Account deletion is non-reversible. Please proceed with caution.
          </p>

          <form action={deleteAction} className="space-y-4">
            <div>
              <Label htmlFor="delete-password" className="mb-2">
                Confirm Password
              </Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={deleteState.password}
              />
            </div>

            {deleteState.error && (
              <p className="text-red-500 text-sm">{deleteState.error}</p>
            )}

            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
