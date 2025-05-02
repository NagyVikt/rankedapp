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
  Form, // Keep Form if needed for other parts, but not used in this snippet
  Image,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import countries from './countries'; // Assuming this file exists and exports country data

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json());

// Define the User type more explicitly
interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  // Add other fields if they exist in your API response
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string; // Example: if API returns country code
  state?: string;
  address?: string;
  zipCode?: string;
}

export default function AccountDetailsCard(props) {
  // Use the User interface with useSWR
  const { data, error, mutate } = useSWR<{ user: User }>('/api/user', fetcher);
  const isLoading = !data && !error;
  const user = data?.user;

  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to create/revoke object URLs for preview
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup function to revoke the object URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // --- Drag and Drop Handlers ---
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
    // Check if the leave event is going outside the drop zone area
     if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
     }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    setIsDragging(true); // Keep indicating drag is active
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
         // Handle non-image file error (e.g., show a message)
         console.error("Please drop an image file.");
         setSelectedFile(null);
      }
    }
  };

  // --- File Input Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
       const file = files[0];
        if (file.type.startsWith('image/')) {
            setSelectedFile(file);
        } else {
            // Handle non-image file error
            console.error("Please select an image file.");
            setSelectedFile(null);
            // Reset the input value if the file is invalid
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
    // Reset the file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- Upload Logic (Placeholder) ---
  const handleUpload = async () => {
    if (!selectedFile) return;

    console.log("Uploading file:", selectedFile.name);
    // TODO: Implement actual upload logic here
    // Example using FormData:
    // const formData = new FormData();
    // formData.append('avatar', selectedFile);
    // try {
    //   const response = await fetch('/api/user/avatar', { // Your avatar upload endpoint
    //     method: 'POST',
    //     body: formData,
    //     // Add headers if necessary (e.g., authorization)
    //   });
    //   if (!response.ok) throw new Error('Upload failed');
    //   const result = await response.json();
    //   console.log('Upload successful:', result);
    //   // Optionally: update user data using SWR's mutate function
    //   mutate(); // Re-fetch user data to get the new avatarUrl
    //   setShowUpload(false); // Close the modal on success
    //   setSelectedFile(null); // Clear selection
    // } catch (uploadError) {
    //   console.error('Upload error:', uploadError);
    //   // Handle upload error (e.g., show an error message)
    // }
    alert(`Simulating upload for: ${selectedFile.name}`); // Replace with actual upload
    setShowUpload(false); // Close modal for now
  };


  // --- Account Details Form Submit Handler ---
  const handleDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const updatedDetails = Object.fromEntries(formData.entries());
    console.log("Saving details:", updatedDetails);

    // TODO: Implement API call to save details
    // try {
    //   const response = await fetch('/api/user', {
    //      method: 'PUT', // or 'PATCH'
    //      headers: { 'Content-Type': 'application/json' },
    //      body: JSON.stringify(updatedDetails),
    //   });
    //   if (!response.ok) throw new Error('Failed to save details');
    //   mutate(); // Re-fetch data on success
    //   alert('Details saved successfully!');
    // } catch (saveError) {
    //    console.error('Save error:', saveError);
    //    alert('Failed to save details.');
    // }
  };


  // Helper to get user data safely
  const getUserValue = (key: keyof User) => user?.[key] ?? '';

  return (
    <>
      {/* --- Account Details Card --- */}
      <Card className="max-w-xl p-2" {...props}>
        {/* ... (CardHeader remains the same - showing avatar, name, role) ... */}
         <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
          <p className="text-large font-medium">Account Details</p>
          <div className="flex items-center gap-4 py-4">
            {isLoading ? (
              <div className="h-14 w-14 rounded-full bg-default-200 animate-pulse" />
            ) : (
              <Badge
                showOutline
                classNames={{ badge: 'w-5 h-5 bg-primary border-primary' }} // Adjust styling as needed
                content={ // Using content prop for the button/icon
                    <Button
                        isIconOnly
                        className="h-5 w-5 min-w-0 bg-primary text-primary-foreground" // Ensure button size matches badge
                        radius="full"
                        size="sm"
                        variant="solid" // Use solid for better visibility on badge
                        onClick={() => {
                           setSelectedFile(null); // Reset selection when opening
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
                  className="h-14 w-14 text-large" // Ensure avatar size
                  src={user?.avatarUrl} // Use optional chaining safely
                  // Fallback using name initials if no avatarUrl
                  name={!user?.avatarUrl ? getUserValue('name') : undefined}
                />
              </Badge>
            )}
             {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-5 w-32 rounded bg-default-200 animate-pulse" />
                <div className="h-4 w-24 rounded bg-default-300 animate-pulse" />
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="font-medium">{getUserValue('name')}</p>
                <span className="text-small text-default-500">{getUserValue('role')}</span>
              </div>
            )}
          </div>
          <p className="text-small text-default-400">
            The photo will be used for your profile, and will be visible to other users of the
            platform.
          </p>
        </CardHeader>

        <CardBody>
          {!isLoading && user && ( // Ensure user data is loaded before rendering form
            <form onSubmit={handleDetailsSubmit}> {/* Use standard form for better control */}
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {/* Make sure Input names match your backend expectations */}
                <Input isRequired name="username" label="Username" labelPlacement="outside" placeholder="Enter username" defaultValue={getUserValue('name')} />
                <Input isRequired name="email" label="Email" labelPlacement="outside" placeholder="Enter email" type="email" defaultValue={getUserValue('email')} readOnly // Often email is not editable or requires verification
                />
                <Input isRequired name="firstName" label="First Name" labelPlacement="outside" placeholder="Enter first name" defaultValue={getUserValue('firstName')} />
                <Input isRequired name="lastName" label="Last Name" labelPlacement="outside" placeholder="Enter last name" defaultValue={getUserValue('lastName')} />
                <Input isRequired name="phoneNumber" label="Phone Number" labelPlacement="outside" placeholder="Enter phone number" type="tel" defaultValue={getUserValue('phoneNumber')} />
                <Autocomplete
                  isRequired
                  name="countryCode" // Use a name for form submission
                  defaultItems={countries}
                  label="Country"
                  labelPlacement="outside"
                  placeholder="Select country"
                  showScrollIndicators={false}
                  defaultSelectedKey={getUserValue('countryCode')} // Set default based on user data
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.code}
                      value={item.code} // Set value for form submission
                      startContent={<Avatar alt="Country Flag" className="h-6 w-6" src={`https://flagcdn.com/${item.code.toLowerCase()}.svg`} />}
                    >
                      {item.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <Input isRequired name="state" label="State" labelPlacement="outside" placeholder="Enter state" defaultValue={getUserValue('state')} />
                <Input isRequired name="address" label="Address" labelPlacement="outside" placeholder="Enter address" defaultValue={getUserValue('address')} />
                <Input isRequired name="zipCode" label="Zip Code" labelPlacement="outside" placeholder="Enter zip code" defaultValue={getUserValue('zipCode')} />
              </div>

              <div className="mt-6 flex w-full justify-end gap-2">
                <Button radius="full" variant="bordered" type="button" onPress={() => console.log("Cancel clicked")}> {/* Use onPress for non-submit buttons */}
                  Cancel
                </Button>
                <Button color="primary" radius="full" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
          {isLoading && (
             <div className="space-y-3 p-4"> {/* Placeholder for form loading state */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 rounded bg-default-200 animate-pulse"></div>
                    <div className="h-10 rounded bg-default-200 animate-pulse"></div>
                </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 rounded bg-default-200 animate-pulse"></div>
                    <div className="h-10 rounded bg-default-200 animate-pulse"></div>
                </div>
                 {/* Add more placeholders as needed */}
             </div>
          )}
        </CardBody>
      </Card>

      {/* --- Upload Panel (Modal) --- */}
      {showUpload && (
        // Modal container with overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300">
          <Card className="relative w-full max-w-md transform transition-all duration-300 scale-100"> {/* Adjust max-w as needed */}
             {/* Close Button */}
             {/* Close Button - Adjusted Position */}
            <Button
              isIconOnly
              // Use positive values for top/right to position inside the card
              // Adjust 'right-3 top-3' (or 'right-2 top-2', 'right-4 top-4') as needed for spacing
              className="absolute right-3 top-3 z-20 bg-background hover:bg-default-100 border border-default-200"
              radius="full"
              size="sm"
              variant="flat"
              onPress={() => setShowUpload(false)} // Use onPress for HeroUI Button clicks
            >
              <Icon className="text-default-500" icon="iconamoon:close-thin" width={20} />
            </Button>

            {/* Card Body contains the uploader */}
            <CardBody className="p-6"> {/* Add padding */}
              <h3 className="text-xl font-semibold mb-4 text-center">Upload New Profile Picture</h3>

              {/* Hidden File Input */}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
              />

               {/* Drop Zone Area */}
               <div
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
                              ${isDragging ? 'border-primary bg-primary-50' : 'border-default-300 hover:border-default-400 bg-default-50/50'}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleAreaClick} // Trigger file input on click
                >
                 {previewUrl && selectedFile ? (
                    // Show Preview
                    <div className="text-center">
                      <Image
                        src={previewUrl}
                        alt="Selected preview"
                        width={128} // Adjust preview size
                        height={128}
                        className="max-h-32 w-auto rounded mb-2 object-contain" // Use object-contain
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
                    // Show Placeholder
                    <div className="text-center text-default-500">
                      <Icon icon="solar:cloud-upload-outline" width={48} className="mx-auto mb-3 text-default-400" />
                      <p className="font-medium">Drag and drop or click here</p>
                      <p className="text-xs mt-1">to upload your image (Max X MB)</p> {/* Add size limit info */}
                    </div>
                  )}
               </div>

               {/* Upload Button */}
               <Button
                  fullWidth
                  color="primary"
                  className="mt-4"
                  onPress={handleUpload}
                  isDisabled={!selectedFile} // Disable if no file is selected
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