// File: components/sidebar/SidebarComponent.tsx
"use client";

import React from 'react'; // Import React
import Link from 'next/link'; // For navigation
import { usePathname } from 'next/navigation'; // To determine active link

// Import necessary UI components from HeroUI
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  ScrollShadow, // For scrollable content area
  Spacer,       // For spacing elements
  Skeleton,     // For loading state placeholders
  Modal,        // For the "Add Webshop" modal
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure, // Hook to manage modal state
  Input,        // Input field for the modal
  Tooltip       // Although the toggle button is removed, keep if used elsewhere
} from '@heroui/react';

// Import Icon component
import { Icon } from '@iconify/react';

// Import SWR for data fetching
import useSWR from 'swr';

// Import sidebar item configuration and custom icons/context
import { items } from './sidebar-items'; // Your navigation items
import { AcmeIcon } from './acme';       // Your custom brand icon
import { useShops } from '@/context/shops'; // Your custom context for shops

// Define the data fetching function for SWR
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

// Define the expected structure for the User object
interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null; // Avatar URL is optional
}

// Define the props for the component - currently empty as toggle logic is moved out
interface SidebarComponentProps {
  // No props needed for toggle state/function anymore
}

/**
 * Renders the main sidebar navigation and user interface elements.
 * The open/closed state and toggle button are managed by the parent layout (DefaultLayout).
 */
