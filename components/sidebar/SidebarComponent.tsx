"use client"; // Added directive

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, Button, Card, CardBody, CardFooter, ScrollShadow, Spacer } from '@heroui/react';
import { Icon } from '@iconify/react';
import useSWR from 'swr';
import { items } from './sidebar-items'; // Assuming this file exists
import { AcmeIcon } from './acme'; // Assuming this file exists
import { useShops } from '@/context/shops'; // Assuming this context exists

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

// Define User type, assuming avatarUrl might be part of the response
interface User {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null; // Add avatarUrl if your API provides it
}

export default function SidebarComponent() {
  const pathname = usePathname();
  const { shops, addShop } = useShops(); // Assuming context provides these
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Fetch current user - Use the defined User interface
  const { data, error } = useSWR<{ user: User }>('/api/user', fetcher);
  const isLoading = !data && !error;
  const user = data?.user;

  const handleAdd = () => {
    const trimmedName = newName.trim();
    const trimmedUrl = newUrl.trim();
    if (!trimmedName || !trimmedUrl) return;
    // Ensure addShop expects { name: string, url: string }
    if (addShop) {
       addShop({ name: trimmedName, url: trimmedUrl });
    }
    setNewName('');
    setNewUrl('');
    setShowModal(false);
  };

  // --- Logout Handler Placeholder ---
  const handleLogout = () => {
    console.log("Logout clicked");
    // Add your actual logout logic here (e.g., call an API endpoint, redirect)
    // Example: window.location.href = '/api/auth/logout';
  };

  return (
    <>
      <div className="h-full min-h-[48rem]"> {/* Consider setting min-h via viewport units like min-h-screen if needed */}
          {" "}
          {/* Brand */}
          <div className="flex items-center gap-2 px-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
              <AcmeIcon className="text-background" />
            </div>
            <span className="text-small font-bold uppercase"> RANKED BETA v0.1</span>
          </div>

          <Spacer y={12} />

          {/* User Section */}
          <div className="flex items-center gap-3 px-4">
            {isLoading ? (
              // Skeleton avatar
              <div className="h-10 w-10 rounded-full bg-default-200 animate-pulse" />
            ) : (
              // --- Corrected Avatar ---
              <Avatar
                isBordered
                size="sm"
                // Pass the actual avatarUrl from your user data if available
                src={user?.avatarUrl ?? undefined}
                // Always pass the name. Avatar component should show initials if src fails/is missing.
                // Use email as a fallback for the name if name is also missing.
                name={user?.name ?? user?.email ?? 'User'}
              />
              // --- End Corrected Avatar ---
            )}

            {isLoading ? (
              // Skeleton text
              <div className="flex flex-col gap-1"> {/* Use gap for spacing */}
                <div className="h-4 w-24 rounded bg-default-200 animate-pulse" />
                <div className="h-3 w-16 rounded bg-default-300 animate-pulse" /> {/* Use different shade */}
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-small font-medium text-default-600">
                  {/* Display name or email if name is missing */}
                  {user?.name ?? user?.email ?? 'Unknown User'}
                </p>
                <p className="text-tiny text-default-400">
                  {user?.role ?? 'No Role'}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <ScrollShadow className="-mr-6 h-full flex-1 py-6 pr-6"> {/* Adjust max-h if needed, ensure h-full */}
            <nav className="flex flex-col gap-1 px-2"> {/* Use gap for consistent spacing */}
              {items.map((item) => {
                // Ensure item structure is consistent (e.g., has key, title, optional href/icon/endContent)
                if (!item || !item.key || !item.title) return null; // Basic check for valid item data

                const isActive = item.href ? pathname === item.href : false;
                const isWebshops = item.key === 'webshops'; // Check if this key is correct

                return (
                  <div key={item.key} className="flex items-center">
                    {/* Use Button component for better accessibility and consistent styling */}
                    <Button
                      as={item.href ? Link : 'div'} // Render as Link if href exists
                      href={item.href} // Pass href only if it exists
                      fullWidth
                      variant={isActive ? "flat" : "light"} // Style based on active state
                      className={`h-auto justify-start gap-3 px-4 py-2 ${ isActive ? 'bg-default-100 text-foreground' : 'text-default-700' }`} // Adjust styling
                      startContent={item.icon && <Icon icon={item.icon} width={24} />}
                      endContent={item.endContent}
                    >
                      <span className="text-small font-medium">{item.title}</span>
                    </Button>

                    {/* Add Webshop Button - positioned relative to the nav item */}
                    {isWebshops && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="ml-2 text-default-500 hover:text-foreground" // Adjust margin and styling
                        aria-label="Add Webshop"
                        onPress={() => setShowModal(true)} // Use onPress for HeroUI
                      >
                        <Icon icon="mdi:plus" width={18} />
                      </Button>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Spacer before Upgrade Card if needed */}
            <Spacer y={8} />

            {/* Upgrade Card - Ensure it doesn't overflow awkwardly */}
            <Card className="mx-2 overflow-visible" shadow="sm">
               {/* ... Card content ... */}
                 <CardBody className="items-center py-5 text-center">
                    <h3 className="text-medium font-medium text-default-700">
                    Download Our plugin 🚀
                    </h3>
                    <p className="p-4 text-small text-default-500">
                    Download our plugin to get the most out of your Webshop.
                    </p>
                </CardBody>
                <CardFooter className="absolute -bottom-8 justify-center">
                    <Button
                    className="px-10 shadow-md"
                    color="primary"
                    radius="full"
                    variant="shadow"
                    // Add onPress handler if this button should do something
                    onPress={() => console.log("Download plugin clicked")}
                    >
                    Download
                    </Button>
                </CardFooter>
            </Card>
          </ScrollShadow>

          {/* Actions at the bottom */}
          <div className="mt-auto flex flex-col pt-6"> {/* Added padding-top */}
            <Button
              fullWidth
              className="justify-start text-default-500 hover:text-foreground"
              startContent={<Icon icon="solar:info-circle-line-duotone" width={24} className="text-default-500" />}
              variant="light"
              onPress={() => console.log("Help clicked")} // Add onPress handler
            >
              Help & Information
            </Button>
            <Button
              fullWidth
              className="justify-start text-danger hover:bg-danger-50" // Use danger color for logout
              startContent={<Icon icon="solar:logout-3-line-duotone" width={24} />} // More appropriate logout icon
              variant="light"
              onPress={handleLogout} // Use the logout handler
            >
              Log Out
            </Button>
          </div>
        </div>
      

      {/* Add Webshop Modal */}
      {showModal && (
        // Use HeroUI Modal component if available, otherwise style the div
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-sm shadow-xl"> {/* Use background color, max-width */}
            <h3 className="text-lg font-medium mb-4">Add New Webshop</h3> {/* Slightly larger title */}
            {/* Consider using HeroUI Input components for consistency */}
            <label className="block mb-3">
              <span className="text-sm text-default-700">Shop Name</span>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-default-200 bg-default-100 p-2 focus:border-primary focus:ring-primary" // Basic input styling
                placeholder="e.g., My Awesome Store"
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-default-700">Shop URL</span>
              <input
                type="text"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border border-default-200 bg-default-100 p-2 focus:border-primary focus:ring-primary" // Basic input styling
                placeholder="https://example.com"
              />
            </label>
            <div className="flex justify-end gap-2"> {/* Use gap */}
              <Button variant="flat" onPress={() => setShowModal(false)}> {/* Use flat for secondary actions */}
                Cancel
              </Button>
              <Button
                color="primary" // Use primary color for main action
                onPress={handleAdd}
                isDisabled={!newName.trim() || !newUrl.trim()} // Use isDisabled prop
              >
                Add Shop
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}