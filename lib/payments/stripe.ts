import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription
} from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});
// --- ADD THIS INTERFACE DEFINITION ---
interface GetStripePricesParams extends Stripe.PriceListParams {
  active?: boolean;
  type?: 'recurring' | 'one_time';
  currency?: string;
  // Add other valid Stripe.PriceListParams properties if needed
}

// --- Optional: Define interface for getStripeProducts params ---
interface GetStripeProductsParams extends Stripe.ProductListParams {
  active?: boolean;
  // Add other valid Stripe.ProductListParams properties if needed
}

export async function createCheckoutSession({
  team,
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
    }
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other',
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: (plan?.product as Stripe.Product).name,
      subscriptionStatus: status
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status
    });
  }
}


// --- FIX: Modify getStripeProducts to accept parameters ---
export const getStripeProducts = async ( // Change to accept params
  params: GetStripeProductsParams = {}  // Add parameter with default
): Promise< // Add explicit Promise return type
  {
    id: string;
    name: string;
    description: string | null;
    defaultPriceId: string | null | undefined;
  }[]
> => { // Use arrow function for consistency if desired
  try { // Add try...catch
    const listParams: Stripe.ProductListParams = {
      ...params, // Spread incoming parameters
      // Keep expand separate if needed, or allow override via params
      expand: ['data.default_price', ...(params.expand || [])],
    };

    const products = await stripe.products.list(listParams);

    return products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      defaultPriceId:
        typeof product.default_price === 'string'
          ? product.default_price
          : (product.default_price as Stripe.Price | null)?.id ?? null, // Keep robust handling
    }));
  } catch (error) {
    console.error("Error fetching Stripe products:", error);
    return [];
  }
};
// --- End of modified function ---



// --- FIX: Modify getStripePrices to accept parameters ---
export const getStripePrices = async ( // Changed back to accept params
  params: GetStripePricesParams = {}  // Added parameter with default
): Promise< // Added explicit Promise return type (good practice)
  {
    id: string;
    productId: string;
    // Include other properties from your mapping below if needed for type safety
    unitAmount: number | null;
    currency: string;
    interval: Stripe.Price.Recurring.Interval | undefined;
    trialPeriodDays: number | null;
    // Add product name/description if mapping includes them
    productName?: string;
    productDescription?: string | null;
  }[]
> => { // Added arrow function syntax for consistency if preferred
  try { // Added try...catch block (good practice)
    // Combine passed params with mandatory expand
    const listParams: Stripe.PriceListParams = {
      ...params, // Spread the incoming parameters
      expand: ['data.product'], // Ensure product data is always expanded
    };
    // Use the combined listParams
    const prices = await stripe.prices.list(listParams);

    return prices.data.map((price) => {
      // Type guard for expanded product
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        productId: product.id, // Use expanded product ID
        productName: product.name, // Get name from expanded product
        productDescription: product.description, // Get description
        unitAmount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        trialPeriodDays: price.recurring?.trial_period_days ?? null, // Use nullish coalescing
      };
    });
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    return []; // Return empty array on error
  }
};
// --- En