export default function SidebarComponent({ isSidebarOpen, toggleSidebar }: SidebarComponentProps) {
  const pathname = usePathname();
  const { addShop } = useShops();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [newName, setNewName] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

  const { data, error } = useSWR<{ user: User }>('/api/user', fetcher);
  const isLoading = !data && !error;
  const user = data?.user;

  // --- handleAdd and handleLogout remain the same ---
    const handleAdd = () => {
    const trimmedName = newName.trim();
    const trimmedUrl = newUrl.trim();
    if (!trimmedName || !trimmedUrl) return;
    if (addShop) {
      addShop({ name: trimmedName, url: trimmedUrl });
    }
    setNewName('');
    setNewUrl('');
    onClose();
  };
  const handleLogout = () => {
    console.log("Logout clicked");
  };


  return (
    <>
      {/* Main Sidebar container */}
      {/* Uses flex column, full height, padding, and relative positioning */}
      {/* Main Sidebar container */}
      <div className="flex h-full flex-col p-4 relative border-r border-divider bg-background">

        {/* --- Container for Brand and Close Button --- */}
        <div className="flex items-center justify-between px-2"> {/* Use justify-between */}
          {/* Brand */}
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
               <AcmeIcon className="text-background" />
             </div>
             <span className="text-small font-bold uppercase text-foreground">RANKED BETAA v0.1</span>
          </div>

          {/* --- START: Close Button (Visible only when open) --- */}
          {isSidebarOpen && toggleSidebar && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="border border-divider bg-background hover:bg-default-100" // Adjusted style
                aria-label="Collapse sidebar"
                onPress={toggleSidebar}
              >
                <Icon
                  icon="mdi:chevron-double-left" // Icon to show when open
                  width={18}
                  className="text-default-600"
                />
              </Button>
          )}
           {/* --- END: Close Button --- */}
        </div>
        {/* --- END: Container --- */}


        <Spacer y={8} />

        {/* User Information Section */}
        <div className="flex items-center gap-3 px-2">
          {/* Avatar with Skeleton for loading state */}
           <Skeleton isLoaded={!isLoading} className="flex rounded-full w-10 h-10">
              <Avatar
                isBordered
                size="md"
                src={user?.avatarUrl ?? undefined} // Use optional chaining and fallback
                name={user?.name ?? user?.email ?? 'U'} // Use name, email, or 'U' as fallback
              />
           </Skeleton>
           {/* User Name/Email and Role with Skeletons */}
           <div className="w-full">
              <Skeleton isLoaded={!isLoading} className="h-4 w-3/5 rounded-lg mb-1">
                 <p className="text-small font-semibold text-foreground">
                   {user?.name ?? user?.email ?? 'Unknown User'}
                 </p>
               </Skeleton>
               <Skeleton isLoaded={!isLoading} className="h-3 w-2/5 rounded-lg">
                  <p className="text-tiny text-default-500">
                    {user?.role ?? 'No Role'}
                  </p>
               </Skeleton>
           </div>
        </div>

        <Spacer y={4} /> {/* Vertical space */}

        {/* Scrollable Navigation Area */}
        {/* flex-grow makes this section take available vertical space */}
        <ScrollShadow className="flex-grow -mr-4 pr-4 py-4" hideScrollBar>
          {/* Navigation List */}
          <nav className="flex flex-col gap-1">
            {/* Map through the imported sidebar items */}
            {items.map((item) => {
              // Basic check for valid item data
              if (!item || !item.key || !item.title) return null;

              // Determine if the current item is active based on the route
              const isActive = item.href ? pathname === item.href : false;
              // Check if this is the "Webshops" item to add the plus button
              const isWebshops = item.key === 'webshops';

              return (
                // Container for each navigation item and potential action button
                <div key={item.key} className="flex items-center gap-1">
                  {/* Main Navigation Button (can be Link or button) */}
                  <Button
                    as={item.href ? Link : 'button'} // Render as Link if href exists
                    href={item.href}
                    fullWidth // Take full width of the container
                    variant={isActive ? "flat" : "light"} // Style differently if active
                    color={isActive ? "primary" : "default"} // Use primary color if active
                    radius="sm" // Slightly rounded corners
                    className={`h-11 justify-start gap-3 px-3 ${ isActive ? 'font-medium' : 'text-default-700' }`} // Styling classes
                    startContent={item.icon && <Icon icon={item.icon} width={20} />} // Optional start icon
                    endContent={item.endContent} // Optional end content (like Chips)
                  >
                    {/* Item Title */}
                    <span className="text-small">{item.title}</span>
                  </Button>

                  {/* Conditional "Add" button specifically for Webshops item */}
                  {isWebshops && (
                    <Button
                      isIconOnly // Render only the icon
                      size="sm"
                      variant="light"
                      radius="sm"
                      className="text-default-500 hover:text-primary" // Styling on hover
                      aria-label="Add Webshop"
                      onPress={onOpen} // Open the modal on press
                    >
                      <Icon icon="mdi:plus" width={18} />
                    </Button>
                  )}
                </div>
              );
            })}
          </nav>

          <Spacer y={8} /> {/* Vertical space */}

          {/* "Upgrade" or Call-to-Action Card */}
          {/* Added margin-bottom as absolute positioning of footer can be tricky */}
          <Card className="mx-2 overflow-visible mb-10" shadow="sm" isBlurred>
             <CardBody className="items-center py-5 text-center">
                <h3 className="text-medium font-medium text-default-700">
                 Download Our plugin 🚀
                </h3>
                <p className="p-4 text-small text-default-500">
                 Download our plugin to get the most out of your Webshop.
                </p>
            </CardBody>
            {/* Card footer positioned absolutely relative to the card */}
            <CardFooter className="absolute -bottom-5 justify-center">
                <Button
                 className="px-10 shadow-lg"
                 color="primary"
                 radius="full"
                 variant="shadow"
                 onPress={() => console.log("Download plugin clicked")} // Placeholder action
                >
                 Download
                </Button>
            </CardFooter>
          </Card>

        </ScrollShadow> {/* End Scrollable Area */}

        {/* Bottom Actions Area */}
        {/* mt-auto pushes this section to the bottom of the flex container */}
        <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-divider">
          {/* Help Button */}
          <Button
            fullWidth
            radius="sm"
            className="justify-start text-default-600"
            startContent={<Icon icon="solar:info-circle-line-duotone" width={20} />}
            variant="light"
            onPress={() => console.log("Help clicked")} // Placeholder action
          >
            Help & Information
          </Button>
          {/* Logout Button */}
          <Button
            fullWidth
            radius="sm"
            className="justify-start"
            color="danger" // Use danger color for logout
            startContent={<Icon icon="solar:logout-3-line-duotone" width={20} />}
            variant="light"
            onPress={handleLogout} // Call logout handler
          >
            Log Out
          </Button>
        </div>
      </div> {/* End Main Sidebar container */}

      {/* "Add Webshop" Modal Definition */}
       <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
         <ModalContent>
           {(onCloseModal) => ( // onCloseModal function provided by ModalContent
             <>
               <ModalHeader className="flex flex-col gap-1">Add New Webshop</ModalHeader>
               <ModalBody>
                 {/* Input for Shop Name */}
                 <Input
                   autoFocus // Automatically focus this input when modal opens
                   label="Shop Name"
                   placeholder="e.g., My Awesome Store"
                   variant="bordered"
                   value={newName}
                   onValueChange={setNewName} // Update state on change
                 />
                 {/* Input for Shop URL */}
                 <Input
                   label="Shop URL"
                   placeholder="https://example.com"
                   variant="bordered"
                   value={newUrl}
                   onValueChange={setNewUrl} // Update state on change
                 />
               </ModalBody>
               <ModalFooter>
                 {/* Cancel Button */}
                 <Button variant="flat" color="default" onPress={onCloseModal}>
                    Cancel
                 </Button>
                 {/* Add Shop Button (disabled if inputs are empty) */}
                 <Button
                    color="primary"
                    onPress={handleAdd} // Call add handler on press
                    isDisabled={!newName.trim() || !newUrl.trim()} // Disable if inputs are empty
                 >
                    Add Shop
                 </Button>
               </ModalFooter>
             </>
           )}
         </ModalContent>
       </Modal>
    </>
  );
}