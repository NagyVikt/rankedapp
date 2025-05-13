import Stripe from 'stripe';
import { redirect } from 'next/navigation';

// Import actual types and functions from your queries module
// Assuming your queries.ts file is located at '@/lib/db/queries'
// and it exports the necessary types and functions.
// TS ERROR FIX: Ensure 'User' and 'Team' are EXPORTED from '@/lib/db/queries'.
// Example in queries.ts:
// export type User = typeof schema.user.$inferSelect;
// export type Team = typeof schema.teams.$inferSelect;
import {
  type User, // Drizzle's SELECT type: typeof schema.user.$inferSelect
  type Team, // Drizzle's SELECT type: typeof schema.teams.$inferSelect
  getUser,
  getTeamByStripeCustomerId,
  updateTeamSubscription,
} from '@/lib/db/queries'; // Adjust path as per your project structure

// Note: The authFormSchema placeholder and its example usage have been removed.
// It's assumed that form validation and obtaining user email for functions like
// createCheckoutSession are handled upstream.

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // Ensure this API version is compatible with your Stripe SDK version
});

// --- INTERFACE DEFINITIONS FOR STRIPE PARAMS ---
interface GetStripePricesParams extends Stripe.PriceListParams {
  active?: boolean;
  type?: 'recurring' | 'one_time';
  currency?: string;
}

interface GetStripeProductsParams extends Stripe.ProductListParams {
  active?: boolean;
}

export async function createCheckoutSession({
  team,
  priceId,
  userEmail,
}: {
  team: Team | null; // Using imported Team type (ensure it's exported from queries.ts)
  priceId: string;
  userEmail: string; // Email is passed directly
}) {
  const user = await getUser(userEmail); // Using imported getUser
  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
    return;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id, // user.id from queries.ts is string (UUID)
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
    },
  });

  if (session.url) {
    redirect(session.url);
  } else {
    console.error('Stripe session URL not found.');
    redirect('/error?message=stripe_session_failed');
  }
}

