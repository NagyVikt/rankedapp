"use client";

import React from "react";
import { Icon } from "@iconify/react"; // Use Iconify
import {
  Button, // Keep Button if SubmitButton doesn't fully replace it
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Spacer,
  Link,
  // Tabs, // Keep commented out unless implementing frequency switching
  // Tab,
} from "@heroui/react";
import { cn } from "@heroui/react";

import { checkoutAction } from '@/lib/payments/actions';
import { SubmitButton } from './submit-button';
import type { PlanData } from './page'; // Import the PlanData type

// --- Frequency data (keep commented out unless needed) ---
// import {FrequencyEnum} from "./pricing-types"; // Assuming you have these types defined
// const frequencies = [
//   {key: FrequencyEnum.Yearly, label: "Pay Yearly", priceSuffix: "year"},
//   {key: FrequencyEnum.Monthly, label: "Pay Monthly", priceSuffix: "month"}, // Adjust as needed
// ];
// --- ---

interface PricingClientComponentProps {
  plans: PlanData[];
}

export default function PricingClientComponent({ plans }: PricingClientComponentProps) {
  // --- Frequency state (keep commented out unless needed) ---
  // const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0]);
  // const onFrequencyChange = (selectedKey: React.Key) => {
  //   const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);
  //   setSelectedFrequency(frequencies[frequencyIndex]);
  // };
  // --- ---

  return (
    <div className="flex max-w-4xl flex-col items-center py-24 px-4 sm:px-6 lg:px-8 mx-auto">
      <div className="flex max-w-xl flex-col text-center">
        <h2 className="font-medium text-primary">Pricing</h2>
        <h1 className="text-4xl font-medium tracking-tight">Get unlimited access.</h1>
        <Spacer y={4} />
        <h2 className="text-large text-default-500">
          Discover the ideal plan for your needs. {/* Updated text */}
        </h2>
      </div>

      {/* --- Frequency Tabs (keep commented out unless needed) --- */}
      {/* <Spacer y={8} />
      <Tabs
         classNames={{
           tab: "data-[hover-unselected=true]:opacity-90",
         }}
         radius="full"
         size="lg"
         selectedKey={selectedFrequency.key} // Control selected key
         onSelectionChange={onFrequencyChange}
      >
        <Tab
           key={FrequencyEnum.Yearly}
           aria-label="Pay Yearly"
           className="pr-1.5"
           title={
             <div className="flex items-center gap-2">
               <p>Pay Yearly</p>
               <Chip color="primary" variant="flat">Save 20%</Chip> {/* Adjust discount */}
             {/*</div>
           }
        />
        <Tab key={FrequencyEnum.Monthly} title="Pay Monthly" />
      </Tabs> */}
      {/* --- --- */}

      <Spacer y={12} />

      {/* Use lg:grid-cols-3 for three plans */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full items-end"> {/* Added items-end */}
        {plans.map((plan) => (
          <Card
            key={plan.priceId || plan.name} // Use priceId as key
            className={cn(
              "relative p-3 flex flex-col", // base styles
              {
                // Styles for MOST POPULAR plan
                "overflow-visible bg-primary shadow-2xl shadow-primary/20": plan.mostPopular,
                // Styles for OTHER plans
                "!border-medium border-default-100 bg-transparent lg:mb-[-3rem]": !plan.mostPopular, // Adjusted vertical alignment
              }
            )}
            shadow="none"
          >
            {plan.mostPopular ? (
              <Chip
                classNames={{
                  // Position chip above the card for popular plan
                  base: "absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-foreground shadow-large border-medium border-primary",
                  content: "font-medium text-primary",
                }}
                color="primary" // This might not be needed if base class handles color
              >
                Most Popular
              </Chip>
            ) : null}
            <CardHeader className="flex flex-col items-start gap-2 pb-6 pt-6"> {/* Added pt-6 */}
              <h2
                 className={cn("text-xl font-medium", {
                   "text-primary-foreground": plan.mostPopular, // Text color for popular plan title
                 })}
              >
                {plan.name}
              </h2>
              <p
                className={cn("text-medium text-default-500", {
                  "text-primary-foreground/70": plan.mostPopular, // Text color for popular plan description
                })}
              >
                {plan.description}
              </p>
                 {/* Only show trial if trialDays > 0 */}
               {plan.trialDays > 0 && !plan.mostPopular && (
                 <p className="text-sm text-gray-600">
                    with {plan.trialDays} day free trial
                 </p>
               )}
                {plan.trialDays > 0 && plan.mostPopular && (
                 <p className="text-sm text-primary-foreground/70">
                    with {plan.trialDays} day free trial
                 </p>
               )}
            </CardHeader>
            <Divider className={cn({"bg-primary-foreground/20": plan.mostPopular})} /> {/* Divider color for popular */}
            {/* Use justify-between if CardFooter is not always at bottom */}
            <CardBody className="gap-8 flex-grow"> {/* Use flex-grow to push footer down */}
              <p className="flex items-baseline gap-1 pt-2">
                <span
                  className={cn(
                    // Base price style
                    "inline bg-gradient-to-br from-foreground to-foreground-600 bg-clip-text text-4xl font-semibold leading-7 tracking-tight text-transparent",
                    {
                      // Price style for popular plan
                      "text-primary-foreground": plan.mostPopular,
                    }
                  )}
                >
                  {/* Calculate price based on selected frequency if implemented, otherwise use plan.price */}
                  ${plan.price / 100}
                   {/* Add logic here for frequency: e.g., selectedFrequency.key === 'yearly' ? plan.prices.year.price / 100 : plan.prices.month.price / 100 */}
                </span>
                 {/* Add logic here for frequency suffix */}
                <span
                  className={cn("text-sm font-medium text-default-400", {
                    "text-primary-foreground/50": plan.mostPopular, // Suffix color for popular
                  })}
                >
                  / user / {plan.interval}
                   {/* e.g., / {selectedFrequency.priceSuffix} */}
                </span>
              </p>
              <ul className="flex flex-col gap-2">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Icon
                      className={cn("text-primary", { // Base icon color
                        "text-primary-foreground": plan.mostPopular, // Icon color for popular
                      })}
                      icon="ci:check" // Iconify icon name
                      width={24}
                    />
                    <p
                      className={cn("text-default-500", { // Base feature text color
                        "text-primary-foreground/70": plan.mostPopular, // Feature text color for popular
                      })}
                    >
                      {feature}
                    </p>
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter>
              {/* Use the form for checkout, passing the correct priceId */}
              <form action={checkoutAction} className="w-full">
                 {/* Add logic here for frequency priceId: e.g., value={selectedFrequency.key === 'yearly' ? plan.prices.year.priceId : plan.prices.month.priceId} */}
                <input type="hidden" name="priceId" value={plan.priceId} />
                <SubmitButton
                   fullWidth
                   // Apply specific styles for the popular button
                   className={cn({
                      "bg-primary-foreground font-medium text-primary shadow-sm shadow-default-500/50": plan.mostPopular,
                      // Add standard button style if needed, otherwise SubmitButton defaults apply
                   })}
                   // Use props if SubmitButton accepts them directly
                   color={plan.mostPopular ? undefined : plan.buttonColor} // Let className handle popular color
                   variant={plan.mostPopular ? undefined : plan.buttonVariant} // Let className handle popular variant
                >
                   {plan.buttonText || 'Get Started'}
                </SubmitButton>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Spacer y={12} />
      <div className="flex py-2">
        <p className="text-default-400">
          Need a custom solution?&nbsp; {/* Updated text */}
          <Link color="foreground" href="/contact" underline="always"> {/* Example contact link */}
            Contact Sales
          </Link>
        </p>
      </div>
    </div>
  );
}