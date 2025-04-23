// components/settings/SwitchCell.tsx
"use client";

import type { SwitchProps } from "@heroui/react";
import React from "react";
import { extendVariants, Switch } from "@heroui/react";
import { cn } from "@heroui/react";

// 1) Create the variant-extended Switch
const CustomSwitch = extendVariants(Switch, {
  variants: {
    color: {
      foreground: {
        wrapper: [
          "group-data-[selected=true]:bg-foreground",
          "group-data-[selected=true]:text-background",
        ],
      },
    },
  },
});

// 2) Pull off its props *without* any `ref` baggage
type CustomSwitchProps = Omit<
  React.ComponentPropsWithoutRef<typeof CustomSwitch>,
  "ref"
>;

// 3) Make a zero-ref wrapper so TS no longer expects you to pass a weird ref type
const SwitchWithoutRef: React.FC<CustomSwitchProps> = (props) => (
  <CustomSwitch {...props} />
);

// 4) Define your cell’s own props (add `foreground`, label, description, etc)
export type SwitchCellProps = Omit<SwitchProps, "color"> & {
  label: string;
  description: string;
  color?: SwitchProps["color"] | "foreground";
  classNames?: SwitchProps["classNames"] & {
    label?: string | string[];
    description?: string | string[];
    base?: string | string[];
  };
};

// 5) Finally, build the cell using our `SwitchWithoutRef`
export default function SwitchCell({
  label,
  description,
  classNames,
  ...props
}: SwitchCellProps) {
  return (
    <SwitchWithoutRef
      {...props}
      classNames={{
        ...classNames,
        base: cn(
          "inline-flex bg-content2 flex-row-reverse w-full max-w-full items-center",
          "justify-between cursor-pointer rounded-medium gap-2 p-4",
          classNames?.base
        ),
      }}
    >
      <div className="flex flex-col">
        <p className={cn("text-medium", classNames?.label)}>{label}</p>
        <p
          className={cn(
            "text-small text-default-500",
            classNames?.description
          )}
        >
          {description}
        </p>
      </div>
    </SwitchWithoutRef>
  );
}