export async function createCustomerPortalSession(team: Team) {
  // Using imported Team type
  if (!team.stripeCustomerId || !team.stripeProductId) {
    console.warn(
      `Stripe customer ID or product ID missing for team ${team.id}. Redirecting to pricing.`,
    );
    redirect('/pricing');
    return;
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 1,
  });

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    // Ensure team.stripeProductId is not null or undefined before retrieving
    if (!team.stripeProductId) {
      console.error(`Team ${team.id} does not have a Stripe Product ID.`);
      throw new Error("Team's product ID is missing. Please contact support.");
    }
    const product = await stripe.products.retrieve(team.stripeProductId);

    // Check if product is deleted
    if (product.deleted) {
      console.error(
        `Team's product ${team.stripeProductId} has been deleted in Stripe for team ${team.id}.`,
      );
      throw new Error(
        "Team's product has been deleted in Stripe. Please contact support.",
      );
    }
    if (!product.active) {
      console.error(
        `Team's product ${team.stripeProductId} is not active in Stripe for team ${team.id}.`,
      );
      throw new Error(
        "Team's product is not active in Stripe. Please contact support.",
      );
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    if (prices.data.length === 0) {
      console.error(
        `No active prices found for product ${product.id} (team ${team.id}).`,
      );
      throw new Error(
        "No active prices found for the team's product. Please contact support.",
      );
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription',
      },
      features: {
        invoice_history: { enabled: true },
        customer_update: {
          enabled: true,
          allowed_updates: [
            'email',
            'name',
            'phone',
            'address',
            'shipping',
            'tax_id',
          ],
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id),
            },
          ],
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
              'customer_service',
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
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  // Using imported getTeamByStripeCustomerId
  const team = await getTeamByStripeCustomerId(customerId);
  if (!team) {
    console.error(
      'Team not found for Stripe customer ID:',
      customerId,
      'during subscription change.',
    );
    return;
  }

  const planItem = subscription.items.data[0]?.plan;

  if (!planItem || !planItem.product) {
    console.error(
      'Subscription item, plan, or product ID is missing in the subscription object:',
      subscriptionId,
    );
    // team.id from queries.ts is expected to be a number
    await updateTeamSubscription(team.id, {
      subscriptionStatus: 'error_missing_plan_details',
      stripeSubscriptionId: subscriptionId,
    });
    return;
  }

  // Robustly handle product ID and name, checking for deleted products
  const productObject = planItem.product; // Type: string | Stripe.Product | Stripe.DeletedProduct | null
  let productId: string | null = null;
  let productName: string | null = 'Unknown Plan';

  if (typeof productObject === 'string') {
    productId = productObject;
    console.warn(
      `Product details for ${productId} (ID only) were not expanded. Product name might be missing or require separate fetch.`,
    );
  } else if (productObject && 'object' in productObject && productObject.id) {
    // Check if productObject is an object and has an id
    productId = productObject.id; // Common property for Product and DeletedProduct
    if (productObject.object === 'product' && !productObject.deleted) {
      // It's an expanded, non-deleted Stripe.Product
      const fullProduct = productObject as Stripe.Product;
      productName = fullProduct.name;
    } else if (productObject.deleted) {
      // It's a DeletedProduct
      productName = 'Deleted Product';
      console.warn(
        `Associated product ${productId} has been deleted in Stripe.`,
      );
    } else if (productObject.object !== 'product') {
      // Product object is not a recognized type or missing 'name'
      console.warn(
        `Product object for ${productId} is of type ${productObject.object}, not 'product', or 'name' is missing.`,
      );
    }
  } else {
    console.error(
      'Product information is missing or in an unexpected format in subscription item plan.',
    );
  }

  if (!productId) {
    console.error(
      'Could not determine product ID for subscription item:',
      planItem.id,
    );
    await updateTeamSubscription(team.id, {
      subscriptionStatus: 'error_missing_product_id',
      stripeSubscriptionId: subscriptionId,
    });
    return;
  }

  // TS ERROR NOTE: If 'Property 'current_period_end' does not exist on type 'Subscription'.ts(2339)' persists:
  // 1. Ensure your 'stripe' npm package is up-to-date (e.g., `npm install stripe@latest`).
  // 2. Verify that your TypeScript version and Stripe SDK types are compatible.
  // This property IS standard on Stripe.Subscription.
  // const currentPeriodEnd = new Date(subscription.currentPeriodEnd * 1000);
  // const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  if (status === 'active' || status === 'trialing') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId,
      planName: productName,
      subscriptionStatus: status,
      // To store currentPeriodEnd and trialEnd in your DB,
      // you'll need to ensure your 'Team' type and 'updateTeamSubscription' function
      // in 'queries.ts' support these fields (e.g., add them to the Partial<Pick<Team, ...>>).
      // Example (if you add these to your Team schema & updateTeamSubscription):
      // currentPeriodEnd: currentPeriodEnd,
      // trialEnd: trialEnd,
    });
  } else {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status,
      // currentPeriodEnd: currentPeriodEnd, // Same as above if you want to store this for inactive subs
    });
  }
}

export const getStripeProducts = async (
  params: GetStripeProductsParams = {},
): Promise<
  {
    id: string;
    name: string;
    description: string | null;
    defaultPriceId: string | null | undefined;
    active: boolean;
    images: string[];
    metadata: Stripe.Metadata;
  }[]
> => {
  try {
    const listParams: Stripe.ProductListParams = {
      active: true,
      ...params,
      expand: ['data.default_price', ...(params.expand || [])],
    };
    const products = await stripe.products.list(listParams);

    return products.data
      .filter((product) => !product.deleted) // Ensure we don't process deleted products
      .map((product) => {
        // After filtering out deleted products, we can safely cast to Stripe.Product
        const fullProduct = product as Stripe.Product;
        return {
          id: fullProduct.id,
          name: fullProduct.name, // This should now be safe
          description: fullProduct.description,
          active: fullProduct.active,
          images: fullProduct.images,
          metadata: fullProduct.metadata,
          defaultPriceId:
            typeof fullProduct.default_price === 'string'
              ? fullProduct.default_price
              : ((fullProduct.default_price as Stripe.Price | null)?.id ??
                undefined),
        };
      });
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return [];
  }
};

