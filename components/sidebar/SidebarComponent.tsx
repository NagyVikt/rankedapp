"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import {
  Avatar, Button, Card, CardBody, CardFooter, ScrollShadow, Spacer,
  Skeleton, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Input
} from '@heroui/react'; // Assuming Tooltip is not directly used here now
import { Icon } from '@iconify/react';
import useSWR from 'swr';
import { items } from './sidebar-items';
import { AcmeIcon } from './acme';
import { useShops } from '@/context/shops';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

// Define Navbar height class - MUST MATCH THE ACTUAL GLOBAL NAVBAR HEIGHT
const GLOBAL_NAVBAR_HEIGHT_CLASS = "pt-16"; // Assumes h-16 (64px) global navbar

export default function SidebarComponent() {
  const { isSidebarOpen, toggleSidebar } = useSidebar(); // Removed isAnimating, assuming context handles it or it's not critical for rendering logic here
  const pathname = usePathname();
  const { addShop } = useShops();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [newName, setNewName] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

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
    onClose();
  };
  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <>
      {/* Main Sidebar container */}
      {/* Added GLOBAL_NAVBAR_HEIGHT_CLASS to push content below the global navbar */}
      <div className={`flex h-full flex-col p-4 relative border-r border-divider bg-background ${GLOBAL_NAVBAR_HEIGHT_CLASS}`}>
        {/* Container for Brand and Close Button */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
               <AcmeIcon className="text-background" />
             </div>
             <span className="text-small font-bold uppercase text-foreground">RANKED BETAA v0.1</span>
          </div>
          {isSidebarOpen && ( // Simplified condition, toggleSidebar should always exist if context is used
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="border border-divider bg-background hover:bg-default-100"
                aria-label="Collapse sidebar"
                onPress={toggleSidebar}
              >
                <Icon icon="mdi:chevron-double-left" width={18} className="text-default-600" />
              </Button>
          )}
        </div>
        <Spacer y={8} />
        {/* User Information Section */}
        <div className="flex items-center gap-3 px-2">
           <Skeleton isLoaded={!isLoading} className="flex rounded-full w-10 h-10">
              <Avatar isBordered size="md" src={user?.avatarUrl ?? undefined} name={user?.name ?? user?.email ?? 'U'} />
           </Skeleton>
           <div className="w-full">
              <Skeleton isLoaded={!isLoading} className="h-4 w-3/5 rounded-lg mb-1">
                 <p className="text-small font-semibold text-foreground">{user?.name ?? user?.email ?? 'Unknown User'}</p>
               </Skeleton>
               <Skeleton isLoaded={!isLoading} className="h-3 w-2/5 rounded-lg">
                  <p className="text-tiny text-default-500">{user?.role ?? 'No Role'}</p>
               </Skeleton>
           </div>
        </div>
        <Spacer y={4} />
        {/* Scrollable Navigation Area */}
        <ScrollShadow className="flex-grow -mr-4 pr-4 py-4" hideScrollBar>
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              if (!item || !item.key || !item.title) return null;
              const isActive = item.href ? pathname === item.href : false;
              const isWebshops = item.key === 'webshops';
              return (
                <div key={item.key} className="flex items-center gap-1">
                  <Button
                    as={item.href ? Link : 'button'}
                    href={item.href}
                    fullWidth
                    variant={isActive ? "flat" : "light"}
                    color={isActive ? "primary" : "default"}
                    radius="sm"
                    className={`h-11 justify-start gap-3 px-3 ${ isActive ? 'font-medium' : 'text-default-700' }`}
                    startContent={item.icon && <Icon icon={item.icon} width={20} />}
                    endContent={item.endContent}
                  >
                    <span className="text-small">{item.title}</span>
                  </Button>
                  {isWebshops && (
                    <Button
                      isIconOnly size="sm" variant="light" radius="sm"
                      className="text-default-500 hover:text-primary"
                      aria-label="Add Webshop" onPress={onOpen}
                    >
                      <Icon icon="mdi:plus" width={18} />
                    </Button>
                  )}
                </div>
              );
            })}
          </nav>
          <Spacer y={8} />
          {/* "Upgrade" or Call-to-Action Card */}
          <Card className="mx-2 overflow-visible mb-10" shadow="sm" isBlurred>
             <CardBody className="items-center py-5 text-center">
                <h3 className="text-medium font-medium text-default-700">Download Our plugin 🚀</h3>
                <p className="p-4 text-small text-default-500">Download our plugin to get the most out of your Webshop.</p>
            </CardBody>
            <CardFooter className="absolute -bottom-5 justify-center">
                <Button className="px-10 shadow-lg" color="primary" radius="full" variant="shadow" onPress={() => console.log("Download plugin clicked")}>Download</Button>
            </CardFooter>
          </Card>
        </ScrollShadow>
        {/* Bottom Actions Area */}
        <div className="flex flex-col gap-1 mt-auto pt-4 border-t border-divider">
          <Button fullWidth radius="sm" className="justify-start text-default-600" startContent={<Icon icon="solar:info-circle-line-duotone" width={20} />} variant="light" onPress={() => console.log("Help clicked")}>Help & Information</Button>
          <Button fullWidth radius="sm" className="justify-start" color="danger" startContent={<Icon icon="solar:logout-3-line-duotone" width={20} />} variant="light" onPress={handleLogout}>Log Out</Button>
        </div>
      </div>

      {/* "Add Webshop" Modal Definition */}
       <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
         <ModalContent>
           {(onCloseModal) => (
             <>
               <ModalHeader className="flex flex-col gap-1">Add New Webshop</ModalHeader>
               <ModalBody>
                 <Input autoFocus label="Shop Name" placeholder="e.g., My Awesome Store" variant="bordered" value={newName} onValueChange={setNewName} />
                 <Input label="Shop URL" placeholder="https://example.com" variant="bordered" value={newUrl} onValueChange={setNewUrl} />
               </ModalBody>
               <ModalFooter>
                 <Button variant="flat" color="default" onPress={onCloseModal}>Cancel</Button>
                 <Button color="primary" onPress={handleAdd} isDisabled={!newName.trim() || !newUrl.trim()}>Add Shop</Button>
               </ModalFooter>
             </>
           )}
         </ModalContent>
       </Modal>
    </>
  );
}
