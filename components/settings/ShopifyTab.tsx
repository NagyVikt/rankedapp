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
    // Removed RadioGroup, Radio, ScrollShadow as we'll use Input for domain
    Skeleton // Import Skeleton
} from "@heroui/react"; // Assuming HeroUI components handle dark theme via context
import { Icon } from "@iconify/react";
// Keep useShops for potential future use or general loading state, but selection logic changes
import { useShops } from "@/context/shops";

// Interface for a single Shopify connection entry
// Assumes connection via shop domain and Admin API Access Token
export interface ShopifyEntry {
  shopDomain: string; // e.g., your-store.myshopify.com
  accessToken: string; // Shopify Admin API Access Token
}

// --- Skeleton Components (Remain the same, text updates if needed) ---
// Using HeroUI Skeleton component is preferred
const ShopifyTabSkeleton = ({ className }: { className?: string }) => (
    // Use HeroUI Skeleton component for a more integrated look
    <div className={`space-y-4 pt-4 ${className}`}>
         <div className="flex justify-between items-center mb-4">
             {/* Updated text context if needed, but skeleton is generic */}
             <Skeleton className="h-5 w-56 rounded-lg" />
             <Skeleton className="h-9 w-36 rounded-lg" />
         </div>
         {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex items-center justify-between min-h-[76px]">
                 <div className="flex items-center gap-4 w-full">
                     {/* Shopify Icon Placeholder */}
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
// --- End Skeleton Components ---

// Local storage key for Shopify connections
const SHOPIFY_CONNECTIONS_STORAGE_KEY = "shopifyConnections";

interface ShopifyTabProps {
    className?: string;
}

// Renamed component to ShopifyTab
export default function ShopifyTab({ className }: ShopifyTabProps) {
  // --- State and Hooks ---
  // Keep useShops for loading/error, but remove direct dependency for selection
  const { isLoading: isLoadingContext, error: contextError } = useShops(); // Renamed to avoid conflict
  // State for Shopify connections
  const [connections, setConnections] = useState<ShopifyEntry[]>([]);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // State for form fields
  const [shopDomain, setShopDomain] = useState(""); // Renamed from ck
  const [accessToken, setAccessToken] = useState(""); // Renamed from cs
  // Removed 'sel' state as domain is entered directly

  // --- useEffect to load connections ---
   useEffect(() => {
    // Use the new storage key
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
  // Saves Shopify connections to localStorage
  const saveAll = useCallback((next: ShopifyEntry[]) => {
    if (!Array.isArray(next)) return;
    try {
        // Use the new storage key
        localStorage.setItem(SHOPIFY_CONNECTIONS_STORAGE_KEY, JSON.stringify(next));
        setConnections(next);
        // Optional: Trigger a storage event if other components need to react
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Failed to save shopifyConnections:", error);
        // Replace alert with a more user-friendly notification if possible
        alert("Failed to save connections.");
    }
  }, []);

  // Opens modal for adding a new connection
  const handleAddClick = () => {
    setIsEditing(false);
    setEditingIndex(null);
    // Reset Shopify fields
    setShopDomain("");
    setAccessToken("");
    onOpen();
  };

  // Opens modal for editing an existing connection
  const handleEditClick = (index: number) => {
    const conn = connections[index];
    if (!conn) return;
    setIsEditing(true);
    setEditingIndex(index);
    // Set Shopify fields from the connection being edited
    setShopDomain(conn.shopDomain);
    setAccessToken(conn.accessToken);
    onOpen();
  };

  // Saves the new or edited connection
  const handleSaveConnection = () => {
    // Validate Shopify fields
    const trimmedDomain = shopDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]; // Basic normalization
    const trimmedToken = accessToken.trim();

    if (!trimmedDomain || !trimmedToken) {
        alert("Please provide both the Shop Domain (e.g., your-store.myshopify.com) and the Admin API Access Token.");
        return;
    }
     // Simple check for a plausible domain format
     if (!trimmedDomain.includes('.myshopify.com')) {
        alert("Please enter a valid Shopify domain (e.g., your-store.myshopify.com).");
        return;
    }

    const newEntry: ShopifyEntry = { shopDomain: trimmedDomain, accessToken: trimmedToken };
    let updatedConnections: ShopifyEntry[];

    if (isEditing && editingIndex !== null) {
        // Check if the edited domain conflicts with another existing connection
        const conflictExists = connections.some((conn, index) => index !== editingIndex && conn.shopDomain === trimmedDomain);
        if (conflictExists) {
             alert(`A connection for ${trimmedDomain} already exists.`);
             return;
        }
        updatedConnections = connections.map((conn, index) => index === editingIndex ? newEntry : conn);
    } else {
        // Check if a connection for this domain already exists
        const exists = connections.some(conn => conn.shopDomain === trimmedDomain);
        if (exists) {
            alert(`A connection for ${trimmedDomain} already exists.`);
            return;
        }
        updatedConnections = [...connections, newEntry];
    }
    saveAll(updatedConnections);
    onClose(); // Close modal on successful save
  };

  // Removes a connection
  const handleRemoveClick = (indexToRemove: number) => {
    const shopDomainToRemove = connections[indexToRemove]?.shopDomain;
    // Use window.confirm or a custom confirmation modal
    if (window.confirm(`Remove connection for ${shopDomainToRemove}?`)) {
        saveAll(connections.filter((_, index) => index !== indexToRemove));
    }
  };

  // --- Render Logic ---
  // Show skeleton while context is loading (if context is still used for something)
   if (isLoadingContext) {
       return <ShopifyTabSkeleton className={className} />;
   }

  // Show error message if context failed (if context is still relevant)
  if (contextError) {
      return (
          <div className={`pt-4 text-center ${className}`}>
              {/* Updated Title */}
              <p className="text-medium font-semibold mb-4 text-foreground">Manage Shopify Connections</p>
              <p className="text-danger py-4">Error loading context: {contextError.message || 'Please try again.'}</p>
          </div>
      );
  }

  return (
    <div className={`space-y-4 pt-4 ${className}`}>
       {/* Header */}
       <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
         {/* Updated Title */}
         <p className="text-medium font-semibold text-foreground">Manage Shopify Connections</p>
         <Button
            color="primary"
            variant="flat" // Flat often looks good in dark mode
            size="sm"
            onPress={handleAddClick}
            startContent={<Icon icon="solar:add-circle-linear" width={18} />}
            // isDisabled={isLoadingContext} // Disable if still loading context, or remove if context isn't needed
            className="dark:text-primary-foreground" // Ensure text contrast if needed
         >
            {/* Updated Button Text */}
            Add Connection
         </Button>
      </div>

      {/* Connection List */}
      {connections.length === 0 ? (
         // Updated Empty State Text
         <p className="text-center text-default-500 py-4">No Shopify connections configured yet.</p>
      ) : (
         <div className="space-y-3">
            {connections.map((c, idx) => {
               const shopDisplayName = c.shopDomain; // Use domain as display name
               return (
                 <div key={c.shopDomain || idx} className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-4">
                     {/* Shopify Icon */}
                     <Icon icon="logos:shopify" width={28} className="flex-shrink-0" />
                     <div>
                       <p className="font-medium text-foreground">{shopDisplayName}</p>
                       {/* Updated description */}
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
          size="xl" // Consider 'lg' or 'xl' based on content
          scrollBehavior="inside"
      >
        <ModalContent>
          {(modalOnClose) => (
            <>
              {/* Updated Modal Header */}
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? 'Edit Shopify Connection' : 'Add New Shopify Connection'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                 {/* Info text about finding credentials */}
                 <p className="text-sm text-foreground-500">
                     You can create a Custom App in your Shopify Admin under 'Apps and sales channels' &gt; 'Develop apps' to get an Admin API access token. Ensure it has the necessary permissions (e.g., read/write products, orders).
                 </p>
                {/* Input for Shop Domain */}
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
                {/* Input for Admin API Access Token */}
                <Input
                  isRequired
                  label="Admin API Access Token"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // Example prefix
                  variant="bordered"
                  value={accessToken}
                  onValueChange={setAccessToken}
                  type="password" // Hide the token
                  fullWidth
                  aria-label="Shopify Admin API Access Token"
                  description="Starts with 'shpat_'. Keep this secure."
                />
                {/* Removed RadioGroup for Webshop selection */}

              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={modalOnClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveConnection}
                  // Updated validation check
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