export const getStripePrices = async (
  params: GetStripePricesParams = {},
): Promise<
  {
    id: string;
    productId: string;
    productName?: string;
    productDescription?: string | null;
    active: boolean;
    unitAmount: number | null;
    currency: string;
    type: Stripe.Price.Type;
    interval?: Stripe.Price.Recurring.Interval;
    intervalCount?: number;
    trialPeriodDays: number | null;
    metadata: Stripe.Metadata;
  }[]
> => {
  try {
    const listParams: Stripe.PriceListParams = {
      active: true,
      ...params,
      expand: ['data.product', ...(params.expand || [])],
    };
    const prices = await stripe.prices.list(listParams);

    return prices.data
      .map((price) => {
        const productDetails = price.product as
          | Stripe.Product
          | Stripe.DeletedProduct
          | null;
        let productName: string | undefined;
        let productDescription: string | null | undefined;
        let productId: string = 'unknown_product'; // Default value

        if (productDetails && 'id' in productDetails) {
          // Check if productDetails is not null and has an id
          productId = productDetails.id; // Common property
          if (productDetails.object === 'product' && !productDetails.deleted) {
            const fullProduct = productDetails as Stripe.Product;
            productName = fullProduct.name;
            productDescription = fullProduct.description;
          } else if (productDetails.deleted) {
            productName = 'Deleted Product';
            console.warn(
              `Price ${price.id} is associated with a deleted product ${productDetails.id}`,
            );
          } else if (productDetails.object !== 'product') {
            console.warn(
              `Price ${price.id} has an associated product object of type '${productDetails.object}' instead of 'product'.`,
            );
          }
        } else if (typeof price.product === 'string') {
          // Product is not expanded, only ID is available
          productId = price.product;
          console.warn(
            `Product for price ${price.id} was not expanded. Name/description will be missing.`,
          );
        } else if (price.product === null) {
          console.warn(`Price ${price.id} has a null product field.`);
        } else {
          console.warn(
            `Price ${price.id} is missing product information or product ID in an unexpected format.`,
          );
        }

        return {
          id: price.id,
          productId: productId,
          productName: productName,
          productDescription: productDescription,
          active: price.active,
          unitAmount: price.unit_amount,
          currency: price.currency,
          type: price.type,
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
          trialPeriodDays: price.recurring?.trial_period_days ?? null,
          metadata: price.metadata,
        };
      })
      .filter((priceInfo) => priceInfo.productId !== 'unknown_product'); // Filter out entries where productId couldn't be determined
  } catch (error) {
    console.error('Error fetching Stripe prices:', error);
    return [];
  }
};

// Example of how validatedData might be obtained before calling createCheckoutSession:
/*
import { z } from 'zod'; // Assuming you use Zod for schema validation

const exampleAuthFormSchema = z.object({
  email: z.string().email(),
  // password: z.string(), // If password validation is also needed here
});

async function handleFormSubmit(formData: FormData) {
    const emailRaw = formData.get('email') as string;
    // const passwordRaw = formData.get('password') as string;

    try {
        const validatedData = exampleAuthFormSchema.parse({
            email: emailRaw,
            // password: passwordRaw,
        });

        // const team = await getSomeTeam(); // Function to get team context from your application
        // const priceId = "price_somepriceid"; // The price ID for checkout

        // await createCheckoutSession({ team, priceId, userEmail: validatedData.email });

    } catch (error) {
        console.error("Validation or processing error:", error);
        // Handle error, show message to user etc.
    }
}
*/
