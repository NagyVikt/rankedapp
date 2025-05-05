"use client";

import { useState, useEffect } from "react"; // Import useEffect for logging state changes
import { ModelSelect } from "@/components/ModelSelect";
import { PromptInput } from "@/components/PromptInput";
import { ModelCardCarousel } from "@/components/ModelCardCarousel";
import {
  MODEL_CONFIGS,
  PROVIDERS,
  PROVIDER_ORDER,
  ProviderKey,
  ModelMode,
  initializeProviderRecord,
} from "@/lib/provider-config";
import { Suggestion } from "@/lib/suggestions";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { Header } from "./Header";

// Define allowed providers (excluding 'vertex')
const ALLOWED_PROVIDER_KEYS = PROVIDER_ORDER.filter(
  (p) => p !== "vertex",
) as Exclude<ProviderKey, "vertex">[];
// --- Log 1 ---
console.log("DEBUG: ALLOWED_PROVIDER_KEYS:", ALLOWED_PROVIDER_KEYS);

// Type for state excluding 'vertex'
type AllowedProviderKey = Exclude<ProviderKey, "vertex">;
type FilteredModelRecord = Record<AllowedProviderKey, string>;
type FilteredEnabledRecord = Record<AllowedProviderKey, boolean>;

// Helper function to filter model configuration objects
const filterModelConfig = (
  config: Record<ProviderKey, string>,
): FilteredModelRecord => {
  // Filter based on ALLOWED_PROVIDER_KEYS to ensure consistency
  return Object.fromEntries(
    Object.entries(config).filter(([key]) => ALLOWED_PROVIDER_KEYS.includes(key as AllowedProviderKey)),
  ) as FilteredModelRecord;
};

// Helper function to filter enabled provider records
const filterEnabledProviders = (
  record: Record<ProviderKey, boolean>,
): FilteredEnabledRecord => {
   // --- Log 2 ---
   console.log("DEBUG: Record received by filterEnabledProviders:", record);
   const filtered = Object.fromEntries(
    Object.entries(record).filter(([key]) => ALLOWED_PROVIDER_KEYS.includes(key as AllowedProviderKey)),
  ) as FilteredEnabledRecord;
  // --- Log 3 ---
  console.log("DEBUG: Record after filtering in filterEnabledProviders:", filtered);
  return filtered;
};

