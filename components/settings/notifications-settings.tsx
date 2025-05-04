// app/dashboard/settings/notifications-settings.tsx
"use client";

import type {CardProps} from "@heroui/react"; // Adjust import path if needed

import React, { useState, useEffect } from "react"; // Added useState, useEffect
// Assuming Card is provided by parent, remove if not needed
import { Card, CardHeader, CardBody, Button, Switch, Spinner } from "@heroui/react"; // Adjust import path if needed
// Import useSWR if you plan to use it for fetching
// import useSWR from 'swr';

// --- Skeleton Components ---
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const NotificationsSettingsSkeleton = ({ className }: { className?: string }) => (
  <div className={`space-y-3 max-w-lg p-2 ${className}`}> {/* Added max-w and padding */}
     {/* Header Skeleton */}
     <div className="px-4 pt-4 pb-0">
       <SimpleSkeleton className="h-5 w-48 rounded mb-1" /> {/* Title */}
       <SimpleSkeleton className="h-4 w-64 rounded mb-4" /> {/* Subtitle */}
     </div>
     {/* Switch Rows Skeleton */}
     <div className="flex flex-col gap-2 px-4">
       {[...Array(7)].map((_, i) => ( // Simulate 7 switch rows
          <div key={i} className="flex justify-between items-center py-2 min-h-[56px]"> {/* Mimic SwitchCell structure + min-height */}
              <div className="flex-grow mr-4 space-y-1.5">
                  <SimpleSkeleton className="h-4 w-24 rounded" /> {/* Label */}
                  <SimpleSkeleton className="h-3 w-40 rounded" /> {/* Description */}
              </div>
              <SimpleSkeleton className="h-6 w-11 rounded-full" /> {/* Switch Skeleton */}
          </div>
       ))}
     </div>
     {/* Buttons Skeleton */}
     <div className="flex justify-end gap-2 pt-4 px-4 pb-4">
        <SimpleSkeleton className="h-9 w-32 rounded" />
        <SimpleSkeleton className="h-9 w-28 rounded" />
     </div>
  </div>
);
// --- End Skeleton Components ---


// --- Reusable Switch Cell Component ---
interface SwitchCellProps {
  label: string;
  description: string;
  // Changed from defaultSelected to isSelected for controlled component
  isSelected: boolean;
  onValueChange: (isSelected: boolean) => void; // Callback to update parent state
  isDisabled?: boolean;
  className?: string;
  name?: string; // Added name for form submission
}

