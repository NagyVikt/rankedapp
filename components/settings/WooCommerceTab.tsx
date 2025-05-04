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
    // Select, // No longer needed
    // SelectItem, // No longer needed
    RadioGroup, // Import RadioGroup
    Radio,      // Import Radio
    ScrollShadow // Import ScrollShadow for potentially long lists
} from "@heroui/react"; // Adjust import path if needed
import { Icon } from "@iconify/react";
import { useShops } from "@/context/shops";

// Interface for a single WooCommerce connection entry
export interface WooEntry {
  consumerKey: string;
  consumerSecret: string;
  selectedShopUrl: string;
}

// --- Skeleton Components (Remain the same) ---
const SimpleSkeleton = ({ className }: { className?: string }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);
const WooCommerceTabSkeleton = ({ className }: { className?: string }) => (
    <div className={`space-y-4 pt-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <SimpleSkeleton className="h-5 w-56 rounded" />
            <SimpleSkeleton className="h-9 w-36 rounded" />
        </div>
        {[...Array(2)].map((_, i) => (
             <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between min-h-[76px]">
                <div className="flex items-center gap-4">
                    <SimpleSkeleton className="h-7 w-7 rounded" />
                    <div className="space-y-1.5">
                        <SimpleSkeleton className="h-4 w-32 rounded" />
                        <SimpleSkeleton className="h-3 w-24 rounded" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <SimpleSkeleton className="h-8 w-8 rounded-full" />
                    <SimpleSkeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);
// --- End Skeleton Components ---

interface WooCommerceTabProps {
    className?: string;
}

export default function WooCommerceTab({ className }: WooCommerceTabProps) {
  // --- State and Hooks (Remain the same) ---
  const { shops, isLoading: isLoadingShops, error: shopsError } = useShops();
  const [connections, setConnections] = useState<WooEntry[]>([]);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [ck, setCk] = useState("");
  const [cs, setCs] = useState("");
  const [sel, setSel] = useState<string>(""); // State for selected shop URL remains

  // --- useEffect and Handlers (Remain the same) ---
   useEffect(() => {
    const raw = localStorage.getItem("wooConnections");
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setConnections(parsed);
            } else {
                console.error("Stored wooConnections is not an array:", parsed);
                setConnections([]);
            }
        } catch (error) {
            console.error("Failed to parse wooConnections from localStorage:", error);
            setConnections([]);
        }
    }
  }, []);

  const saveAll = useCallback((next: WooEntry[]) => {
    if (!Array.isArray(next)) {
        console.error("Attempted to save non-array to wooConnections");
        return;
    }
    try {
        const jsonValue = JSON.stringify(next);
        localStorage.setItem("wooConnections", jsonValue);
        setConnections(next);
    } catch (error) {
        console.error("Failed to stringify or save wooConnections:", error);
        alert("Failed to save connections to local storage.");
    }
  }, []);

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingIndex(null);
    setCk("");
    setCs("");
    setSel(""); // Ensure selection is cleared
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
    // Selection state 'sel' is still used for validation and saving
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

  // --- Render Logic (Skeletons/Error handling remain the same) ---
   if (isLoadingShops) {
      return <WooCommerceTabSkeleton className={className} />;
  }

  if (shopsError) {
      return (
          <div className={`pt-4 ${className}`}>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                 <p className="text-medium font-semibold">Manage WooCommerce Connections</p>
                 <Button color="primary" variant="solid" size="sm" isDisabled startContent={<Icon icon="solar:add-circle-linear" width={18} />}>
                    Add Connection
                 </Button>
              </div>
              <p className="text-center text-danger py-4">Error loading webshops: {shopsError.message || 'Please try again later.'}</p>
          </div>
      );
  }

  return (
    <div className={`space-y-4 pt-4 ${className}`}>
       {/* Header and Connection List (Remain the same) */}
       <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
         <p className="text-medium font-semibold">Manage WooCommerce Connections</p>
         <Button
            color="primary"
            variant="solid"
            size="sm"
            onPress={handleAddClick}
            startContent={<Icon icon="solar:add-circle-linear" width={18} />}
            isDisabled={!shops || shops.length === 0}
         >
            Add Connection
         </Button>
      </div>
       {!isLoadingShops && shops && shops.length === 0 && (
           <p className="text-center text-gray-500 py-4">No webshops found in your account to connect.</p>
       )}
      {shops && shops.length > 0 && (
          <>
              {connections.length === 0 ? (
                 <p className="text-center text-gray-500 py-4">No WooCommerce connections configured yet.</p>
              ) : (
                 <div className="space-y-3">
                    {connections.map((c, idx) => {
                       const shop = shops.find((s) => s.url === c.selectedShopUrl);
                       const shopDisplayName = shop?.name || c.selectedShopUrl;
                       return (
                         <div key={c.selectedShopUrl || idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-3">
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
      <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          backdrop="blur"
          size="xl"
          scrollBehavior="inside" // Allow modal body to scroll if content overflows
      >
        <ModalContent>
          {(modalOnClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? 'Edit WooCommerce Connection' : 'Add New WooCommerce Connection'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                {/* Input fields remain the same */}
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

                {/* --- REPLACEMENT: Use RadioGroup instead of Select --- */}
                <RadioGroup
                    label="Select Webshop"
                    value={sel} // Bind value to the 'sel' state
                    onValueChange={setSel} // Update 'sel' state directly on change
                    isRequired={true} // Mark as required
                    aria-label="Select Webshop for WooCommerce Connection"
                    // className="max-h-48 overflow-y-auto" // Add max-height and scroll if needed
                >
                     {/* Optional: Wrap radios in ScrollShadow for better UX if list is long */}
                     {/* <ScrollShadow className="max-h-48 w-full"> */}
                        {shops && shops.length > 0 ? (
                            shops.map((s) => (
                                <Radio key={s.url} value={s.url}>
                                    {s.name} ({s.url})
                                </Radio>
                            ))
                        ) : (
                           // Show a message if no shops, though the parent button is disabled anyway
                           <p className="text-sm text-gray-500">No webshops available</p>
                        )}
                    {/* </ScrollShadow> */}
                </RadioGroup>
                {/* --- END REPLACEMENT --- */}

              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={modalOnClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveConnection}
                  // Validation still uses the 'sel' state, which is now controlled by RadioGroup
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