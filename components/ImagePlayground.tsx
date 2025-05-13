"use client";

import { useState, useEffect } from "react";
import { ModelSelect, type ModelSelectProps } from "@/components/ModelSelect";
import { PromptInput } from "@/components/PromptInput";
import { ModelCardCarousel } from "@/components/ModelCardCarousel";
import {
  MODEL_CONFIGS,
  PROVIDERS,
  PROVIDER_ORDER,
  ProviderKey,
  ModelMode,
  initializeProviderRecord,
  type ProviderConfig, // Ensure this is imported
  type Model,          // Ensure Model type is imported if it's used explicitly for clarity
} from "@/lib/provider-config";
import { Suggestion } from "@/lib/suggestions";
import { useImageGeneration, type ProviderTiming } from "@/hooks/use-image-generation";
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
  return Object.fromEntries(
    Object.entries(config).filter(([key]) => ALLOWED_PROVIDER_KEYS.includes(key as AllowedProviderKey)),
  ) as FilteredModelRecord;
};

// Helper function to filter enabled provider records
const filterEnabledProviders = (
  record: Record<ProviderKey, boolean>,
): FilteredEnabledRecord => {
   console.log("DEBUG: Record received by filterEnabledProviders:", record);
   const filtered = Object.fromEntries(
    Object.entries(record).filter(([key]) => ALLOWED_PROVIDER_KEYS.includes(key as AllowedProviderKey)),
  ) as FilteredEnabledRecord;
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

  const [selectedModels, setSelectedModels] = useState<FilteredModelRecord>(() => {
      const initialConf = filterModelConfig(MODEL_CONFIGS.performance);
      console.log("DEBUG: Initializing selectedModels state:", initialConf);
      return initialConf;
  });

  const [enabledProviders, setEnabledProviders] = useState<FilteredEnabledRecord>(() => {
       const allProvidersRecord = initializeProviderRecord(true);
       console.log("DEBUG: Output of initializeProviderRecord(true):", allProvidersRecord);
       const initialEnabled = filterEnabledProviders(allProvidersRecord);
       console.log("DEBUG: Initializing enabledProviders state:", initialEnabled);
       return initialEnabled;
  });

  const [mode, setMode] = useState<ModelMode>("performance");

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
    console.log("DEBUG: Submitting prompt. Active providers:", activeProviders, "Models:", providerToModel);
    if (activeProviders.length > 0) {
      const modelsForActiveProviders = activeProviders.reduce((acc, key) => {
        if (providerToModel[key]) {
          acc[key] = providerToModel[key];
        }
        return acc;
      }, {} as FilteredModelRecord);
      startGeneration(newPrompt, activeProviders, modelsForActiveProviders);
    }
    setShowProviders(false);
  };

 // --- Rendering Logic ---

 const calculatedModelProps = ALLOWED_PROVIDER_KEYS.map((key) => {
    console.log(`DEBUG: [Render] Processing key: ${key}`);
    const provider: ProviderConfig | undefined = PROVIDERS[key];
    const isEnabled = enabledProviders[key];
    console.log(`DEBUG: [Render] Provider config for ${key}:`, provider ? 'Found' : 'NOT FOUND');
    console.log(`DEBUG: [Render] Is enabled state for ${key}: ${isEnabled}`);

    if (!provider) {
        console.warn(`DEBUG: [Render] Provider configuration missing in PROVIDERS for key: ${key}. Skipping.`);
        return null;
    }

    if (
        !provider.displayName ||
        !provider.models || provider.models.length === 0 || // provider.models is Model[]
        !provider.iconPath ||
        !provider.color
    ) {
        console.warn(`DEBUG: [Render] Provider configuration for key: ${key} is incomplete (missing displayName, models, iconPath, or color). Skipping.`);
        return null;
    }

    const currentSelectedModelValue = selectedModels[key];
    if (typeof currentSelectedModelValue === 'undefined') {
        console.warn(`DEBUG: [Render] No model selected for provider ${key} (selectedModels['${key}'] is undefined). Skipping card for this provider as 'value' prop would be undefined.`);
        return null;
    }

    const imageItem = images.find((img) => img.provider === key);
    const imageData = imageItem?.image;
    const generatedModelIdDisplay = imageItem?.modelId ?? "N/A";
    const timingData = timings[key as ProviderKey] ?? null;

    const onToggleForThisProvider = () => {
        handleProviderToggle(key, !isEnabled);
    };

    // Transform provider.models (Model[]) to string[] for ModelSelect component
    // Assuming ModelSelect expects an array of model IDs.
    // If it expects names, use model.name instead of model.id.
    const modelIdsForSelect: string[] = provider.models.map((model: Model) => model.id);

    return {
        label: provider.displayName,
        models: modelIdsForSelect, // Pass the transformed string[]
        value: currentSelectedModelValue,
        providerKey: key,
        onChange: (model: string) => { handleModelChange(key, model); },
        iconPath: provider.iconPath,
        color: provider.color,
        enabled: isEnabled ?? false,
        onToggle: onToggleForThisProvider,
        image: imageData,
        modelId: generatedModelIdDisplay,
        timing: timingData as ProviderTiming | null,
        failed: failedProviders.includes(key),
    };
 }).filter(Boolean) as ModelSelectProps[];

 console.log(`DEBUG: [Render] Number of valid model props calculated: ${calculatedModelProps.length}`);
 console.log("DEBUG: [Render] Final props for rendering:", calculatedModelProps);


  const numProviders = calculatedModelProps.length;
  const gridColsClass = `md:grid-cols-${Math.max(1, Math.min(numProviders, 3))}`;
  const xlGridColsClass = `2xl:grid-cols-${Math.max(1, Math.min(numProviders, 4))}`;


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
            {numProviders > 0 ? (
              <>
                <div className="md:hidden">
                    <ModelCardCarousel models={calculatedModelProps} />
                </div>
                <div className={`hidden md:grid ${gridColsClass} ${xlGridColsClass} gap-8`}>
                {calculatedModelProps.map((props) => (
                    <ModelSelect key={props.providerKey} {...props} />
                ))}
                </div>
              </>
            ) : (
              !isLoading && (!activePrompt || activePrompt.length === 0) && (
                <div className="text-center mt-8 text-muted-foreground">
                    No image generation providers are available or enabled.
                </div>
              )
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
