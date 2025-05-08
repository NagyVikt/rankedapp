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

// --- Skeleton Components (Defined within this file) ---

// SimpleSkeleton component displays a placeholder for loading content.
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}></div>
);

// AccountDetailsSkeleton component displays a structured placeholder for the account details section while loading.
const AccountDetailsSkeleton = ({ className }: { className?: string }) => (
  // Apply className prop to the outer div
  <div className={`space-y-6 max-w-xl p-2 ${className}`}> {/* Added max-w and padding to match card */}
    {/* Header Skeleton */}
    <div className="flex flex-col items-start px-4 pb-0 pt-4"> {/* Mimic CardHeader */}
        <SimpleSkeleton className="h-6 w-40 rounded mb-4" /> {/* Title "Account Details" */}
        <div className="flex items-center gap-4 py-4">
            <SimpleSkeleton className="h-14 w-14 rounded-full" /> {/* Avatar placeholder */}
            <div className="flex flex-col gap-1.5">
                <SimpleSkeleton className="h-5 w-32 rounded" /> {/* Name placeholder */}
                <SimpleSkeleton className="h-4 w-24 rounded" /> {/* Role placeholder */}
            </div>
        </div>
        <SimpleSkeleton className="h-4 w-3/4 rounded" /> {/* Description line placeholder */}
    </div>

    {/* Form Skeleton */}
    <div className="space-y-4 px-4"> {/* Mimic CardBody padding */}
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Row 2 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Row 3 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Row 4 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
        <div className="space-y-1.5">
            <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
            <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
        </div>
      </div>
       {/* Zip Code (Single Column) */}
       <div className="w-full md:w-1/2 pr-2"> {/* Match grid gap */}
         <div className="space-y-1.5">
              <SimpleSkeleton className="h-4 w-20 rounded" /> {/* Label placeholder */}
              <SimpleSkeleton className="h-10 w-full rounded" /> {/* Input placeholder */}
          </div>
       </div>
    </div>

     {/* Buttons Skeleton */}
     <div className="flex justify-end gap-2 pt-2 px-4 pb-4"> {/* Reduced top padding, added horizontal/bottom padding */}
        <SimpleSkeleton className="h-9 w-20 rounded-full" /> {/* Button placeholder */}
        <SimpleSkeleton className="h-9 w-28 rounded-full" /> {/* Button placeholder */}
     </div>
  </div>
);
// --- End Skeleton Components ---


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
       // This indicates an issue with the API response or data structure
       return <div className={`p-4 text-warning text-center ${className}`}>Could not retrieve user information.</div>;
   }


  // --- Render Account Details Card ---
  return (
    <>
      {/* Apply className prop to the Card for custom styling from parent */}
      <Card className={`max-w-xl p-2 ${className}`}>
         <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
          <p className="text-large font-medium">Account Details</p>
          <div className="flex items-center gap-4 py-4">
              {/* Badge for editing avatar */}
              <Badge
                showOutline
                classNames={{ badge: 'w-5 h-5 bg-primary border-primary' }} // Custom styles for the badge
                content={ // Content of the badge (edit button)
                    <Button
                        isIconOnly // Button with only an icon
                        className="h-5 w-5 min-w-0 bg-primary text-primary-foreground"
                        radius="full"
                        size="sm"
                        variant="solid"
                        aria-label="Edit profile picture"
                        onPress={() => {
                           setSelectedFile(null); // Clear any previously selected file
                           setShowUpload(true); // Open the upload panel
                        }}
                    >
                        <Icon icon="solar:pen-2-linear" width={12} />
                    </Button>
                }
                placement="bottom-right" // Position of the badge relative to the avatar
                shape="circle"
              >
                {/* User Avatar */}
                <Avatar
                  className="h-14 w-14 text-large"
                  src={user.avatarUrl} // Display avatar if URL exists
                  name={!user.avatarUrl ? getUserValue('name') : undefined} // Display initials from name if no avatar URL
                />
              </Badge>
              {/* User Name and Role */}
              <div className="flex flex-col">
                <p className="font-medium">{getUserValue('name')}</p>
                <span className="text-small text-default-500">{getUserValue('role')}</span>
              </div>
          </div>
          {/* Description text */}
          <p className="text-small text-default-400">
            The photo will be used for your profile, and will be visible to other users of the
            platform.
          </p>
        </CardHeader>

        <CardBody>
          {/* Form for editing account details */}
          {/* Form submission is handled by handleDetailsSubmit */}
            <form onSubmit={handleDetailsSubmit}>
              <div className="grid w-full grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
                {/* Username Input */}
                <Input isRequired name="name" label="Username" labelPlacement="outside" placeholder="Enter username" defaultValue={getUserValue('name')} />
                {/* Email Input (Read-only) */}
                <Input isRequired name="email" label="Email" labelPlacement="outside" placeholder="Enter email" type="email" defaultValue={getUserValue('email')} readOnly description="Email cannot be changed here." />
                {/* First Name Input */}
                <Input isRequired name="firstName" label="First Name" labelPlacement="outside" placeholder="Enter first name" defaultValue={getUserValue('firstName')} />
                {/* Last Name Input */}
                <Input isRequired name="lastName" label="Last Name" labelPlacement="outside" placeholder="Enter last name" defaultValue={getUserValue('lastName')} />
                {/* Phone Number Input */}
                <Input isRequired name="phoneNumber" label="Phone Number" labelPlacement="outside" placeholder="Enter phone number" type="tel" defaultValue={getUserValue('phoneNumber')} />
                {/* Country Autocomplete Input */}
                <Autocomplete
                  isRequired
                  name="countryCode"
                  defaultItems={countries} // Items for the autocomplete (list of countries)
                  label="Country"
                  labelPlacement="outside"
                  placeholder="Select country"
                  showScrollIndicators={false}
                  defaultSelectedKey={getUserValue('countryCode')} // Pre-select country if available
                  aria-label="Select your country"
                >
                  {(item) => ( // Render function for each item in the autocomplete list
                    <AutocompleteItem
                      key={item.code} // Unique key for each item
                      value={item.code} // Value of the item
                      startContent={<Avatar alt="Country Flag" className="h-6 w-6 text-tiny" name={item.code} src={`https://flagcdn.com/${item.code.toLowerCase()}.svg`} />} // Display country flag
                    >
                      {item.name} {/* Display country name */}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                {/* State/Province Input */}
                <Input isRequired name="state" label="State / Province" labelPlacement="outside" placeholder="Enter state or province" defaultValue={getUserValue('state')} />
                {/* Address Input */}
                <Input isRequired name="address" label="Address" labelPlacement="outside" placeholder="Enter street address" defaultValue={getUserValue('address')} />
                {/* Zip/Postal Code Input (spans one column on medium screens) */}
                <div className="md:col-span-1">
                   <Input isRequired name="zipCode" label="Zip / Postal Code" labelPlacement="outside" placeholder="Enter zip code" defaultValue={getUserValue('zipCode')} />
                </div>
              </div>

              {/* Action Buttons: Cancel and Save Changes */}
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
      {/* This modal appears when showUpload is true */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
          <Card className="relative w-full max-w-md transform transition-all duration-300 ease-in-out scale-100 opacity-100">
            {/* Close button for the modal */}
            <Button
              isIconOnly
              aria-label="Close upload panel"
              className="absolute right-3 top-3 z-20 bg-background hover:bg-default-100 border border-default-200"
              radius="full"
              size="sm"
              variant="flat"
              onPress={() => setShowUpload(false)} // Close the modal on press
            >
              <Icon className="text-default-500" icon="iconamoon:close-thin" width={20} />
            </Button>
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Upload New Profile Picture</h3>
              {/* Hidden file input, triggered by clicking the drop area */}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp, image/gif" // Accepted image types
                  className="hidden"
              />
              {/* Drag and drop area for image upload */}
               <div
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
                              ${isDragging ? 'border-primary bg-primary-50 dark:bg-primary-900/30' : 'border-default-300 hover:border-default-400 bg-default-50/50 dark:bg-default-50/10 dark:hover:border-default-300'}`} // Dynamic styling based on dragging state
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleAreaClick} // Trigger file input on click
                  role="button"
                  tabIndex={0} // Make it focusable
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAreaClick(); }} // Trigger click on Enter/Space
                >
                 {/* Display image preview if a file is selected */}
                 {previewUrl && selectedFile ? (
                    <div className="text-center">
                      <Image
                        src={previewUrl}
                        alt="Selected preview"
                        width={128}
                        height={128}
                        className="max-h-32 w-auto rounded mb-2 object-contain bg-gray-100 dark:bg-gray-800"
                      />
                      <p className="text-sm text-default-600 dark:text-default-300 truncate max-w-xs">{selectedFile.name}</p>
                      {/* Button to remove the selected image preview */}
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
                    // Display upload prompt if no file is selected
                    <div className="text-center text-default-500 dark:text-default-400">
                      <Icon icon="solar:cloud-upload-outline" width={48} className="mx-auto mb-3 text-default-400 dark:text-default-500" />
                      <p className="font-medium">Drag and drop or click here</p>
                      <p className="text-xs mt-1">to upload your image (Max 5MB)</p>
                    </div>
                  )}
               </div>
               {/* Upload button, enabled only if a file is selected */}
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
