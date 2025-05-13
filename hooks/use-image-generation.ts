// @/hooks/use-image-generation.ts

import { useState } from 'react';
import { ImageError, ImageResult } from '@/lib/image-types'; // Assuming these are defined in image-types.ts
import { initializeProviderRecord, ProviderKey } from '@/lib/provider-config';

// Ensure ProviderTiming is exported
export interface ProviderTiming {
  startTime: number;
  completionTime?: number;
  elapsed?: number;
}

interface UseImageGenerationReturn {
  images: ImageResult[];
  errors: ImageError[];
  timings: Record<ProviderKey, ProviderTiming | null>; // Allow null for initial state before timing starts
  failedProviders: ProviderKey[];
  isLoading: boolean;
  startGeneration: (
    prompt: string,
    providers: ProviderKey[],
    providerToModel: Partial<Record<ProviderKey, string>>,
  ) => Promise<void>;
  resetState: () => void;
  activePrompt: string;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [images, setImages] = useState<ImageResult[]>([]);
  const [errors, setErrors] = useState<ImageError[]>([]);
  // Initialize timings with null or a specific initial structure
  const [timings, setTimings] = useState<
    Record<ProviderKey, ProviderTiming | null>
  >(
    initializeProviderRecord<ProviderTiming | null>(null), // Initialize with null
  );
  const [failedProviders, setFailedProviders] = useState<ProviderKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState('');

  const resetState = () => {
    setImages([]);
    setErrors([]);
    setTimings(initializeProviderRecord<ProviderTiming | null>(null));
    setFailedProviders([]);
    setIsLoading(false);
    setActivePrompt(''); // Also reset activePrompt
  };

  const startGeneration = async (
    prompt: string,
    providers: ProviderKey[],
    providerToModel: Partial<Record<ProviderKey, string>>,
  ) => {
    setActivePrompt(prompt);
    setIsLoading(true);
    setErrors([]);
    setFailedProviders([]);
    // Reset timings for the new generation batch, setting only for active providers
    const initialTimingsForBatch =
      initializeProviderRecord<ProviderTiming | null>(null);

    // Prepopulate images for active providers
    setImages(
      providers.map((provider) => ({
        provider,
        image: null,
        modelId: providerToModel[provider] ?? 'N/A', // Use N/A if modelId is somehow undefined
      })),
    );

    // Start timings for active providers
    const now = Date.now();
    providers.forEach((provider) => {
      initialTimingsForBatch[provider] = { startTime: now };
    });
    setTimings(initialTimingsForBatch);

    const generateImageFor = async (provider: ProviderKey) => {
      const modelId = providerToModel[provider];
      if (!modelId) {
        setFailedProviders((prev) => [...prev, provider]);
        setErrors((prev) => [
          ...prev,
          { provider, message: 'No model selected for this provider' },
        ]);
        // Update timing to reflect failure if needed, or leave as is
        setTimings((prev) => ({
          ...prev,
          [provider]: {
            ...(prev[provider] as ProviderTiming),
            completionTime: Date.now(),
            elapsed: Date.now() - (prev[provider]?.startTime || now),
          },
        }));
        return;
      }

      const currentProviderTiming = timings[provider]; // This will be ProviderTiming, not null
      const startTimeForCall = currentProviderTiming?.startTime || now; // Fallback, though should exist

      try {
        const response = await fetch('/api/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, provider, modelId }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status}`);
        }

        const completionTime = Date.now();
        setTimings((prev) => ({
          ...prev,
          [provider]: {
            startTime: startTimeForCall,
            completionTime,
            elapsed: completionTime - startTimeForCall,
          },
        }));

        setImages((prevImgs) =>
          prevImgs.map((img) =>
            img.provider === provider
              ? { ...img, image: data.image ?? null, modelId } // Ensure modelId is updated if it changed
              : img,
          ),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        console.error(`Error [${provider}]:`, err);
        setFailedProviders((prev) => [...prev, provider]);
        setErrors((prev) => [...prev, { provider, message }]);
        setImages((prevImgs) =>
          prevImgs.map((img) =>
            img.provider === provider
              ? { ...img, image: null, modelId } // Keep modelId consistent
              : img,
          ),
        );
        // Update timing to reflect failure
        setTimings((prev) => ({
          ...prev,
          [provider]: {
            ...(prev[provider] as ProviderTiming),
            completionTime: Date.now(),
            elapsed:
              Date.now() - (prev[provider]?.startTime || startTimeForCall),
          },
        }));
      }
    };

    await Promise.all(providers.map(generateImageFor));
    setIsLoading(false);
  };

  return {
    images,
    errors,
    timings,
    failedProviders,
    isLoading,
    startGeneration,
    resetState,
    activePrompt,
  };
}
