// app/dashboard/settings/WooCommerceTab.tsx
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
    Select,
    SelectItem,
    // Spinner // Removed Spinner import
} from "@heroui/react"; // Adjust import path if needed
import { Icon } from "@iconify/react";
// Assuming useShops hook provides shops data and loading state
import { useShops } from "@/context/shops"; // Ensure this context exists and path is correct

// Interface for a single WooCommerce connection entry
export interface WooEntry {
  consumerKey: string;
  consumerSecret: string;
  selectedShopUrl: string;
}

// --- Skeleton Components (Defined within this file) ---
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const WooCommerceTabSkeleton = ({ className }: { className?: string }) => (
    <div className={`space-y-4 pt-4 ${className}`}> {/* Apply className prop */}
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-4">
            <SimpleSkeleton className="h-5 w-56 rounded" /> {/* Title */}
            <SimpleSkeleton className="h-9 w-36 rounded" /> {/* Add Button */}
        </div>
        {/* List Item Skeleton */}
        {[...Array(2)].map((_, i) => ( // Simulate 2 connection items
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between min-h-[76px]">
                <div className="flex items-center gap-4">
                    <SimpleSkeleton className="h-7 w-7 rounded" /> {/* Icon */}
                    <div className="space-y-1.5">
                        <SimpleSkeleton className="h-4 w-32 rounded" /> {/* Name */}
                        <SimpleSkeleton className="h-3 w-24 rounded" /> {/* Status */}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <SimpleSkeleton className="h-8 w-8 rounded-full" /> {/* Edit Button */}
                    <SimpleSkeleton className="h-8 w-8 rounded-full" /> {/* Remove Button */}
                </div>
            </div>
        ))}
    </div>
);
// --- End Skeleton Components ---


// Define props if any are passed from SettingsComponent (e.g., className)
interface WooCommerceTabProps {
    className?: string;
}

