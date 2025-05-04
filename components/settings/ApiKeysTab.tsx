// app/dashboard/settings/ApiKeysTab.tsx
"use client";

import React from 'react';
import { ApiKeyManager, ApiKeyConfig } from './ApiKeyManager'; // Adjust path if needed

// Define configurations for each API key provider
// Note: Ensure you have the correct icons installed or use generic ones.
const apiKeyConfigs: ApiKeyConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'simple-icons:openai',
    localStorageKey: 'openaiApiKey',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: 'logos:google-gemini', // Use Google Gemini logo
    localStorageKey: 'geminiApiKey',
    keyPrefix: null, // Gemini keys don't have a standard public prefix
    docsUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'Enter your Gemini API Key',
    infoText: "Ensure the Gemini API is enabled in your Google Cloud project."
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: 'simple-icons:anthropic', // Official icon
    localStorageKey: 'claudeApiKey',
    keyPrefix: 'sk-ant-api03-', // Example, verify current prefix
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-api03-xxxxxxxxxxxxxxxxxx'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: 'arcticons:perplexity', // Found an icon
    localStorageKey: 'perplexityApiKey',
    keyPrefix: 'pplx-',
    docsUrl: 'https://docs.perplexity.ai/docs/getting-started',
    placeholder: 'pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'material-symbols:key-outline', // Using a generic key icon
    localStorageKey: 'deepseekApiKey',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  // Add more providers here as needed
];

interface ApiKeysTabProps {
    className?: string;
}

export default function ApiKeysTab({ className }: ApiKeysTabProps) {
  return (
    // Assuming parent component provides dark theme context (e.g., className="dark")
    // Apply text-foreground for default text color in the theme
    <div className={`space-y-6 pt-4 text-foreground ${className}`}>
      <p className="text-medium font-semibold">Manage AI Provider API Keys</p>
      <div className="space-y-4">
        {/* Map over the configurations and render a manager for each */}
        {apiKeyConfigs.map((config) => (
          <ApiKeyManager key={config.id} config={config} />
        ))}
      </div>
    </div>
  );
}