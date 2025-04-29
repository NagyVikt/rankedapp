import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe'; // Assuming stripe functions are here
import PricingClientComponent from './pricing-client-component'; // Import the client component

// Revalidate the data every hour (3600 seconds)
export const revalidate = 3600;

// Define the structure for plan data passed to the client component
export type PlanData = {
  name: string;
  description: string;
  price: number; // Price in cents
  interval: string; // e.g., 'month', 'year'
  trialDays: number;
  features: string[];
  priceId?: string; // Stripe Price ID (e.g., price_123...)
  mostPopular?: boolean; // Flag for highlighting a specific plan
  buttonText?: string; // Custom text for the button
  // HeroUI Button props for styling
  buttonColor?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  buttonVariant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
};

// The main server component for the pricing page
export default async function PricingPage() {
  // Fetch products and prices concurrently from Stripe
  const [prices, products] = await Promise.all([
    // Fetch active, recurring prices. Add currency filter if needed (e.g., { active: true, type: 'recurring', currency: 'eur' })
    getStripePrices({ active: true, type: 'recurring' }),
    // Fetch active products
    getStripeProducts({ active: true }),
  ]);

  // --- Find Products by Name ---
  // Find the Stripe Product objects based on the names you've set in the Stripe Dashboard
  const basePlanProduct = products.find((product) => product.name === 'Starter');
  const plusPlanProduct = products.find((product) => product.name === 'Plus');
  // Find the new product you created
  const ultimateWebshopProduct = products.find((product) => product.name === 'ULTIMATE WEBSHOP');
  // const teamPlanProduct = products.find((product) => product.name === 'Team'); // Uncomment if using a "Team" plan

  // --- Find Corresponding Prices ---
  // Find the specific Stripe Price object for each product (assuming monthly interval here)
  const basePrice = prices.find(
    (price) => price.productId === basePlanProduct?.id && price.interval === 'month' // Adjust interval/currency if needed
  );
  const plusPrice = prices.find(
    (price) => price.productId === plusPlanProduct?.id && price.interval === 'month'
  );
  // Find the specific EUR monthly price for the new product
  const ultimateWebshopPrice = prices.find(
    (price) => price.productId === ultimateWebshopProduct?.id &&
               price.interval === 'month' &&
               price.currency === 'eur' // Ensure currency match if needed
  );
  // const teamPrice = prices.find(
  //   (price) => price.productId === teamPlanProduct?.id && price.interval === 'month'
  // ); // Uncomment if using a "Team" plan

  // --- Prepare Plan Data Objects ---
  // Create structured data objects for each plan to pass to the client component

  const basePlanData: PlanData = {
    name: basePlanProduct?.name || 'Starter', // Use Stripe name or fallback
    description: basePlanProduct?.description || 'For starters and basic needs.', // Use Stripe description or fallback
    price: basePrice?.unitAmount ?? 800, // Use Stripe price (cents) or default (e.g., $8.00)
    interval: basePrice?.interval || 'month', // Use Stripe interval or fallback
    trialDays: basePrice?.trialPeriodDays ?? 0, // Use Stripe trial days or default
    features: [ // Define features for this plan
      'Up to 3 Webshops',
      'Max 1000 products',
      'Email Marketing',
      'Free Email Templates',
      'Unlayer Email Editor',
      'AI-Powered Content Generation',
      'AI price suggestions',
      'Max 100 AI requests / month',
      'Max 5,000 Emails / month',
      'Analytics',
      'SEO Tools',
      'Reporting',
      'WooCommerce Integration',
      // 'Shopify Integration - COMING SOON',
      'Deepsearch for WooCommerce products',
      // 'Deepsearch for Shopify products - COMING SOON',
      ,
    ],
    priceId: basePrice?.id, // The crucial Stripe Price ID for checkout
    mostPopular: false, // Not the most popular
    buttonText: 'Get Started', // Button label
    buttonColor: 'default', // Button style
    buttonVariant: 'flat',
  };

  const plusPlanData: PlanData = {
    name: plusPlanProduct?.name || 'Plus',
    description: plusPlanProduct?.description || 'For growing teams needing more power.',
    price: plusPrice?.unitAmount ?? 1200, // Default $12.00
    interval: plusPrice?.interval || 'month',
    trialDays: plusPrice?.trialPeriodDays ?? 7, // Example 7-day trial
    features: [
      'Everything in Starter plan, plus:',
      'Up to 20 Webshops',
      'Max 10,000 products',
      'Pro Email Templates',
      'Customizable Email Templates',
      'A/B Testing - COMMING SOON',
      'Max 500 AI requests / month',
      'Max 10,000 Emails / month',
      'Priority Support',
      'Backlinks AI',
    ],
    priceId: plusPrice?.id,
    mostPopular: true, // Mark this one as highlighted
    buttonText: 'Start Free Trial',
    // Styling for the popular button is often handled directly in the client component
  };

  // Data for the new "ULTIMATE WEBSHOP" plan
  const ultimateWebshopPlanData: PlanData = {
    name: ultimateWebshopProduct?.name || 'Ultimate Webshop', // Use exact name from Stripe
    description: ultimateWebshopProduct?.description || 'The complete solution for your webshop.', // Use Stripe description or add one
    price: ultimateWebshopPrice?.unitAmount ?? 3500, // Use fetched EUR price (3500 cents) or default
    interval: ultimateWebshopPrice?.interval || 'month', // Should be 'month' based on fetch
    trialDays: ultimateWebshopPrice?.trialPeriodDays ?? 0, // Use Stripe trial days if set, else 0
    features: [ // Define features for the Ultimate plan
        'All Plus features, plus:',
        'Unlimited Webhops & Products',
        '15000 AI requests',
        'REACT WEBSHOP ',
        'Custom Domain Included',
        'Detailed Analytics Dashboard',
        'Dedicated Account Manager',
    ],
    priceId: ultimateWebshopPrice?.id, // The Price ID for €35.00/month
    mostPopular: false, // Set to true if this should be the popular one instead
    buttonText: 'Go Ultimate',
    buttonColor: 'primary', // Example styling
    buttonVariant: 'solid', // Example styling
  };

  // --- (Optional) Team Plan Data ---
  // const teamPlanData: PlanData = {
  //   name: teamPlanProduct?.name || 'Team',
  //   description: teamPlanProduct?.description || 'For larger organizations.',
  //   price: teamPrice?.unitAmount ?? 5000, // Default $50.00
  //   interval: teamPrice?.interval || 'month',
  //   trialDays: teamPrice?.trialPeriodDays ?? 0,
  //   features: [
  //       'Everything in Plus, plus:',
  //       'Unlimited Users',
  //       'Custom Reporting',
  //       'Phone & Slack Support',
  //       '50GB Storage',
  //       'SSO Integration'
  //   ],
  //   priceId: teamPrice?.id,
  //   mostPopular: false,
  //   buttonText: 'Contact Sales',
  //   buttonColor: 'default',
  //   buttonVariant: 'flat',
  // };

  // --- Compile List of Plans to Display ---
  // Create the final array of plans, including the new one
  const plansToShow = [
      basePlanData,
      plusPlanData,
      ultimateWebshopPlanData, // Include the new plan
      // teamPlanData, // Uncomment if using Team plan
    ]
    // IMPORTANT: Filter out any plans where we couldn't find a valid Price ID
    .filter(plan => !!plan.priceId)
    // Optional: Sort the plans based on price (ascending)
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

  // Render the client component, passing the prepared list of plans
  return (
    <PricingClientComponent plans={plansToShow} />
  );
}
