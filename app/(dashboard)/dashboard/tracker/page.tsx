"use client";

import React, { useState, useCallback } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Button,
    Switch,
    Chip, // Using Chip for status/tags
    Tooltip // Added Tooltip for icons/buttons
} from '@heroui/react'; // Adjust import path if needed
import { Icon } from '@iconify/react';

// Define the structure for an AI Job
interface AIJob {
  id: string; // Use string IDs for better key handling
  title: string;
  description: string;
  icon: string; // Iconify icon name
  isEnabled: boolean;
  status?: 'Idle' | 'Running' | 'Error' | 'Completed'; // Optional: add runtime status
  lastRun?: string; // Optional: timestamp of last execution
}

// Predefined list of AI Jobs
const initialAIJobs: AIJob[] = [
  { id: 'abandoned-cart', title: 'Abandoned Cart AI', description: 'Automatically sends recovery emails for abandoned carts.', icon: 'solar:cart-large-minimalistic-broken', isEnabled: true, status: 'Idle', lastRun: '2025-05-03 10:00' },
  { id: 'welcome-email', title: 'Welcome Email AI', description: 'Sends personalized welcome emails to new subscribers.', icon: 'solar:letter-opened-broken', isEnabled: true, status: 'Completed', lastRun: '2025-05-04 09:15' },
  { id: 'coupon-generator', title: 'Coupon Generator AI', description: 'Generates unique discount codes for campaigns.', icon: 'solar:ticket-sale-broken', isEnabled: false, status: 'Idle' },
  { id: 'influencer-ai', title: 'Influencer AI', description: 'Identifies potential influencers based on criteria.', icon: 'solar:users-group-two-rounded-broken', isEnabled: true, status: 'Running' },
  { id: 'tiktok-reels', title: 'TikTok/Reels Maker AI', description: 'Generates short video ideas or drafts for social media.', icon: 'solar:videocamera-record-broken', isEnabled: false, status: 'Idle' },
  { id: 'product-desc', title: 'Product Description AI', description: 'Writes compelling descriptions for new products.', icon: 'solar:document-text-broken', isEnabled: true, status: 'Error', lastRun: '2025-05-01 15:30' },
];

// Mapping for status colors (using HeroUI/NextUI color names)
const statusColorMap: Record<Required<AIJob>['status'], "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
    'Idle': 'default',
    'Running': 'primary',
    'Completed': 'success',
    'Error': 'danger',
};


export default function AIJobTrackerComponent() {
  // State to manage the AI jobs (including their enabled status)
  const [aiJobs, setAiJobs] = useState<AIJob[]>(initialAIJobs);

  // Handler to toggle the enabled state of a job
  const handleToggleEnable = useCallback((jobId: string, isEnabled: boolean) => {
    setAiJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isEnabled } : job
      )
    );
    // TODO: Add API call here to persist the change on the backend
    console.log(`Toggled ${jobId} to ${isEnabled ? 'enabled' : 'disabled'}`);
  }, []);

  // Placeholder handler for viewing logs
  const handleViewLogs = (jobId: string) => {
      alert(`Viewing logs for job: ${jobId}`);
      // TODO: Implement log viewing logic (e.g., open modal, navigate)
  };

  return (
    <div className="space-y-6 py-8 px-4 md:px-6"> {/* Added padding */}
      {/* Header */}
      <div className="flex items-center justify-between mb-6"> {/* Added margin-bottom */}
        <h2 className="text-2xl font-bold text-default-800">AI Job Tracker</h2>
        {/* Removed Add button as jobs are predefined */}
      </div>

      {/* Grid of AI Job cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiJobs.map((job) => (
          <Card
            key={job.id}
            shadow="sm"
            // Apply disabled styling conditionally
            className={`flex flex-col transition-opacity duration-300 ${!job.isEnabled ? 'opacity-60 grayscale pointer-events-none' : ''}`} // Added pointer-events-none
          >
            <CardHeader className="flex justify-between items-start gap-3 p-4"> {/* Adjusted padding and gap */}
              {/* Left side: Icon and Title */}
              <div className="flex items-center gap-3">
                 <Icon icon={job.icon} width={28} className={job.isEnabled ? "text-primary" : "text-default-400"} />
                 <div className="flex flex-col">
                    <span className="font-semibold text-default-700">{job.title}</span>
                    {/* Optional: Show last run time or disabled status */}
                    {job.isEnabled ? (
                        job.lastRun && <span className="text-xs text-default-500">Last run: {job.lastRun}</span>
                    ) : (
                        <span className="text-xs font-medium text-default-500">Disabled</span>
                    )}
                 </div>
              </div>
               {/* Right side: Enable/Disable Switch */}
               <Tooltip content={job.isEnabled ? "Disable Job" : "Enable Job"} placement="top">
                   {/* Wrap Switch in a div to prevent pointer-events from Card disabling it */}
                   <div className={`${!job.isEnabled ? 'pointer-events-auto' : ''}`}>
                       <Switch
                         aria-label={`Enable or disable ${job.title}`}
                         isSelected={job.isEnabled}
                         onValueChange={(isSelected) => handleToggleEnable(job.id, isSelected)}
                         size="sm"
                       />
                   </div>
               </Tooltip>
            </CardHeader>

            <CardBody className="px-4 pt-0 pb-2 flex-grow"> {/* Adjusted padding and added flex-grow */}
              <p className="text-sm text-default-600">{job.description}</p>
            </CardBody>

            <CardFooter className="flex justify-between items-center p-4 pt-2"> {/* Adjusted padding */}
               {/* Left side: Status Chip */}
               {job.status && job.isEnabled ? (
                   <Chip
                      size="sm"
                      variant="flat"
                      color={statusColorMap[job.status] || 'default'}
                    >
                      {job.status}
                    </Chip>
               ) : (
                   // Placeholder or empty div to maintain layout when disabled or no status
                   <div className="h-[24px]"></div> // Adjust height to match Chip height
               )}

              {/* Right side: View Logs Button */}
              {/* Wrap Button in a div to prevent pointer-events from Card disabling it */}
               <div className={`${!job.isEnabled ? 'pointer-events-auto' : ''}`}>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => handleViewLogs(job.id)}
                    // Disable button logically if job is disabled, but allow click visually
                    isDisabled={!job.isEnabled}
                    startContent={<Icon icon="solar:document-text-linear" width={16} />}
                  >
                    View Logs
                  </Button>
               </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
