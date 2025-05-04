"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  ScrollShadow,
  Spacer,
  Skeleton, // Import Skeleton
  Modal,      // Import Modal components
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure, // Hook for Modal state
  Input       // Import Input
} from '@heroui/react';
import { Icon } from '@iconify/react';
import useSWR from 'swr';
import { items } from './sidebar-items'; // Assuming this file exists
import { AcmeIcon } from './acme';       // Assuming this file exists
import { useShops } from '@/context/shops'; // Assuming this context exists

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

// Define User type
interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export default function SidebarComponent() {
  const pathname = usePathname();
  const { addShop } = useShops(); // Assuming context provides addShop
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure(); // Hook for Modal
  const [newName, setNewName] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

  // Fetch current user
  const { data, error } = useSWR<{ user: User }>('/api/user', fetcher);
  const isLoading = !data && !error;
  const user = data?.user;

  const handleAdd = () => {
    const trimmedName = newName.trim();
    const trimmedUrl = newUrl.trim();
    if (!trimmedName || !trimmedUrl) return;
    if (addShop) {
      addShop({ name: trimmedName, url: trimmedUrl });
    }
    setNewName('');
    setNewUrl('');
    onClose(); // Close modal using hook function
  };

  // --- Logout Handler Placeholder ---
  const handleLogout = () => {
    console.log("Logout clicked");
    // Add your actual logout logic here
  };

  return (
    <>
      {/* Main Sidebar Container: Use Flex column and full height */}
      <div className="flex h-screen flex-col p-4 border-r border-divider bg-background"> {/* Added padding, border, bg */}

        {/* Brand */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
            <AcmeIcon className="text-background" />
          </div>
          <span className="text-small font-bold uppercase text-foreground">RANKED BETA v0.1</span>
        </div>

        <Spacer y={8} /> {/* Adjusted Spacer */}

        {/* User Section with Skeleton */}
        <div className="flex items-center gap-3 px-2"> {/* Adjusted padding */}
           <Skeleton isLoaded={!isLoading} className="flex rounded-full w-10 h-10">
              <Avatar
                isBordered
                size="md" // Slightly larger avatar
                src={user?.avatarUrl ?? undefined}
                name={user?.name ?? user?.email ?? 'U'} // Provide fallback initial
              />
           </Skeleton>
           <div className="w-full"> {/* Container for text skeletons */}
              <Skeleton isLoaded={!isLoading} className="h-4 w-3/5 rounded-lg mb-1"> {/* Name/Email Skeleton */}
                 <p className="text-small font-semibold text-foreground">
                   {user?.name ?? user?.email ?? 'Unknown User'}
                 </p>
               </Skeleton>
               <Skeleton isLoaded={!isLoading} className="h-3 w-2/5 rounded-lg"> {/* Role Skeleton */}
                  <p className="text-tiny text-default-500"> {/* Adjusted color */}
                    {user?.role ?? 'No Role'}
                  </p>
               </Skeleton>
           </div>
        </div>

        <Spacer y={4} /> {/* Spacer before nav */}

        {/* Navigation & Content Area: Takes remaining space and scrolls */}
        <ScrollShadow className="flex-1 -mr-4 pr-4 py-4" hideScrollBar> {/* Takes up space, adjust padding */}
          <nav className="flex flex-col gap-1"> {/* Removed px-2, handled by Button padding */}
            {items.map((item) => {
              if (!item || !item.key || !item.title) return null;

              const isActive = item.href ? pathname === item.href : false;
              const isWebshops = item.key === 'webshops';

              return (
                <div key={item.key} className="flex items-center gap-1"> {/* Reduced gap */}
                  <Button
                    as={item.href ? Link : 'button'} // Use button if no href for semantics
                    href={item.href}
                    fullWidth
                    variant={isActive ? "flat" : "light"} // Use flat for active state
                    color={isActive ? "primary" : "default"} // Use primary color for active
                    radius="sm" // Slightly rounded corners
                    className={`h-11 justify-start gap-3 px-3 ${ // Adjusted height, padding, gap
                      isActive ? 'font-medium' : 'text-default-700' // Ensure text color contrast
                    }`}
                    startContent={item.icon && <Icon icon={item.icon} width={20} />} // Slightly smaller icon
                    endContent={item.endContent}
                  >
                    <span className="text-small">{item.title}</span>
                  </Button>

                  {isWebshops && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      radius="sm" // Consistent radius
                      className="text-default-500 hover:text-primary" // Use primary on hover
                      aria-label="Add Webshop"
                      onPress={onOpen} // Open HeroUI modal
                    >
                      <Icon icon="mdi:plus" width={18} />
                    </Button>
                  )}
                </div>
              );
            })}
          </nav>

          <Spacer y={8} />

          {/* Upgrade Card */}
           {/* NOTE: Absolute positioning on footer can be tricky. Consider simpler layout if issues arise. */}
          <Card className="mx-2 overflow-visible" shadow="sm" isBlurred>
             <CardBody className="items-center py-5 text-center">
                <h3 className="text-medium font-medium text-default-700">
                 Download Our plugin 🚀
                </h3>
                <p className="p-4 text-small text-default-500">
                 Download our plugin to get the most out of your Webshop.
                </p>
            </CardBody>
            <CardFooter className="absolute -bottom-5 justify-center"> {/* Adjusted bottom offset */}
                <Button
                 className="px-10 shadow-lg" // Slightly larger shadow
                 color="primary"
                 radius="full"
                 variant="shadow"
                 onPress={() => console.log("Download plugin clicked")}
                >
                 Download
                </Button>
            </CardFooter>
          </Card>
          {/* Add Spacer to prevent content overlap due to absolute positioned footer */}
          <Spacer y={10}/>

        </ScrollShadow> {/* End Scrollable Area */}

        {/* Bottom Actions: Fixed at the bottom */}
        <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-divider"> {/* Added border-t */}
          <Button
            fullWidth
            radius="sm" // Consistent radius
            className="justify-start text-default-600" // Adjusted color
            startContent={<Icon icon="solar:info-circle-line-duotone" width={20} />}
            variant="light"
            onPress={() => console.log("Help clicked")}
          >
            Help & Information
          </Button>
          <Button
            fullWidth
            radius="sm" // Consistent radius
            className="justify-start" // Let color prop handle text
            color="danger" // Use danger color directly
            startContent={<Icon icon="solar:logout-3-line-duotone" width={20} />}
            variant="light"
            onPress={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div> {/* End Main Sidebar Container */}


      {/* Add Webshop Modal (Using HeroUI Modal) */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onCloseModal) => ( // Use onClose provided by ModalContent if needed, else use `onClose` from hook
            <>
              <ModalHeader className="flex flex-col gap-1">Add New Webshop</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus // Focus first input
                  label="Shop Name"
                  placeholder="e.g., My Awesome Store"
                  variant="bordered"
                  value={newName}
                  onValueChange={setNewName} // Use onValueChange for HeroUI Input
                />
                <Input
                  label="Shop URL"
                  placeholder="https://example.com"
                  variant="bordered"
                  value={newUrl}
                  onValueChange={setNewUrl} // Use onValueChange
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" color="default" onPress={onCloseModal}> {/* Use color prop */}
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleAdd}
                  isDisabled={!newName.trim() || !newUrl.trim()}
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