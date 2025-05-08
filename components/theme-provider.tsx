"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"; // Changed: Use direct import for ThemeProviderProps
import React, { ReactNode, JSX } from "react";

// Define MyThemeProviderProps to extend ThemeProviderProps from "next-themes".
// We make 'children' non-optional for our wrapper component.
interface MyThemeProviderProps extends ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider(props: MyThemeProviderProps): JSX.Element {
  // The 'props' object is of type MyThemeProviderProps.
  // MyThemeProviderProps is essentially ThemeProviderProps but with 'children' guaranteed to be ReactNode.
  // This is directly assignable to ThemeProviderProps (where 'children' is ReactNode | undefined).
  // Therefore, we can spread the entire 'props' object onto NextThemesProvider.
  return <NextThemesProvider {...props} />;
}