export default function WooCommerceTab({ className }: WooCommerceTabProps) {
  // Get shops data and loading state from context
  const { shops, isLoading: isLoadingShops, error: shopsError } = useShops();

  // State for persisted connections read from localStorage
  const [connections, setConnections] = useState<WooEntry[]>([]);

  // Modal state management
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState<boolean>(false); // Track if adding or editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Index of connection being edited

  // Form fields state (for the modal)
  const [ck, setCk] = useState(""); // Consumer Key
  const [cs, setCs] = useState(""); // Consumer Secret
  const [sel, setSel] = useState<string>(""); // Holds the selected shop URL

  // Load connections from localStorage on component mount
  useEffect(() => {
    const raw = localStorage.getItem("wooConnections");
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setConnections(parsed);
            } else {
                console.error("Stored wooConnections is not an array:", parsed);
                setConnections([]); // Reset to empty array if data is invalid
            }
        } catch (error) {
            console.error("Failed to parse wooConnections from localStorage:", error);
            setConnections([]); // Reset on parsing error
        }
    }
  }, []);

  // Persist helper: Saves the entire connections array to localStorage and updates state
  const saveAll = useCallback((next: WooEntry[]) => {
    if (!Array.isArray(next)) {
        console.error("Attempted to save non-array to wooConnections");
        return; // Prevent saving invalid data
    }
    try {
        const jsonValue = JSON.stringify(next);
        localStorage.setItem("wooConnections", jsonValue);
        setConnections(next); // Update component state
    } catch (error) {
        console.error("Failed to stringify or save wooConnections:", error);
        alert("Failed to save connections to local storage."); // User feedback
    }
  }, []); // No dependencies, operates on input and localStorage

  // --- Modal Handlers ---
  // (Keep existing handlers: handleAddClick, handleEditClick, handleSaveConnection, handleRemoveClick)
    const handleAddClick = () => {
        setIsEditing(false);
        setEditingIndex(null);
        setCk("");
        setCs("");
        setSel("");
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
            alert("Please fill in all fields: Consumer Key, Consumer Secret, and select a Webshop.");
            return;
        }
        const newEntry: WooEntry = { consumerKey: trimmedCk, consumerSecret: trimmedCs, selectedShopUrl: sel };
        let updatedConnections: WooEntry[];
        if (isEditing && editingIndex !== null) {
            updatedConnections = connections.map((conn, index) => index === editingIndex ? newEntry : conn);
        } else {
            const exists = connections.some(conn => conn.selectedShopUrl === sel);
            if (exists) {
                alert(`A connection for ${shops?.find(s => s.url === sel)?.name || sel} already exists.`);
                return;
            }
            updatedConnections = [...connections, newEntry];
        }
        saveAll(updatedConnections);
        onClose();
    };
    const handleRemoveClick = (indexToRemove: number) => {
        const shopToRemove = shops?.find(s => s.url === connections[indexToRemove]?.selectedShopUrl)?.name || connections[indexToRemove]?.selectedShopUrl;
        const shouldRemove = window.confirm(`Are you sure you want to remove the WooCommerce connection for ${shopToRemove}?`);
        if (shouldRemove) {
            const updatedConnections = connections.filter((_, index) => index !== indexToRemove);
            saveAll(updatedConnections);
        }
    };
  // --- End Modal Handlers ---


  // --- Render Logic ---

  // Render Skeleton while loading shops
  if (isLoadingShops) {
      return <WooCommerceTabSkeleton className={className} />;
  }

  // Render Error state if shops failed to load
  if (shopsError) {
      return (
          <div className={`pt-4 ${className}`}>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                 <p className="text-medium font-semibold">Manage WooCommerce Connections</p>
                 {/* Optionally disable Add button if shops failed to load */}
                 <Button color="primary" variant="solid" size="sm" isDisabled startContent={<Icon icon="solar:add-circle-linear" width={18} />}>
                    Add Connection
                 </Button>
              </div>
              <p className="text-center text-danger py-4">Error loading webshops: {shopsError.message || 'Please try again later.'}</p>
          </div>
      );
  }

  // Render actual content if shops loaded successfully
  return (
    <div className={`space-y-4 pt-4 ${className}`}> {/* Apply className prop */}
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
         <p className="text-medium font-semibold">Manage WooCommerce Connections</p>
         <Button
            color="primary"
            variant="solid"
            size="sm"
            onPress={handleAddClick}
            startContent={<Icon icon="solar:add-circle-linear" width={18} />}
            // Disable if there are no shops to select from
            isDisabled={!shops || shops.length === 0}
         >
            Add Connection
         </Button>
      </div>

      {/* Display message if no shops are available after loading */}
       {!isLoadingShops && shops && shops.length === 0 && (
           <p className="text-center text-gray-500 py-4">No webshops found in your account to connect.</p>
       )}

      {/* List of Existing Connections (only if shops are available) */}
      {shops && shops.length > 0 && (
          <>
              {connections.length === 0 ? (
                 <p className="text-center text-gray-500 py-4">No WooCommerce connections configured yet.</p>
              ) : (
                 <div className="space-y-3">
                    {connections.map((c, idx) => {
                       const shop = shops.find((s) => s.url === c.selectedShopUrl); // shops is guaranteed here
                       const shopDisplayName = shop?.name || c.selectedShopUrl;

                       return (
                         <div
                           key={c.selectedShopUrl || idx}
                           className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3"
                         >
                           {/* Left side */}
                           <div className="flex items-center gap-4">
                             <Icon icon="logos:woocommerce" width={28} className="text-purple-600 flex-shrink-0" />
                             <div>
                               <p className="font-medium">{shopDisplayName}</p>
                               <p className="text-small text-gray-600">Keys configured</p>
                             </div>
                           </div>
                           {/* Right side */}
                           <div className="flex items-center gap-2 flex-shrink-0">
                             <Button variant="light" color="default" size="sm" onPress={() => handleEditClick(idx)} isIconOnly aria-label={`Edit connection for ${shopDisplayName}`}>
                               <Icon icon="solar:pen-linear" width={18} />
                             </Button>
                             <Button variant="light" color="danger" size="sm" onPress={() => handleRemoveClick(idx)} isIconOnly aria-label={`Remove connection for ${shopDisplayName}`}>
                               <Icon icon="solar:trash-bin-minimalistic-linear" width={18} />
                             </Button>
                           </div>
                         </div>
                       );
                    })}
                 </div>
              )}
          </>
      )}


      {/* Add/Edit Connection Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
          <ModalContent>
             {(modalOnClose) => (
               <>
                 <ModalHeader className="flex flex-col gap-1">
                   {isEditing ? 'Edit WooCommerce Connection' : 'Add New WooCommerce Connection'}
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
                    <Select
                        isRequired
                        label="Select Webshop"
                        placeholder="Choose a connected shop"
                        selectedKeys={sel ? [sel] : []}
                        onSelectionChange={(keys) => setSel(Array.from(keys)[0] as string)}
                        variant="bordered"
                        fullWidth
                        aria-label="Select Webshop for WooCommerce Connection"
                        // isLoading={isLoadingShops} // isLoading handled outside now
                        isDisabled={!shops || shops.length === 0} // Disable only if no shops
                    >
                        {/* Populate options from shops context */}
                        {shops && shops.length > 0 ? (
                            shops.map((s) => (
                                <SelectItem key={s.url} value={s.url} textValue={s.name}>
                                    {s.name} ({s.url})
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem key="no-shops" value="" isDisabled>
                                No webshops available
                            </SelectItem>
                        )}
                    </Select>
                 </ModalBody>
                 <ModalFooter>
                   <Button color="danger" variant="light" onPress={modalOnClose}>
                     Cancel
                   </Button>
                   <Button
                     color="primary"
                     onPress={handleSaveConnection}
                     // Disable save if required fields are empty
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
