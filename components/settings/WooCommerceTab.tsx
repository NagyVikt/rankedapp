'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  RadioGroup,
  Radio,
  ScrollShadow,
  Skeleton, // Skeleton is imported but its specific usage tied to isLoadingShops will be removed
} from '@heroui/react';
import { Icon } from '@iconify/react';
// Assuming useShops provides 'shops', but not 'isLoading' or 'error'
import { useShops } from '@/context/shops';

// Interface for a single WooCommerce connection entry
export interface WooEntry {
  consumerKey: string;
  consumerSecret: string;
  selectedShopUrl: string;
}

// --- Skeleton Component (Kept for potential future local loading state) ---
const WooCommerceTabSkeleton = ({ className }: { className?: string }) => (
  <div className={`space-y-4 pt-4 ${className}`}>
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-5 w-56 rounded-lg" />
      <Skeleton className="h-9 w-36 rounded-lg" />
    </div>
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex items-center justify-between min-h-[76px]"
      >
        <div className="flex items-center gap-4 w-full">
          <Skeleton className="h-7 w-7 rounded-md flex-shrink-0" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-2/5 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
// --- End Skeleton Component ---

interface WooCommerceTabProps {
  className?: string;
}

export default function WooCommerceTab({ className }: WooCommerceTabProps) {
  // Destructure only 'shops' as isLoading and error are not on ShopsContextValue
  // If 'shops' can be undefined, handle that appropriately.
  const { shops } = useShops() || {}; // Provide a fallback if useShops() can return null/undefined

  const [connections, setConnections] = useState<WooEntry[]>([]);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [ck, setCk] = useState('');
  const [cs, setCs] = useState('');
  const [sel, setSel] = useState<string>('');

  // Function to set a cookie
  const setCookie = (name: string, value: string, days?: number) => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    const encodedValue = encodeURIComponent(value);
    document.cookie =
      name + '=' + (encodedValue || '') + expires + '; path=/; SameSite=Lax';
    console.log(`Cookie set: ${name}=${encodedValue}`);
  };

  // Function to get a cookie
  const getCookie = (name: string): string | null => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  useEffect(() => {
    const rawCookie = getCookie('wooConnections');
    console.log('Raw wooConnections cookie on load:', rawCookie);
    if (rawCookie) {
      try {
        const parsed = JSON.parse(rawCookie);
        if (Array.isArray(parsed)) {
          setConnections(parsed);
          console.log('Parsed connections from cookie:', parsed);
        } else {
          setConnections([]);
          console.warn('wooConnections cookie was not an array.');
        }
      } catch (e) {
        setConnections([]);
        console.error('Failed to parse wooConnections cookie:', e);
      }
    } else {
      console.log('No wooConnections cookie found on load.');
    }
  }, []);

  const saveAll = useCallback((next: WooEntry[]) => {
    if (!Array.isArray(next)) {
      console.error('saveAll called with non-array:', next);
      return;
    }
    try {
      const connectionsString = JSON.stringify(next);
      setCookie('wooConnections', connectionsString, 30);
      setConnections(next);
      console.log('Saved wooConnections to cookie:', next);
    } catch (error) {
      console.error('Failed to save wooConnections to cookie:', error);
      alert('Failed to save connections.');
    }
  }, []);

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingIndex(null);
    setCk('');
    setCs('');
    setSel('');
    onOpen();
  };

  const handleEditClick = (index: number) => {
    const conn = connections[index];
    if (!conn) return;
    setIsEditing(true);
    setEditingIndex(index);
    setCk(conn.consumerKey);
    setCs(conn.consumerSecret);
    setSel(conn.selectedShopUrl);
    onOpen();
  };

  const handleSaveConnection = () => {
    const trimmedCk = ck.trim();
    const trimmedCs = cs.trim();
    if (!trimmedCk || !trimmedCs || !sel) {
      alert('Please fill all fields and select a Webshop.');
      return;
    }
    const newEntry: WooEntry = {
      consumerKey: trimmedCk,
      consumerSecret: trimmedCs,
      selectedShopUrl: sel,
    };
    let updatedConnections: WooEntry[];
    if (isEditing && editingIndex !== null) {
      updatedConnections = connections.map((conn, index) =>
        index === editingIndex ? newEntry : conn,
      );
    } else {
      // Ensure shops is an array before calling find or accessing length
      const shopNameForAlert = Array.isArray(shops)
        ? shops.find((s) => s.url === sel)?.name
        : sel;
      const exists = connections.some((conn) => conn.selectedShopUrl === sel);
      if (exists) {
        alert(`Connection for ${shopNameForAlert || sel} already exists.`);
        return;
      }
      updatedConnections = [...connections, newEntry];
    }
    saveAll(updatedConnections);
    onClose();
  };

  const handleRemoveClick = (indexToRemove: number) => {
    // Ensure shops is an array before calling find
    const shopName = Array.isArray(shops)
      ? shops.find((s) => s.url === connections[indexToRemove]?.selectedShopUrl)
          ?.name
      : connections[indexToRemove]?.selectedShopUrl;
    if (
      window.confirm(
        `Remove connection for ${shopName || connections[indexToRemove]?.selectedShopUrl}?`,
      )
    ) {
      saveAll(connections.filter((_, index) => index !== indexToRemove));
    }
  };

  // Conditional rendering for loading/error states removed as isLoadingShops and shopsError are not used.
  // The UI will now depend on the 'shops' array directly.

  return (
    <div className={`space-y-4 pt-4 ${className}`}>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <p className="text-medium font-semibold text-foreground">
          Manage WooCommerce Connections
        </p>
        <Button
          color="primary"
          variant="flat"
          size="sm"
          onPress={handleAddClick}
          startContent={<Icon icon="solar:add-circle-linear" width={18} />}
          // Disable button if shops array is not available or empty
          isDisabled={!Array.isArray(shops) || shops.length === 0}
          className="dark:text-primary-foreground"
        >
          Add Connection
        </Button>
      </div>

      {/* Show message if shops array is available but empty */}
      {Array.isArray(shops) && shops.length === 0 && (
        <p className="text-center text-default-500 py-4">
          No webshops found in your account to connect.
        </p>
      )}
      {/* Show message if shops is not yet available (e.g. undefined or null from context) */}
      {!Array.isArray(shops) && (
        <p className="text-center text-default-500 py-4">
          Loading webshop information...
        </p>
        // Or you could render the WooCommerceTabSkeleton here if you prefer
        // <WooCommerceTabSkeleton className={className} />
      )}

      {/* Render connections list only if shops array is available and has items */}
      {Array.isArray(shops) && shops.length > 0 && (
        <>
          {connections.length === 0 ? (
            <p className="text-center text-default-500 py-4">
              No WooCommerce connections configured yet.
            </p>
          ) : (
            <div className="space-y-3">
              {connections.map((c, idx) => {
                // Ensure shops is an array before calling find
                const shop = Array.isArray(shops)
                  ? shops.find((s) => s.url === c.selectedShopUrl)
                  : undefined;
                const shopDisplayName = shop?.name || c.selectedShopUrl;
                return (
                  <div
                    key={c.selectedShopUrl || idx}
                    className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <Icon
                        icon="logos:woocommerce"
                        width={28}
                        className="text-purple-600 flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {shopDisplayName}
                        </p>
                        <p className="text-small text-foreground-500">
                          Keys configured
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="light"
                        color="default"
                        size="sm"
                        onPress={() => handleEditClick(idx)}
                        isIconOnly
                        aria-label={`Edit connection for ${shopDisplayName}`}
                        className="text-default-500 hover:text-foreground"
                      >
                        <Icon icon="solar:pen-linear" width={18} />
                      </Button>
                      <Button
                        variant="light"
                        color="danger"
                        size="sm"
                        onPress={() => handleRemoveClick(idx)}
                        isIconOnly
                        aria-label={`Remove connection for ${shopDisplayName}`}
                        className="text-danger-400 hover:text-danger-300"
                      >
                        <Icon
                          icon="solar:trash-bin-minimalistic-linear"
                          width={18}
                        />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(modalOnClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing
                  ? 'Edit WooCommerce Connection'
                  : 'Add New WooCommerce Connection'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  isRequired
                  label="Consumer Key"
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  variant="bordered"
                  value={ck}
                  onValueChange={setCk}
                  fullWidth
                  aria-label="WooCommerce Consumer Key"
                />
                <Input
                  isRequired
                  label="Consumer Secret"
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  variant="bordered"
                  value={cs}
                  onValueChange={setCs}
                  type="password"
                  fullWidth
                  aria-label="WooCommerce Consumer Secret"
                />

                <RadioGroup
                  label="Select Webshop"
                  value={sel}
                  onValueChange={setSel}
                  isRequired={true}
                  aria-label="Select Webshop for WooCommerce Connection"
                  className="mt-2"
                >
                  <ScrollShadow className="max-h-48 w-full pr-2">
                    {/* Ensure shops is an array and has items before mapping */}
                    {Array.isArray(shops) && shops.length > 0 ? (
                      shops.map((s) => (
                        <Radio key={s.url} value={s.url}>
                          {s.name}{' '}
                          <span className="text-default-500 text-xs">
                            ({s.url})
                          </span>
                        </Radio>
                      ))
                    ) : (
                      <p className="text-sm text-default-500 italic px-1">
                        No webshops available to select.
                      </p>
                    )}
                  </ScrollShadow>
                </RadioGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={modalOnClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveConnection}
                  isDisabled={!ck.trim() || !cs.trim() || !sel}
                >
                  {isEditing ? 'Save Changes' : 'Add Connection'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