export function ImagePlayground({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const {
    images,
    timings,
    failedProviders,
    isLoading,
    startGeneration,
    activePrompt,
  } = useImageGeneration();

  const [showProviders, setShowProviders] = useState(true);

  // Initialize state using functions to allow immediate logging
  const [selectedModels, setSelectedModels] = useState<FilteredModelRecord>(() => {
      const initialConf = filterModelConfig(MODEL_CONFIGS.performance);
      // --- Log 4 ---
      console.log("DEBUG: Initializing selectedModels state:", initialConf);
      return initialConf;
  });

  const [enabledProviders, setEnabledProviders] = useState<FilteredEnabledRecord>(() => {
       // Explicitly call initializeProviderRecord here to log its direct output
       const allProvidersRecord = initializeProviderRecord(true);
       // --- Log 5 ---
       console.log("DEBUG: Output of initializeProviderRecord(true):", allProvidersRecord);
       const initialEnabled = filterEnabledProviders(allProvidersRecord);
       // --- Log 6 ---
       console.log("DEBUG: Initializing enabledProviders state:", initialEnabled);
       return initialEnabled;
  });

  const [mode, setMode] = useState<ModelMode>("performance");

  // Optional: Log state changes if needed for further debugging
  // useEffect(() => {
  //     console.log("DEBUG: enabledProviders state updated:", enabledProviders);
  // }, [enabledProviders]);

  const toggleView = () => {
    setShowProviders((prev) => !prev);
  };

  const handleModeChange = (newMode: ModelMode) => {
    setMode(newMode);
    setSelectedModels(filterModelConfig(MODEL_CONFIGS[newMode]));
    setShowProviders(true);
  };

  const handleModelChange = (providerKey: AllowedProviderKey, model: string) => {
    setSelectedModels((prev) => ({ ...prev, [providerKey]: model }));
  };

  const handleProviderToggle = (
    provider: AllowedProviderKey,
    enabled: boolean,
  ) => {
    setEnabledProviders((prev) => ({
      ...prev,
      [provider]: enabled,
    }));
  };

  const providerToModel: FilteredModelRecord = ALLOWED_PROVIDER_KEYS.reduce(
    (acc, key) => {
      if (selectedModels[key]) {
         acc[key] = selectedModels[key];
      }
      return acc;
    },
    {} as FilteredModelRecord
  );

  const handlePromptSubmit = (newPrompt: string) => {
    const activeProviders = ALLOWED_PROVIDER_KEYS.filter(
      (p) => enabledProviders[p],
    );
    // --- Log 7 ---
    console.log("DEBUG: Submitting prompt. Active providers:", activeProviders, "Models:", providerToModel);
    if (activeProviders.length > 0) {
      startGeneration(newPrompt, activeProviders, providerToModel);
    }
    setShowProviders(false);
  };

 // --- Rendering Logic ---

 // Calculate props once per render cycle
 const calculatedModelProps = ALLOWED_PROVIDER_KEYS.map((key) => {
    // --- Log 8 ---
    console.log(`DEBUG: [Render] Processing key: ${key}`);
    const provider = PROVIDERS[key];
    const isEnabled = enabledProviders[key];
    // --- Log 9 ---
    console.log(`DEBUG: [Render] Provider config for ${key}:`, provider ? 'Found' : 'NOT FOUND');
    console.log(`DEBUG: [Render] Is enabled state for ${key}: ${isEnabled}`);

    if (!provider) {
        console.warn(`DEBUG: [Render] Provider configuration missing in PROVIDERS for key: ${key}. Skipping.`);
        return null; // Skip if provider config is missing
    }
    // It's possible state isn't ready on first pass, check if isEnabled is defined
    if (typeof isEnabled === 'undefined') {
         console.warn(`DEBUG: [Render] enabledProviders state for key ${key} is undefined. Treating as disabled.`);
    }

    const imageItem = images.find((img) => img.provider === key);
    const imageData = imageItem?.image;
    const modelId = imageItem?.modelId ?? "N/A";
    const timing = timings[key as ProviderKey];

    return {
        label: provider.displayName,
        models: provider.models,
        value: selectedModels[key], // Read from state
        providerKey: key,
        onChange: (model: string) => { handleModelChange(key, model); },
        iconPath: provider.iconPath,
        color: provider.color,
        enabled: isEnabled ?? false, // Default to false if undefined state
        onToggle: (enabled: boolean) => handleProviderToggle(key, enabled),
        image: imageData,
        modelId,
        timing: timing ?? null,
        failed: failedProviders.includes(key),
    };
 }).filter(Boolean); // Filter out any nulls from missing providers

 // --- Log 10 ---
 console.log(`DEBUG: [Render] Number of valid model props calculated: ${calculatedModelProps.length}`);
 console.log("DEBUG: [Render] Final props for rendering:", calculatedModelProps);


  // Determine grid columns based on the *actual* number of props calculated
  const numProviders = calculatedModelProps.length;
  const gridColsClass = `md:grid-cols-${Math.min(numProviders, 3)}`; // Adjust max cols if needed
  const xlGridColsClass = `2xl:grid-cols-${Math.min(numProviders, 4)}`; // Adjust max cols if needed

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          showProviders={showProviders}
          onToggleProviders={toggleView}
          mode={mode}
          onModeChange={handleModeChange}
          suggestions={suggestions}
        />
        <>
            {/* Conditional Rendering based on calculated props */}
            {numProviders > 0 && (
                <div className="md:hidden">
                    <ModelCardCarousel models={calculatedModelProps} />
                </div>
            )}
            {numProviders > 0 && (
                <div className={`hidden md:grid ${gridColsClass} ${xlGridColsClass} gap-8`}>
                {calculatedModelProps.map((props) => (
                    <ModelSelect key={props.label} {...props} />
                ))}
                </div>
            )}
            {/* This condition should now accurately reflect if props were generated */}
            {numProviders === 0 && !isLoading && (
                <div className="text-center mt-8 text-muted-foreground">
                    No image generation providers are available or enabled.
                </div>
            )}
            {activePrompt && activePrompt.length > 0 && (
                <div className="text-center mt-4 text-muted-foreground">
                {activePrompt}
                </div>
            )}
        </>
      </div>
    </div>
  );
}