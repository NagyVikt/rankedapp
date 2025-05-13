// @/lib/provider-config.ts

export type ProviderKey = 'replicate' | 'vertex' | 'openai' | 'fireworks';
export type ModelMode = 'performance' | 'quality';

// Interface for a single model
export interface Model {
  id: string; // The unique identifier for the model
  name: string; // A user-friendly display name for the model
  // other relevant properties like cost, speed, etc. can be added here
}

// Interface for the configuration of a provider
export interface ProviderConfig {
  displayName: string;
  models: Model[]; // Array of available Model objects for the provider
  iconPath: string;
  color: string;
  // any other provider-specific configurations
  // dimensionFormat?: "size" | "aspectRatio"; // Example of an optional property
}

// Helper function to create a more user-friendly name from a model ID
// This is a basic example; you might want a more sophisticated approach
const formatModelName = (id: string): string => {
  // Try to get the part after the last '/' or ':' and replace hyphens with spaces
  const namePart = id.split(/[/:]/).pop() || id;
  return namePart
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Main configuration object for all providers
// The type annotation now correctly uses ProviderConfig for the values
export const PROVIDERS: Record<ProviderKey, ProviderConfig> = {
  replicate: {
    displayName: 'Replicate',
    iconPath: '/provider-icons/replicate.svg',
    color: 'from-purple-500 to-blue-500',
    // Transform string IDs into Model objects
    models: [
      'black-forest-labs/flux-1.1-pro',
      'black-forest-labs/flux-1.1-pro-ultra',
      'black-forest-labs/flux-dev',
      'black-forest-labs/flux-pro',
      'black-forest-labs/flux-schnell',
      'ideogram-ai/ideogram-v2',
      'ideogram-ai/ideogram-v2-turbo',
      'luma/photon',
      'luma/photon-flash',
      'recraft-ai/recraft-v3',
      'stability-ai/stable-diffusion-3.5-large',
      'stability-ai/stable-diffusion-3.5-large-turbo',
    ].map((id) => ({ id, name: formatModelName(id) })), // Map string to Model object
  },
  vertex: {
    displayName: 'Vertex AI',
    iconPath: '/provider-icons/vertex.svg',
    color: 'from-green-500 to-emerald-500',
    models: ['imagen-3.0-generate-001', 'imagen-3.0-fast-generate-001'].map(
      (id) => ({ id, name: formatModelName(id) }),
    ),
  },
  openai: {
    displayName: 'OpenAI',
    iconPath: '/provider-icons/openai.svg',
    color: 'from-blue-500 to-cyan-500',
    models: ['dall-e-3'].map((id) => ({ id, name: formatModelName(id) })),
  },
  fireworks: {
    displayName: 'Fireworks',
    iconPath: '/provider-icons/fireworks.svg',
    color: 'from-orange-500 to-red-500',
    models: [
      'accounts/fireworks/models/flux-1-dev-fp8',
      'accounts/fireworks/models/flux-1-schnell-fp8',
      'accounts/fireworks/models/playground-v2-5-1024px-aesthetic',
      'accounts/fireworks/models/japanese-stable-diffusion-xl',
      'accounts/fireworks/models/playground-v2-1024px-aesthetic',
      'accounts/fireworks/models/SSD-1B',
      'accounts/fireworks/models/stable-diffusion-xl-1024-v1-0',
    ].map((id) => ({ id, name: formatModelName(id) })),
  },
};

// Configuration for different modes, mapping mode to provider and selected model ID
export const MODEL_CONFIGS: Record<ModelMode, Record<ProviderKey, string>> = {
  performance: {
    replicate: 'stability-ai/stable-diffusion-3.5-large-turbo',
    vertex: 'imagen-3.0-fast-generate-001',
    openai: 'dall-e-3', // Assuming DALL·E 3 is the only option or best for performance here
    fireworks: 'accounts/fireworks/models/flux-1-schnell-fp8',
  },
  quality: {
    replicate: 'stability-ai/stable-diffusion-3.5-large',
    vertex: 'imagen-3.0-generate-001',
    openai: 'dall-e-3',
    fireworks: 'accounts/fireworks/models/flux-1-dev-fp8',
  },
};

// Order in which providers should generally be displayed
export const PROVIDER_ORDER: ProviderKey[] = [
  'replicate',
  'vertex',
  'openai',
  'fireworks',
];

// Utility function to initialize a record for all providers with a default value
export const initializeProviderRecord = <T>(
  defaultValue?: T,
): Record<ProviderKey, T> =>
  Object.fromEntries(
    PROVIDER_ORDER.map((key) => [key, defaultValue]),
  ) as Record<ProviderKey, T>;
