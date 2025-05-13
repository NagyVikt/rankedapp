'use server';

import { redirect } from 'next/navigation';
// Assuming stripe_integration_ts is compiled to ./stripe.js or similar
// and provides createCheckoutSession and createCustomerPortalSession
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';
import { getAuthenticatedUser } from '@/lib/db/queries'; // Import function to get the current user
import type { TeamDataWithMembers, User } from '@/lib/db/queries'; // Import types if needed for clarity

export const checkoutAction = withTeam(
  async (
    formData: FormData,
    team: TeamDataWithMembers, // Type provided by withTeam
  ) => {
    const priceId = formData.get('priceId') as string;

    // Get the currently authenticated user
    const user: User | null = await getAuthenticatedUser();

    if (!user || !user.email) {
      // Handle cases where the user is not found or email is missing
      console.error('Authenticated user or user email not found for checkout.');
      // Redirect to login or an error page, as appropriate
      // For example, redirect to login if user is null, or an error page if email is missing.
      redirect('/login?error=authentication_required_for_checkout'); // Or a more generic error page
      return; // Stop execution
    }

    if (!priceId) {
      console.error('Price ID is missing from form data.');
      // Redirect or handle error appropriately
      redirect('/pricing?error=missing_price_id');
      return;
    }

    // Now call createCheckoutSession with the required userEmail
    // The 'team' object from withTeam is TeamDataWithMembers.
    // createCheckoutSession expects 'Team | null'.
    // This is generally fine if TeamDataWithMembers extends Team (which it should based on your queries).
    await createCheckoutSession({
      team: team, // team is TeamDataWithMembers, which should be assignable to Team
      priceId: priceId,
      userEmail: user.email, // Provide the user's email
    });
    // createCheckoutSession handles its own redirect, so no redirect here typically unless it throws an error
    // that you want to catch and handle with a redirect.
  },
);

export const customerPortalAction = withTeam(
  async (
    _: FormData, // FormData might not be used here, hence '_'
    team: TeamDataWithMembers, // Type provided by withTeam
  ) => {
    // The 'team' object from withTeam is TeamDataWithMembers.
    // createCustomerPortalSession expects 'Team'.
    // This is fine if TeamDataWithMembers extends Team.
    const portalSession = await createCustomerPortalSession(team);

    if (portalSession && portalSession.url) {
      redirect(portalSession.url);
    } else {
      // Handle cases where portal session or URL is not created
      console.error(
        'Failed to create customer portal session or URL is missing.',
      );
      redirect('/dashboard?error=portal_creation_failed'); // Redirect to dashboard or an error page
    }
  },
);
