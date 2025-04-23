"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

interface MyThemeProviderProps extends Omit<ThemeProviderProps, "children"> {
  children: React.ReactNode;
}

export function ThemeProvider({ children, ...rest }: MyThemeProviderProps) {
  return <NextThemesProvider {...rest}>{children}</NextThemesProvider>;
}
