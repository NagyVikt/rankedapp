"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Badge,
  Input,
  Autocomplete,
  AutocompleteItem,
  Image,
  // Spinner, // Spinner import is commented out as per the provided code
} from '@heroui/react'; // Adjust import path if needed
import { Icon } from '@iconify/react';
import countries from './countries'; // Assuming this file exists and exports country data





// Define fetcher for SWR
// This function fetches data from the given URL.
// It includes credentials in the request and throws an error if the response is not ok.
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => {
    if (!r.ok) {
        // If the response status is not OK, throw an error.
        throw new Error(`HTTP error! status: ${r.status}`);
    }
    // Otherwise, parse the response as JSON.
    return r.json();
});

// Define the User type more explicitly based on expected API response
// This interface describes the structure of a user object.
interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string; // Optional: URL for the user's avatar image
  firstName?: string; // Optional: User's first name
  lastName?: string;  // Optional: User's last name
  phoneNumber?: string; // Optional: User's phone number
  countryCode?: string; // Optional: User's country code (e.g., 'US', 'GB')
  state?: string;       // Optional: User's state or province
  address?: string;     // Optional: User's street address
  zipCode?: string;     // Optional: User's zip or postal code
}


// Define your country type
interface Country {
  code: string;
  name: string;
}

// --- Skeleton Components (Defined within this file) ---

// SimpleSkeleton component displays a placeholder for loading content.
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}></div>
);

const CardX = Card as any;
const CardHeaderX = CardHeader as any;
const CardBodyX = CardBody as any;
const ButtonX = Button as any;
const ImageX = Image as any;
const AutocompleteItemX = AutocompleteItem as any;
const AutocompleteX = Autocomplete as any;
const InputX = Input as any;
const SimpleSkeletonX = SimpleSkeleton as any;
const AvatarX = Avatar as any;
const BadgeX = Badge as any;


// AccountDetailsSkeleton component displays a structured placeholder for the account details section while loading.
const AccountDetailsSkeleton = ({ className }: { className?: string }) => (
  // Apply className prop to the outer div
  <div className={`space-y-6 max-w-xl p-2 ${className}`}> {/* Added max-w and padding to match card */}
    {/* Header Skeleton */}
    <div className="flex flex-col items-start px-4 pb-0 pt-4"> {/* Mimic CardHeader */}
        <SimpleSkeletonX className="h-6 w-40 rounded mb-4" /> {/* Title "Account Details" */}
        <div className="flex items-center gap-4 py-4">
            <SimpleSkeletonX className="h-14 w-14 rounded-full" /> {/* Avatar placeholder */}
            <div className="flex flex-col gap-1.5">
                <SimpleSkeletonX className="h-5 w-32 rounded" /> {/* Name placeholder */}
                <SimpleSkeletonX className="h-4 w-24 rounded" /> {/* Role placeholder */}
            </div>
        </div>
        <SimpleSkeletonX className="h-4 w-3/4 rounded" /> {/* Description line placeholder */}
    </div>

    {/* Form Skeleton */}
    <div className="space-y-4 px-4"> {/* Mimic CardBody padding */}
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Row 2 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Row 3 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Row 4 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Zip Code (Single Column) */}
       <div className="w-full md:w-1/2 pr-2"> {/* Match grid gap */}
         <div className="space-y-1.5">
              <SimpleSkeletonX className="h-4 w-20 rounded" /> {/* Label placeholder */}
              <SimpleSkeletonX className="h-10 w-full rounded" /> {/* Input placeholder */}
          </div>
       </div>
    </div>

     {/* Buttons Skeleton */}
     <div className="flex justify-end gap-2 pt-2 px-4 pb-4"> {/* Reduced top padding, added horizontal/bottom padding */}
        <SimpleSkeletonX className="h-9 w-20 rounded-full" /> {/* Button placeholder */}
        <SimpleSkeletonX className="h-9 w-28 rounded-full" /> {/* Button placeholder */}
     </div>
  </div>
);
// --- End Skeleton Components ---

const AccountDetailsSkeletonX = AccountDetailsSkeleton as any;

// Define props if any are passed from a parent component (e.g., className for styling)
interface AccountDetailsProps {
    className?: string; // Optional className prop
}

