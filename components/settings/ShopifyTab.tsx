"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    Input,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Skeleton
} from "@heroui/react";
import { Icon } from "@iconify/react";
// useShops hook is called, but isLoading and error properties are not used
// as they are not part of its return type according to the TS error.
import { useShops } from "@/context/shops";

// Interface for a single Shopify connection entry
export interface ShopifyEntry {
  shopDomain: string; // e.g., your-store.myshopify.com
  accessToken: string; // Shopify Admin API Access Token
}

// --- Skeleton Component (Remains the same) ---
// This skeleton was previously tied to a context loading state.
// It's kept here in case you want to implement a local loading state for this tab in the future.
const ShopifyTabSkeleton = ({ className }: { className?: string }) => (
    <div className={`space-y-4 pt-4 ${className}`}>
         <div className="flex justify-between items-center mb-4">
             <Skeleton className="h-5 w-56 rounded-lg" />
             <Skeleton className="h-9 w-36 rounded-lg" />
         </div>
         {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex items-center justify-between min-h-[76px]">
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

// Local storage key for Shopify connections
const SHOPIFY_CONNECTIONS_STORAGE_KEY = "shopifyConnections";

interface ShopifyTabProps {
    className?: string;
}

export default function ShopifyTab({ className }: ShopifyTabProps) {
  // --- State and Hooks ---
  // Call useShops() if it's used for other context values, but we won't use isLoading or error from it.
  const shopsContext = useShops(); // You can still use other values from shopsContext if needed.

  // State for Shopify connections
  const [connections, setConnections] = useState<ShopifyEntry[]>([]);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // State for form fields
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // --- useEffect to load connections ---
   useEffect(() => {
    const raw = localStorage.getItem(SHOPIFY_CONNECTIONS_STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setConnections(parsed);
            } else { setConnections([]); }
        } catch { setConnections([]); }
    }
  }, []);

  // --- Handlers ---
  const saveAll = useCallback((next: ShopifyEntry[]) => {
    if (!Array.isArray(next)) return;
    try {
        localStorage.setItem(SHOPIFY_CONNECTIONS_STORAGE_KEY, JSON.stringify(next));
        setConnections(next);
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Failed to save shopifyConnections:", error);
        alert("Failed to save connections.");
    }
  }, []);

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingIndex(null);
    setShopDomain("");
    setAccessToken("");
    onOpen();
  };

  const handleEditClick = (index: number) => {
    const conn = connections[index];
    if (!conn) return;
    setIsEditing(true);
    setEditingIndex(index);
    setShopDomain(conn.shopDomain);
    setAccessToken(conn.accessToken);
    onOpen();
  };

  const handleSaveConnection = () => {
    const trimmedDomain = shopDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    const trimmedToken = accessToken.trim();
    if (!trimmedDomain || !trimmedToken) {
        alert("Please provide both the Shop Domain (e.g., your-store.myshopify.com) and the Admin API Access Token.");
        return;
    }
     if (!trimmedDomain.includes('.myshopify.com')) {
        alert("Please enter a valid Shopify domain (e.g., your-store.myshopify.com).");
        return;
    }
    const newEntry: ShopifyEntry = { shopDomain: trimmedDomain, accessToken: trimmedToken };
    let updatedConnections: ShopifyEntry[];
    if (isEditing && editingIndex !== null) {
        const conflictExists = connections.some((conn, index) => index !== editingIndex && conn.shopDomain === trimmedDomain);
        if (conflictExists) {
             alert(`A connection for ${trimmedDomain} already exists.`);
             return;
        }
        updatedConnections = connections.map((conn, index) => index === editingIndex ? newEntry : conn);
    } else {
        const exists = connections.some(conn => conn.shopDomain === trimmedDomain);
        if (exists) {
            alert(`A connection for ${trimmedDomain} already exists.`);
            return;
        }
        updatedConnections = [...connections, newEntry];
    }
    saveAll(updatedConnections);
    onClose();
  };

  const handleRemoveClick = (indexToRemove: number) => {
    const shopDomainToRemove = connections[indexToRemove]?.shopDomain;
    if (window.confirm(`Remove connection for ${shopDomainToRemove}?`)) {
        saveAll(connections.filter((_, index) => index !== indexToRemove));
    }
  };

  // --- Render Logic ---
  // The component now directly renders its content without checking isLoadingContext or contextError.
  // If you need a loading state specifically for this tab (e.g., during an API call for validation),
  // you would implement a local loading state (e.g., const [isTabLoading, setIsTabLoading] = useState(false);).

  return (
    <div className={`space-y-4 pt-4 ${className}`}>
       {/* Header */}
       <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
         <p className="text-medium font-semibold text-foreground">Manage Shopify Connections</p>
         <Button
            color="primary"
            variant="flat"
            size="sm"
            onPress={handleAddClick}
            startContent={<Icon icon="solar:add-circle-linear" width={18} />}
            className="dark:text-primary-foreground"
            // isDisabled prop removed as isLoadingContext is no longer used
         >
            Add Connection
         </Button>
      </div>

      {/* Connection List */}
      {connections.length === 0 ? (
         <p className="text-center text-default-500 py-4">No Shopify connections configured yet.</p>
      ) : (
         <div className="space-y-3">
            {connections.map((c, idx) => {
               const shopDisplayName = c.shopDomain;
               return (
                 <div key={c.shopDomain || idx} className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-4">
                     <Icon icon="logos:shopify" width={28} className="flex-shrink-0" />
                     <div>
                       <p className="font-medium text-foreground">{shopDisplayName}</p>
                       <p className="text-small text-foreground-500">Access Token configured</p>
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
                       <Icon icon="solar:trash-bin-minimalistic-linear" width={18} />
                     </Button>
                   </div>
                 </div>
               );
            })}
         </div>
      )}

      {/* Add/Edit Connection Modal */}
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
                {isEditing ? 'Edit Shopify Connection' : 'Add New Shopify Connection'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                 <p className="text-sm text-foreground-500">
                     You can create a Custom App in your Shopify Admin under 'Apps and sales channels' &gt; 'Develop apps' to get an Admin API access token. Ensure it has the necessary permissions (e.g., read/write products, orders).
                 </p>
                <Input
                  isRequired
                  label="Shopify Domain"
                  placeholder="your-store.myshopify.com"
                  variant="bordered"
                  value={shopDomain}
                  onValueChange={setShopDomain}
                  fullWidth
                  aria-label="Shopify Domain (e.g., your-store.myshopify.com)"
                  description="Enter the full .myshopify.com domain."
                />
                <Input
                  isRequired
                  label="Admin API Access Token"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  variant="bordered"
                  value={accessToken}
                  onValueChange={setAccessToken}
                  type="password"
                  fullWidth
                  aria-label="Shopify Admin API Access Token"
                  description="Starts with 'shpat_'. Keep this secure."
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={modalOnClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveConnection}
                  isDisabled={!shopDomain.trim() || !accessToken.trim()}
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
