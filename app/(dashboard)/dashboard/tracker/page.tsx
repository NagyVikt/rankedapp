// app/components/ai/AIJobTrackerComponent.tsx (Example Path)
"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Button,
    Switch,
    Chip,
    Tooltip,
    Skeleton // Import Skeleton
} from '@heroui/react'; // Ensure HeroUI is correctly imported
import { Icon } from '@iconify/react';

// Define the structure for an AI Job
interface AIJob {
  id: string;
  title: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  status?: 'Idle' | 'Running' | 'Error' | 'Completed';
  lastRun?: string;
  badge?: 'NEW' | 'HOT' | 'TRENDING' | 'COMING SOON';
  configAction?: { label: string; onPress: (id: string) => void; icon?: string };
}

// --- Expanded list of AI Jobs with Badges ---
const initialAIJobs: AIJob[] = [
    // ... (Full list of jobs as defined previously) ...
    { id: 'abandoned-cart', title: 'Abandoned Cart Recovery Agent', description: 'Sends personalized recovery emails/SMS for abandoned checkouts.', icon: 'solar:cart-large-minimalistic-broken', isEnabled: true, status: 'Idle', lastRun: '2025-05-03 10:00', badge: 'HOT', configAction: { label: 'Configure Sequence', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'welcome-email', title: 'Personalized Welcome Agent', description: 'Drafts & sends personalized welcome emails to new customers/subscribers.', icon: 'solar:letter-opened-broken', isEnabled: true, status: 'Completed', lastRun: '2025-05-04 09:15', configAction: { label: 'Edit Template', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'product-desc-gen', title: 'Product Description Writer', description: 'Writes compelling, SEO-friendly descriptions for new or existing products.', icon: 'solar:document-add-broken', isEnabled: true, status: 'Idle', badge: 'NEW', configAction: { label: 'Configure Tone & Keywords', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'ad-copy-gen', title: 'Ad Generator Agent', description: 'Creates variations of ad copy (Google, Facebook etc.) based on product details.', icon: 'solar:pen-new-square-linear', isEnabled: false, status: 'Idle', badge: 'NEW', configAction: { label: 'Set Audience & Goals', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'seo-optimizer', title: 'SEO Content Optimizer Agent', description: 'Analyzes content & suggests SEO keyword improvements. Generates meta descriptions.', icon: 'solar:magnifer-zoom-in-linear', isEnabled: false, status: 'Idle', configAction: { label: 'Analyze Page / Set Keywords', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'product-tagger', title: 'Automated Product Tagger Agent', description: 'Suggests relevant tags & categories for products based on title/description/image.', icon: 'solar:tag-linear', isEnabled: false, status: 'Idle' },
    { id: 'image-background-remover', title: 'AI Image Tool', description: 'Automatically removes or replaces backgrounds from product photos.', icon: 'solar:gallery-edit-broken', isEnabled: false, status: 'Idle' },
    { id: 'inventory-forecaster', title: 'Inventory Forecaster Agent', description: 'Predicts future stock needs based on sales data, seasonality, and trends.', icon: 'solar:chart-line-broken', isEnabled: false, status: 'Idle', configAction: { label: 'Connect Data / View Forecast', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'churn-predictor', title: 'Customer Churn Predictor AI', description: 'Identifies customers at high risk of churning based on behavior patterns.', icon: 'solar:user-minus-broken', isEnabled: false, status: 'Idle', configAction: { label: 'View At-Risk Customers', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'influencer-ai', title: 'Influencer Discovery Agent', description: 'Identifies potential social media influencers based on custom criteria.', icon: 'solar:users-group-two-rounded-broken', isEnabled: true, status: 'Running', configAction: { label: 'Configure Criteria', onPress: (id) => alert(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'dynamic-pricing-ai', title: 'Dynamic Pricing Assistant AI', description: 'Suggests optimal price adjustments based on demand, competition, and inventory.', icon: 'solar:graph-up-linear', isEnabled: false, status: 'Idle', badge: 'COMING SOON' }
];


// Status color mapping - Remains the same
const statusColorMap: Record<Required<AIJob>['status'], "default" | "primary" | "success" | "warning" | "danger"> = {
    'Idle': 'default',
    'Running': 'primary',
    'Completed': 'success',
    'Error': 'danger',
};

// Badge color mapping - Remains the same
const badgeColorMap: Record<Required<AIJob>['badge'], "secondary" | "danger" | "warning" | "default"> = {
    'NEW': 'secondary',
    'HOT': 'danger',
    'TRENDING': 'warning',
    'COMING SOON': 'default',
};


// --- Hooks ---

// Hook to simulate fetching jobs and handle loading state
const useFetchJobs = (initialData: AIJob[]) => {
    const [jobs, setJobs] = useState<AIJob[]>([]); // Start with empty array
    const [isLoading, setIsLoading] = useState(true); // Start loading

    useEffect(() => {
        setIsLoading(true); // Ensure loading is true when effect runs
        // Simulate API call delay
        const timer = setTimeout(() => {
            // In a real app: fetch('/api/ai-jobs').then(res => res.json()).then(data => setJobs(data));

            // Load persisted enabled state *after* getting initial data
            if (typeof window !== 'undefined') {
                const storedState = localStorage.getItem('aiJobEnabledState_v2');
                const enabledMap: Record<string, boolean> = storedState ? JSON.parse(storedState) : {};
                const mergedData = initialData.map(job => ({
                    ...job,
                    isEnabled: enabledMap[job.id] !== undefined ? enabledMap[job.id] : job.isEnabled
                }));
                setJobs(mergedData);
            } else {
                setJobs(initialData); // Fallback for SSR or if localStorage fails
            }

            setIsLoading(false); // Set loading to false after data is processed
        }, 1500); // Simulate 1.5 second load time

        return () => clearTimeout(timer); // Cleanup timer on unmount
    // IMPORTANT: Empty dependency array means this runs only once on mount.
    // If initialData could change, add it to dependencies, but be mindful of re-fetching.
    }, []);

    // Function to update jobs and persist the enabled state
    const updateAndPersistJobs = useCallback((updater: React.SetStateAction<AIJob[]>) => {
        setJobs(currentJobs => {
            // Calculate the new state based on the updater function or value
            const newJobs = typeof updater === 'function' ? updater(currentJobs) : updater;

            // Persist the enabled state of the new jobs array
            if (typeof window !== 'undefined') {
                 const enabledMap = newJobs.reduce((acc, job) => {
                     acc[job.id] = job.isEnabled;
                     return acc;
                 }, {} as Record<string, boolean>);
                 localStorage.setItem('aiJobEnabledState_v2', JSON.stringify(enabledMap));
            }
            return newJobs; // Return the new state
        });
    }, []); // No dependencies needed for the setter wrapper

    return { jobs, setJobs: updateAndPersistJobs, isLoading };
};



// --- Component ---
export default function AIJobTrackerComponent() {
  // Use the fetch hook which now includes persistence logic
  const { jobs: aiJobs, setJobs: setAiJobs, isLoading } = useFetchJobs(initialAIJobs);

  // Handler to toggle the enabled state of a job
  const handleToggleEnable = useCallback((jobId: string, isEnabled: boolean) => {
    // Use the setter from the hook, which handles persistence
    setAiJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isEnabled } : job
      )
    );
    console.log(`Toggled ${jobId} to ${isEnabled ? 'enabled' : 'disabled'}`);
  }, [setAiJobs]); // Dependency on the setter from the hook

  // Placeholder handler for viewing logs
  const handleViewLogs = (jobId: string) => {
      alert(`Viewing logs for job: ${jobId}`);
      // TODO: Implement log viewing logic
  };

    // Helper to make Enter/Space activate the card
    const makeKeyDown =
    (jobId: string, disabled: boolean) =>
    (e: KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        handleViewLogs(jobId);
      }
    };

  // --- Skeleton Card Component ---
  const JobCardSkeleton = () => (
      <Card shadow="sm" className="flex flex-col bg-content1 border border-divider min-h-[180px]"> {/* Added min-height */}
          <CardHeader className="flex justify-between items-start gap-3 p-4">
              {/* Left side skeleton */}
              <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-7 w-7 rounded-md flex-shrink-0" />
                  <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-4 w-3/5 rounded-lg" />
                      <Skeleton className="h-3 w-2/5AI Job  rounded-lg" />
                  </div>
              </div>
              {/* Right side skeleton (Switch) */}
              <Skeleton className="h-6 w-10 rounded-full flex-shrink-0" />
          </CardHeader>
          <CardBody className="px-4 pt-0 pb-2 flex-grow space-y-2">
              <Skeleton className="h-3 w-full rounded-lg" />
              <Skeleton className="h-3 w-4/5 rounded-lg" />
          </CardBody>
          <CardFooter className="flex justify-between items-center p-4 pt-2">
              {/* Left side skeleton (Chip) */}
              <Skeleton className="h-6 w-16 rounded-full" />
              {/* Right side skeleton (Buttons) */}
              <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
          </CardFooter>
      </Card>
  );

 
  
    return (
      <div className="space-y-6 py-8 px-4 md:px-6 bg-background text-foreground">
        <div className="flex items-center justify-between mb-6">
          {isLoading ? (
            <Skeleton className="h-8 w-48 rounded-lg" />
          ) : (
            <h2 className="text-2xl font-bold">AI AGENTS</h2>
          )}
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
            : aiJobs.map((job) => {
                const isComingSoon = job.badge === 'COMING SOON';
                const disabled = !job.isEnabled || isComingSoon;
  
                return (
                  <div
                    key={job.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => !disabled && handleViewLogs(job.id)}
                    onKeyDown={makeKeyDown(job.id, disabled)}
                    className={`outline-none focus:ring transition duration-200 ${
                      disabled
                        ? 'opacity-60 pointer-events-none'
                        : 'hover:ring-primary/50'
                    }`}
                  >
                    <Card shadow="sm" className="flex flex-col bg-content1 border border-divider">
                      <CardHeader className="flex justify-between items-start gap-3 p-4">
                        <div className="flex items-center gap-3">
                          <Icon
                            icon={job.icon}
                            width={28}
                            className={disabled ? 'text-default-400' : 'text-primary'}
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{job.title}</span>
                              {job.badge && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={badgeColorMap[job.badge] || 'default'}
                                  className="h-5"
                                >
                                  {job.badge}
                                </Chip>
                              )}
                            </div>
                            <span className="text-xs text-foreground-500 mt-0.5">
                              {isComingSoon
                                ? 'Coming Soon!'
                                : job.isEnabled
                                ? job.lastRun
                                  ? `Last run: ${job.lastRun}`
                                  : 'Enabled'
                                : 'Disabled'}
                            </span>
                          </div>
                        </div>
                        <Tooltip
                          content={isComingSoon ? 'Coming Soon' : job.isEnabled ? 'Disable Job' : 'Enable Job'}
                          placement="top"
                        >
                          <div className={disabled ? 'pointer-events-auto' : ''}>
                            <Switch
                              aria-label={`Enable or disable ${job.title}`}
                              isSelected={job.isEnabled}
                              isDisabled={isComingSoon}
                              onValueChange={(sel) => handleToggleEnable(job.id, sel)}
                              size="sm"
                              classNames={{
                                wrapper: ['group-data-[selected=true]:bg-orange-600']
                              }}
                            />
                          </div>
                        </Tooltip>
                      </CardHeader>
  
                      <CardBody className="px-4 pt-0 pb-2 flex-grow">
                        <p className="text-sm text-foreground-600">{job.description}</p>
                      </CardBody>
  
                      <CardFooter className="flex justify-between items-center p-4 pt-2">
                        {job.status && job.isEnabled && !isComingSoon ? (
                          <Chip size="sm" variant="flat" color={statusColorMap[job.status]}>
                            {job.status}
                          </Chip>
                        ) : (
                          <div className="h-[24px]" />
                        )}
  
                        <div className="flex items-center gap-1">
                          {job.configAction && (
                            <Tooltip content={job.configAction.label} placement="top">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                isDisabled={disabled}
                                onPress={() => job.configAction!.onPress(job.id)}
                                aria-label={job.configAction.label}
                              >
                                <Icon icon={job.configAction.icon!} width={18} />
                              </Button>
                            </Tooltip>
                          )}
  
                          <Button
                            size="sm"
                            variant="light"
                            startContent={<Icon icon="solar:document-text-linear" width={16} />}
                            isDisabled={disabled}
                            onPress={() => handleViewLogs(job.id)}
                            className="text-primary/80 hover:text-primary hover:bg-primary/10"
                          >
                            View Logs
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                );
              })}
        </div>
      </div>
    );
  }
  
        