const SwitchCell: React.FC<SwitchCellProps> = ({
  label,
  description,
  isSelected,
  onValueChange,
  isDisabled = false,
  className,
  name,
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 rounded-medium p-3 ${className}`}>
      <div className="flex flex-col gap-1">
        <p className="text-medium">{label}</p>
        <p className="text-small text-default-500">{description}</p>
      </div>
      <Switch
        aria-label={label}
        isSelected={isSelected}
        onValueChange={onValueChange} // Use callback
        isDisabled={isDisabled}
        name={name} // Use name for form data
        value="true" // Set a value for when the switch is 'on' in form data
      />
    </div>
  );
};


// --- Main Notifications Settings Component ---
interface NotificationsSettingsProps {
    className?: string;
}

// Define the structure of your notification settings data
interface NotificationPreferences {
    pauseAll: boolean;
    followers: boolean;
    likes: boolean;
    comments: boolean;
    mentions: boolean;
    messages: boolean;
    friendRequests: boolean;
}

// Example fetcher function (replace with your actual implementation)
// const fetcher = async (url: string): Promise<NotificationPreferences> => {
//     // const res = await fetch(url);
//     // if (!res.ok) throw new Error('Failed to fetch settings');
//     // return res.json();
//
//     // --- Simulated Fetch ---
//     await new Promise(res => setTimeout(res, 1200)); // Simulate delay
//     return { // Example data
//         pauseAll: false,
//         followers: true,
//         likes: true,
//         comments: false,
//         mentions: true,
//         messages: true,
//         friendRequests: false,
//     };
//     // --- End Simulation ---
// };


export default function NotificationsSettings({ className }: NotificationsSettingsProps) {
  // --- State for loading and settings ---
  // Replace with useSWR if using it:
  // const { data: settings, error, isLoading } = useSWR<NotificationPreferences>('/api/user/notifications', fetcher);
  const [settings, setSettings] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const [error, setError] = useState<Error | null>(null);

  // --- Simulate fetching data on mount ---
  useEffect(() => {
      const fetchSettings = async () => {
          setIsLoading(true);
          setError(null);
          try {
              // Replace with actual fetcher call if using SWR or fetch directly
              // const fetchedSettings = await fetcher('/api/user/notifications');

              // --- Simulated Fetch ---
              await new Promise(res => setTimeout(res, 200)); // Simulate delay
              const fetchedSettings: NotificationPreferences = { // Example data
                  pauseAll: false,
                  followers: true,
                  likes: true,
                  comments: false,
                  mentions: true,
                  messages: true,
                  friendRequests: false,
              };
               // --- End Simulation ---

              setSettings(fetchedSettings);
          } catch (fetchError) {
              console.error("Failed to fetch notification settings:", fetchError);
              setError(fetchError as Error);
          } finally {
              setIsLoading(false);
          }
      };

      fetchSettings();
  }, []); // Empty dependency array means run once on mount

  // --- Handler to update individual setting state ---
  const handleSettingChange = (key: keyof NotificationPreferences, value: boolean) => {
      setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  // --- Form Submission Handler ---
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!settings) return; // Don't submit if settings haven't loaded

      console.log("Saving notification settings:", settings);

      // TODO: Implement API call to save the 'settings' state object
      // try {
      //    const response = await fetch('/api/user/notifications', {
      //        method: 'PUT',
      //        headers: { 'Content-Type': 'application/json' },
      //        body: JSON.stringify(settings),
      //    });
      //    if (!response.ok) throw new Error('Failed to save settings');
      //    alert('Notification settings saved!');
      // } catch (saveError) {
      //     console.error("Save error:", saveError);
      //     alert(`Failed to save settings: ${saveError.message}`);
      // }

      alert("Simulating saving notification settings...");
  };

  // --- Reset Handler ---
  const handleReset = () => {
      console.log("Resetting notifications to default...");
      // TODO: Implement logic to fetch/set default settings
      // This might involve calling the fetchSettings function again
      // or having predefined defaults.
      alert("Simulating reset to default...");
      // Example: Refetch data
      // fetchSettings(); // You'd need to extract fetchSettings or use SWR's mutate
  };

  // --- Render Loading State ---
  if (isLoading) {
      return <NotificationsSettingsSkeleton className={className} />;
  }

  // --- Render Error State ---
  if (error) {
      return (
          <div className={`w-full max-w-lg p-4 text-center text-danger ${className}`}>
              Error loading notification settings: {error.message}. Please try refreshing.
          </div>
      );
  }

  // --- Render Content (only if settings loaded) ---
  if (!settings) {
       return (
           <div className={`w-full max-w-lg p-4 text-center text-default-500 ${className}`}>
               Could not load notification settings.
           </div>
       );
  }

  return (
    // Using div instead of Card, assuming parent provides Card structure
    <div className={`w-full max-w-lg p-2 ${className}`}>
      <div className="flex flex-col items-start px-4 pb-0 pt-4"> {/* Mimic CardHeader padding */}
        <p className="text-large font-semibold">Notification Settings</p>
        <p className="text-small text-default-500">Manage your notification preferences</p>
      </div>
      <div className="p-4"> {/* Mimic CardBody padding */}
        {/* Pass settings state down to controlled SwitchCell components */}
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <SwitchCell
            label="Pause all"
            description="Temporarily pause all notifications"
            isSelected={settings.pauseAll}
            onValueChange={(value) => handleSettingChange('pauseAll', value)}
            name="pauseAll" // Name for potential form data capture (though state is primary)
          />
          <SwitchCell
            label="Followers"
            description="Get notified when someone follows you"
            isSelected={settings.followers}
            onValueChange={(value) => handleSettingChange('followers', value)}
            name="followers"
          />
          <SwitchCell
            label="Likes"
            description="Get notified when someone likes your post"
            isSelected={settings.likes}
            onValueChange={(value) => handleSettingChange('likes', value)}
            name="likes"
          />
           <SwitchCell
            label="Comments"
            description="Get notified when someone comments on your post"
            isSelected={settings.comments}
            onValueChange={(value) => handleSettingChange('comments', value)}
            name="comments"
          />
           <SwitchCell
            label="Mentions"
            description="Get notified when someone mentions you in a post"
            isSelected={settings.mentions}
            onValueChange={(value) => handleSettingChange('mentions', value)}
            name="mentions"
          />
           <SwitchCell
            label="Messages"
            description="Get notified when someone sends you a message"
            isSelected={settings.messages}
            onValueChange={(value) => handleSettingChange('messages', value)}
            name="messages"
          />
           <SwitchCell
            label="Friend Requests"
            description="Get notified when someone sends you a friend request"
            isSelected={settings.friendRequests}
            onValueChange={(value) => handleSettingChange('friendRequests', value)}
            name="friendRequests"
          />

          {/* Action Buttons */}
          <div className="flex w-full justify-end gap-2 pt-4">
            <Button type="button" variant="bordered" onPress={handleReset}>Reset to Default</Button>
            <Button color="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div >
  );
}