// AccountDetails component is the main component for displaying and editing user account information.
export default function AccountDetails({ className }: AccountDetailsProps) {
  // Fetch user data using SWR (stale-while-revalidate)
  // It fetches from '/api/user' using the defined 'fetcher'.
  // 'suspense: false' means we handle loading state manually.
  const { data, error, mutate } = useSWR<{ user: User }>(
      '/api/user', // API endpoint to fetch user data
      fetcher,
      { suspense: false } // Disable SWR suspense to manually handle loading states
  );
  const isLoading = !data && !error; // Determine loading state: true if no data and no error yet
  const user = data?.user; // Extract user object from the fetched data

  // State for managing the avatar upload modal/panel
  const [showUpload, setShowUpload] = useState(false); // Controls visibility of the upload panel
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Stores the selected image file
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Stores the URL for the image preview
  const [isDragging, setIsDragging] = useState(false); // Tracks if a file is being dragged over the drop area
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input element

  // useEffect hook to create and revoke object URL for image preview
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null); // If no file selected, clear preview
      return;
    }
    // Create an object URL for the selected file to display a preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup function: revoke the object URL when the component unmounts or selectedFile changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]); // Dependency array: effect runs when selectedFile changes

  // Drag and Drop Event Handlers
  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default browser behavior (e.g., opening the file)
    e.stopPropagation(); // Stop the event from bubbling up
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    setIsDragging(true); // Set dragging state to true
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    // Only set dragging to false if the mouse leaves the drop area entirely, not just child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    setIsDragging(true); // Keep dragging state true while over the area
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    setIsDragging(false); // Reset dragging state
    const files = e.dataTransfer.files; // Get dropped files
    if (files && files.length > 0) {
        const file = files[0];
        if (file && file.type.startsWith('image/')) { // Check if the dropped file is an image
            setSelectedFile(file);
        } else {
            alert("Please drop an image file."); // Alert if not an image
            setSelectedFile(null);
        }
    }
  };

  // File Input Change Handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const file = files[0];
        if (file && file.type.startsWith('image/')) { // Check if selected file is an image
            setSelectedFile(file);
        } else {
            alert("Please select an image file."); // Alert if not an image
            setSelectedFile(null);
            if (fileInputRef.current) { // Reset file input value
                fileInputRef.current.value = "";
            }
        }
    }
  };

  // Click Handler for Drop Area (to trigger file input)
  const handleAreaClick = () => {
    fileInputRef.current?.click(); // Programmatically click the hidden file input
  };

  // Handler to Remove Image Preview
  const handleRemovePreview = () => {
    setSelectedFile(null); // Clear selected file
    if (fileInputRef.current) { // Reset file input value
        fileInputRef.current.value = "";
    }
  };

  // Placeholder for Upload Logic
  const handleUpload = async () => {
    if (!selectedFile) return;
    // In a real application, this would involve sending the file to a server
    alert(`Simulating upload for: ${selectedFile.name}`);
    // TODO: Implement actual file upload logic here (e.g., using FormData and fetch)
    // After successful upload, you might want to mutate the SWR data to update the avatarUrl
    // mutate({ ...data, user: { ...user, avatarUrl: newImageUrl } });
    setShowUpload(false); // Close the upload panel
  };

  // Placeholder for Form Submit Logic
  const handleDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    // In a real application, gather form data and send it to an API endpoint
    alert('Simulating saving details...');
    // TODO: Implement actual form submission logic here
    // const formData = new FormData(event.currentTarget);
    // const updatedUserDetails = Object.fromEntries(formData.entries());
    // await fetch('/api/user', { method: 'PUT', body: JSON.stringify(updatedUserDetails) });
    // mutate(); // Revalidate SWR data
  };

  // Helper function to safely get user values, providing a fallback for undefined properties
  const getUserValue = (key: keyof User) => user?.[key] ?? '';


  // --- Render Loading State using Skeleton ---
  if (isLoading) {
    // Render the specific skeleton for this section
    // Pass the className prop down to the skeleton wrapper
    return <AccountDetailsSkeletonX className={className} />;
  }

  // --- Render Error State ---
  if (error) {
      return (
          <div className={`p-4 text-danger text-center ${className}`}>
              Error loading account details: {error.message}. Please try refreshing.
          </div>
      );
  }

  // --- Render "No User Data" State ---
   if (!user) {
       // Handle case where data is fetched but user is null/undefined
       // This indicates an issue with the API response or data structure
       return <div className={`p-4 text-warning text-center ${className}`}>Could not retrieve user information.</div>;
   }


  // --- Render Account Details Card ---
  return (
    <>
      <CardX className="max-w-xl p-2">
        <CardHeaderX className="flex flex-col items-start px-4 pb-0 pt-4">
          <p className="text-large font-medium">Account Details</p>
          <div className="flex items-center gap-4 py-4">
            <BadgeX
              showOutline
              classNames={{ badge: 'w-5 h-5 bg-primary border-primary' }}
              content={
                <ButtonX
                  isIconOnly
                  className="h-5 w-5 min-w-0 bg-primary text-primary-foreground"
                  radius="full"
                  size="sm"
                  variant="solid"
                  aria-label="Edit profile picture"
                  onPress={() => setShowUpload(true)}
                >
                  <Icon icon="solar:pen-2-linear" width={12} />
                </ButtonX>
              }
              placement="bottom-right"
              shape="circle"
            >
              <AvatarX
                className="h-14 w-14 text-large"
                src={getUserValue('avatarUrl')}
                name={!getUserValue('avatarUrl') ? getUserValue('name') : undefined}
              />
            </BadgeX>
            <div className="flex flex-col">
              <p className="font-medium">{getUserValue('name')}</p>
              <span className="text-small text-default-500">{getUserValue('role')}</span>
            </div>
          </div>
          <p className="text-small text-default-400">
            The photo will be used for your profile, and will be visible to other users of the platform.
          </p>
        </CardHeaderX>

        <CardBodyX>
          <form onSubmit={handleDetailsSubmit}>
            <div className="grid w-full grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
              <InputX
                isRequired
                name="name"
                label="Username"
                labelPlacement="outside"
                placeholder="Enter username"
                defaultValue={getUserValue('name')}
              />
              <InputX
                isRequired
                name="email"
                label="Email"
                labelPlacement="outside"
                type="email"
                defaultValue={getUserValue('email')}
                readOnly
                description="Email cannot be changed here."
              />
              <AutocompleteX<Country>
                isRequired
                name="countryCode"
                defaultItems={countries}
                label="Country"
                labelPlacement="outside"
                placeholder="Select country"
                defaultSelectedKey={getUserValue('countryCode')}
                aria-label="Select your country"
              >
                {(item: Country) => (
                  <AutocompleteItemX
                    key={item.code}
                    value={item.code}
                    startContent={<AvatarX alt="Country Flag" src={`https://flagcdn.com/${item.code.toLowerCase()}.svg`} />}
                  >
                    {item.name}
                  </AutocompleteItemX>
                )}
              </AutocompleteX>
            </div>
            <div className="mt-6 flex w-full justify-end gap-2">
              <ButtonX radius="full" variant="bordered" type="button" onPress={() => console.log('Cancel')}>
                Cancel
              </ButtonX>
              <ButtonX color="primary" radius="full" type="submit">
                Save Changes
              </ButtonX>
            </div>
          </form>
        </CardBodyX>
      </CardX>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <CardX className="relative w-full max-w-md p-6">
            <ButtonX
              isIconOnly
              aria-label="Close upload panel"
              className="absolute right-3 top-3"
              radius="full"
              size="sm"
              variant="flat"
              onPress={() => setShowUpload(false)}
            >
              <Icon icon="iconamoon:close-thin" width={20} />
            </ButtonX>
            <CardBodyX>
              <h3 className="text-xl font-semibold mb-4 text-center">
                Upload New Profile Picture
              </h3>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer"
                onClick={handleAreaClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAreaClick(); }}
              >
                {previewUrl && selectedFile ? (
                  <ImageX
                    src={previewUrl}
                    alt="Selected preview"
                    width={128}
                    height={128}
                  />
                ) : (
                  <>
                    <Icon icon="solar:cloud-upload-outline" width={48} />
                    <p className="mt-2">Drag & drop or click to upload</p>
                  </>
                )}
              </div>
              <ButtonX
                fullWidth
                color="primary"
                className="mt-4"
                onPress={handleUpload}
                isDisabled={!selectedFile}
              >
                Upload Picture
              </ButtonX>
            </CardBodyX>
          </CardX>
        </div>
      )}
    </>
  );
}