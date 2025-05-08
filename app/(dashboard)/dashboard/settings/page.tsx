"use client";

import React from "react";
import SettingsComponent from "@/components/settings/SettingsComponent";

// Alias to avoid JSX component type errors
const SettingsComponentX = SettingsComponent as any;

export default function TeamPage(): JSX.Element {
  return <SettingsComponentX />;
}
