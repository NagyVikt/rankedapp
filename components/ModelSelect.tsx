import { Card, CardContent } from '@/components/ui/card';
import { imageHelpers } from '@/lib/image-helpers';
import {
  FireworksIcon,
  OpenAIIcon,
  ReplicateIcon,
  VertexIcon,
} from '@/lib/logos';
import { ProviderKey } from '@/lib/provider-config';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ProviderTiming } from '@/lib/image-types'; // Assuming ImageResult type exists

import { ImageDisplay } from './ImageDisplay';
import Link from 'next/link';

// Define the structure for individual results within the replicateResults array
// This should match the structure provided by the hook
interface ReplicateResultItem {
  modelId: string;
  image: string | null;
  timing?: ProviderTiming;
  failed?: boolean;
}

// Updated Props Interface
export interface ModelSelectProps {
  label: string;
  // Ensure models is an array of strings (model IDs or names)
  models: string[];
  value: string; // Currently selected model ID in the dropdown
  providerKey: ProviderKey;
  onChange: (value: string, providerKey: ProviderKey) => void;
  iconPath?: string; // Keep if used, though Icon component is used below
  color?: string; // Keep if used
  enabled?: boolean;
  onToggle?: () => void; // Changed from (enabled: boolean) based on ImagePlayground update

  // Props for single-result providers
  image?: string | null | undefined;
  timing?: ProviderTiming;
  failed?: boolean;
  modelId?: string; // Model ID associated with the single result (or selected)

  // --- NEW PROP for Replicate ---
  replicateResults?: ReplicateResultItem[];
}

const PROVIDER_ICONS = {
  openai: OpenAIIcon,
  replicate: ReplicateIcon,
  vertex: VertexIcon,
  fireworks: FireworksIcon,
} as const;

const PROVIDER_LINKS = {
  openai: 'openai',
  replicate: 'replicate',
  vertex: 'google-vertex',
  fireworks: 'fireworks',
} as const;

export function ModelSelect({
  label,
  models,
  value, // Currently selected model in UI
  providerKey,
  onChange,
  enabled = true,
  onToggle, // Use the parameterless onToggle
  // Single result props:
  image,
  timing,
  failed,
  modelId, // Model ID for single result display
  // Multi-result prop:
  replicateResults,
}: ModelSelectProps) {
  const Icon = PROVIDER_ICONS[providerKey];

  // Determine if we should show multi-result info
  const isReplicateMulti =
    providerKey === 'replicate' &&
    replicateResults &&
    replicateResults.length > 0;
  // Find the first successful result for Replicate to display an image
  const firstReplicateResult = isReplicateMulti
    ? replicateResults?.find((r) => r.image && !r.failed)
    : undefined;
  const successfulReplicateCount = isReplicateMulti
    ? (replicateResults?.filter((r) => r.image && !r.failed).length ?? 0)
    : 0;
  const failedReplicateCount = isReplicateMulti
    ? (replicateResults?.filter((r) => r.failed || !r.image).length ?? 0)
    : 0;

  return (
    <Card
      className={cn(`w-full transition-opacity`, enabled ? '' : 'opacity-50')}
    >
      {/* Add onClick handler for toggling if needed */}
      <CardContent className="pt-6 h-full flex flex-col">
        {/* Top section: Icon, Title, Dropdown */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 w-full transition-opacity duration-200">
            {/* Icon */}
            <div className="bg-primary p-2 rounded-full flex-shrink-0">
              <Link
                className="hover:opacity-80"
                href={
                  'https://sdk.vercel.ai/providers/ai-sdk-providers/' +
                  PROVIDER_LINKS[providerKey]
                }
                target="_blank"
                aria-label={`Link to ${label} provider documentation`}
              >
                <div className="text-primary-foreground">
                  <Icon size={28} />
                </div>
              </Link>
            </div>
            {/* Title & Dropdown */}
            <div className="flex flex-col w-full overflow-hidden">
              <Link
                className="hover:opacity-80"
                href={
                  'https://sdk.vercel.ai/providers/ai-sdk-providers/' +
                  PROVIDER_LINKS[providerKey]
                }
                target="_blank"
              >
                <h3 className="font-semibold text-lg truncate">{label}</h3>
              </Link>
              <div className="flex justify-between items-center w-full">
                <Select
                  defaultValue={value}
                  value={value}
                  onValueChange={(selectedValue) =>
                    onChange(selectedValue, providerKey)
                  }
                  disabled={!enabled} // Disable select if provider is disabled
                >
                  <SelectTrigger className="truncate">
                    <SelectValue
                      placeholder={
                        value
                          ? imageHelpers.formatModelId(value)
                          : 'Select a model'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* Ensure models are strings */}
                      {(models as string[]).map((modelId) => (
                        <SelectItem
                          key={modelId}
                          value={modelId}
                          className="text-xs sm:text-sm"
                        >
                          {/* Display formatted model ID */}
                          {imageHelpers.formatModelId(modelId)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Optional: Add toggle switch here if needed, using onToggle */}
          {/* Example: <Switch checked={enabled} onCheckedChange={onToggle} /> */}
        </div>

        {/* Image Display Area - Updated Logic */}
        <div className="flex-grow">
          {' '}
          {/* Allow image display to take remaining space */}
          {isReplicateMulti ? (
            // --- Display for Multiple Replicate Results ---
            <>
              <ImageDisplay
                // Show image from the first successful result
                image={firstReplicateResult?.image ?? null}
                // Show model ID of the first successful result
                modelId={firstReplicateResult?.modelId ?? 'Multiple Models'}
                provider={providerKey}
                // Aggregate timing/failure could be complex, showing first result's status for now
                timing={firstReplicateResult?.timing}
                failed={!firstReplicateResult} // Consider failed if no successful result found
              />
              {/* Display count of results */}
              <div className="text-xs text-muted-foreground mt-1 text-center px-1">
                {successfulReplicateCount > 0 &&
                  `${successfulReplicateCount} successful result${successfulReplicateCount > 1 ? 's' : ''}. `}
                {failedReplicateCount > 0 && `${failedReplicateCount} failed.`}
                {!successfulReplicateCount &&
                  !failedReplicateCount &&
                  `Processing ${replicateResults?.length ?? 0} models...`}
              </div>
              {/* --- Placeholder for Gallery ---
                  If you want a gallery, you would replace or augment the ImageDisplay above
                  with a component that takes `replicateResults` and renders thumbnails or a carousel.
                  Example: <ReplicateResultGallery results={replicateResults} />
              --- End Placeholder --- */}
            </>
          ) : (
            // --- Display for Single Result Providers ---
            <ImageDisplay
              modelId={modelId ?? 'N/A'} // Use the passed modelId
              provider={providerKey}
              image={image}
              timing={timing}
              failed={failed}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
