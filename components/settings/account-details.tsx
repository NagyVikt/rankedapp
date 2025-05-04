// app/dashboard/settings/account-details.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import {
  Card, // Keep Card if used internally, otherwise can remove if parent provides it
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Badge,
  Input,
  Autocomplete,
  AutocompleteItem,
  Image,
  // Spinner, // Removed Spinner import
} from '@heroui/react'; // Adjust import path if needed
import { Icon } from '@iconify/react';
import countries from './countries'; // Assuming this file exists and exports country data

// Define fetcher for SWR
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => {
    if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`);
    }
    return r.json();
});

// Define the User type more explicitly based on expected API response
interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string; // Example: 'US', 'GB'
  state?: string;
  address?: string;
  zipCode?: string;
}

// --- Skeleton Components (Defined within this file) ---
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const AccountDetailsSkeleton = ({ className }: { className?: string }) => (
  // Apply className prop to the outer div
  <div className={`space-y-6 max-w-xl p-2 ${className}`}> {/* Added max-w and padding to match card */}
    {/* Header Skeleton */}
    <div className="flex flex-col items-start px-4 pb-0 pt-4"> {/* Mimic CardHeader */}
        <SimpleSkeleton className="h-6 w-40 rounded mb-4" /> {/* Title "Account Details" */}
        <div className="flex items-center gap-4 py-4">
            <SimpleSkeleton className="h-14 w-14 rounded-full" />
            <div className="flex flex-col gap-1.5">
                <SimpleSkeleton className="h-5 w-32 rounded" /> {/* Name */}
                <SimpleSkeleton className="h-4 w-24 rounded" /> {/* Role */}
            </div>
        </div>
        <SimpleSkeleton className="h-4 w-3/4 rounded" /> {/* Description line */}
    </div>

    {/* Form Skeleton */}
    <div className="space-y-4 px-4"> {/* Mimic CardBody padding */}
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" />
            <SimpleSkeleton className="h-10 w-full rounded" />
        </div>
      </div>
       {/* Row 2 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" />
            <SimpleSkeleton className="h-10 w-full rounded" />
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" />
            <SimpleSkeleton className="h-10 w-full rounded" />
        </div>
      </div>
       {/* Row 3 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" />
            <SimpleSkeleton className="h-10 w-full rounded" />
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" />
            <SimpleSkeleton className="h-10 w-full rounded" />
        </div>
      </div>
       {/* Row 4 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" />
            <SimpleSkeleton className="h-10 w-full rounded" />
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" />
            <SimpleSkeleton className="h-10 w-full rounded" />
        </div>
      </div>
       {/* Zip Code (Single Column) */}
       <div className="w-full md:w-1/2 pr-2"> {/* Match grid gap */}
         <div className="space-y-1.5">
              <SimpleSkeleton className="h-4 w-20 rounded" />
              <SimpleSkeleton className="h-10 w-full rounded" />
          </div>
       </div>
    </div>

     {/* Buttons Skeleton */}
     <div className="flex justify-end gap-2 pt-2 px-4 pb-4"> {/* Reduced top padding, added horizontal/bottom padding */}
        <SimpleSkeleton className="h-9 w-20 rounded-full" />
        <SimpleSkeleton className="h-9 w-28 rounded-full" />
     </div>
  </div>
);
// --- End Skeleton Components ---


// Define props if any are passed from SettingsComponent (e.g., className)
interface AccountDetailsProps {
    className?: string;
}

export default function AccountDetails({ className }: AccountDetailsProps) {
  // Use the User interface with useSWR
  const { data, error, mutate } = useSWR<{ user: User }>(
      '/api/user', // Replace with your actual API endpoint
      fetcher,
      { suspense: false } // Set suspense: false to handle loading state manually
  );
  const isLoading = !data && !error; // SWR's loading state
  const user = data?.user;

  // (Keep other state hooks: showUpload, selectedFile, previewUrl, etc.)
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // (Keep useEffect for preview URL)
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // (Keep Drag and Drop Handlers: preventDefaults, handleDragEnter, etc.)
    const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        preventDefaults(e);
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        preventDefaults(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        preventDefaults(e);
        setIsDragging(true);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        preventDefaults(e);
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
            } else {
                alert("Please drop an image file.");
                setSelectedFile(null);
            }
        }
    };
  // (Keep File Input Handlers: handleFileChange, handleAreaClick, etc.)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
            } else {
                alert("Please select an image file.");
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };
    const handleAreaClick = () => {
        fileInputRef.current?.click();
    };
    const handleRemovePreview = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
  // (Keep Upload Logic Placeholder: handleUpload)
    const handleUpload = async () => {
        if (!selectedFile) return;
        alert(`Simulating upload for: ${selectedFile.name}`);
        setShowUpload(false);
    };
  // (Keep Form Submit Handler Placeholder: handleDetailsSubmit)
    const handleDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert('Simulating saving details...');
    };
  // (Keep getUserValue helper)
    const getUserValue = (key: keyof User) => user?.[key] ?? '';


  // --- Render Loading State using Skeleton ---
  if (isLoading) {
    // Render the specific skeleton for this section
    // Pass the className prop down to the skeleton wrapper
    return <AccountDetailsSkeleton className={className} />;
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
       return <div className={`p-4 text-warning text-center ${className}`}>Could not retrieve user information.</div>;
   }


  // --- Render Account Details Card ---
  return (
    <>
      {/* Apply className prop to the Card */}
      <Card className={`max-w-xl p-2 ${className}`}>
         <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
          <p className="text-large font-medium">Account Details</p>
          <div className="flex items-center gap-4 py-4">
              <Badge
                showOutline
                classNames={{ badge: 'w-5 h-5 bg-primary border-primary' }}
                content={
                    <Button
                        isIconOnly
                        className="h-5 w-5 min-w-0 bg-primary text-primary-foreground"
                        radius="full"
                        size="sm"
                        variant="solid"
                        aria-label="Edit profile picture"
                        onPress={() => {
                           setSelectedFile(null);
                           setShowUpload(true);
                        }}
                    >
                        <Icon icon="solar:pen-2-linear" width={12} />
                    </Button>
                }
                placement="bottom-right"
                shape="circle"
              >
                <Avatar
                  className="h-14 w-14 text-large"
                  src={user.avatarUrl} // Use directly now that user is guaranteed
                  name={!user.avatarUrl ? getUserValue('name') : undefined}
                />
              </Badge>
              <div className="flex flex-col">
                <p className="font-medium">{getUserValue('name')}</p>
                <span className="text-small text-default-500">{getUserValue('role')}</span>
              </div>
          </div>
          <p className="text-small text-default-400">
            The photo will be used for your profile, and will be visible to other users of the
            platform.
          </p>
        </CardHeader>

        <CardBody>
          {/* Form is now guaranteed to have user data */}
            <form onSubmit={handleDetailsSubmit}>
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
                <Input isRequired name="name" label="Username" labelPlacement="outside" placeholder="Enter username" defaultValue={getUserValue('name')} />
                <Input isRequired name="email" label="Email" labelPlacement="outside" placeholder="Enter email" type="email" defaultValue={getUserValue('email')} readOnly description="Email cannot be changed here." />
                <Input isRequired name="firstName" label="First Name" labelPlacement="outside" placeholder="Enter first name" defaultValue={getUserValue('firstName')} />
                <Input isRequired name="lastName" label="Last Name" labelPlacement="outside" placeholder="Enter last name" defaultValue={getUserValue('lastName')} />
                <Input isRequired name="phoneNumber" label="Phone Number" labelPlacement="outside" placeholder="Enter phone number" type="tel" defaultValue={getUserValue('phoneNumber')} />
                <Autocomplete
                  isRequired
                  name="countryCode"
                  defaultItems={countries}
                  label="Country"
                  labelPlacement="outside"
                  placeholder="Select country"
                  showScrollIndicators={false}
                  defaultSelectedKey={getUserValue('countryCode')}
                  aria-label="Select your country"
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.code}
                      value={item.code}
                      startContent={<Avatar alt="Country Flag" className="h-6 w-6 text-tiny" name={item.code} src={`https://flagcdn.com/${item.code.toLowerCase()}.svg`} />}
                    >
                      {item.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <Input isRequired name="state" label="State / Province" labelPlacement="outside" placeholder="Enter state or province" defaultValue={getUserValue('state')} />
                <Input isRequired name="address" label="Address" labelPlacement="outside" placeholder="Enter street address" defaultValue={getUserValue('address')} />
                <div className="md:col-span-1">
                   <Input isRequired name="zipCode" label="Zip / Postal Code" labelPlacement="outside" placeholder="Enter zip code" defaultValue={getUserValue('zipCode')} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex w-full justify-end gap-2">
                <Button radius="full" variant="bordered" type="button" onPress={() => console.log("Cancel clicked - reset form?")}>
                  Cancel
                </Button>
                <Button color="primary" radius="full" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
        </CardBody>
      </Card>

      {/* --- Upload Panel (Modal) --- */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
          <Card className="relative w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            <Button
              isIconOnly
              aria-label="Close upload panel"
              className="absolute right-3 top-3 z-20 bg-background hover:bg-default-100 border border-default-200"
              radius="full"
              size="sm"
              variant="flat"
              onPress={() => setShowUpload(false)}
            >
              <Icon className="text-default-500" icon="iconamoon:close-thin" width={20} />
            </Button>
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Upload New Profile Picture</h3>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden"
              />
               <div
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
                              ${isDragging ? 'border-primary bg-primary-50' : 'border-default-300 hover:border-default-400 bg-default-50/50'}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleAreaClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAreaClick(); }}
                >
                 {previewUrl && selectedFile ? (
                    <div className="text-center">
                      <Image
                        src={previewUrl}
                        alt="Selected preview"
                        width={128}
                        height={128}
                        className="max-h-32 w-auto rounded mb-2 object-contain bg-gray-100"
                      />
                      <p className="text-sm text-default-600 truncate max-w-xs">{selectedFile.name}</p>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={handleRemovePreview}
                        className="mt-2"
                        startContent={<Icon icon="solar:trash-bin-minimalistic-linear" />}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-default-500">
                      <Icon icon="solar:cloud-upload-outline" width={48} className="mx-auto mb-3 text-default-400" />
                      <p className="font-medium">Drag and drop or click here</p>
                      <p className="text-xs mt-1">to upload your image (Max 5MB)</p>
                    </div>
                  )}
               </div>
               <Button
                  fullWidth
                  color="primary"
                  className="mt-4"
                  onPress={handleUpload}
                  isDisabled={!selectedFile}
                  startContent={<Icon icon="solar:upload-linear" />}
                >
                  Upload Picture
                </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
