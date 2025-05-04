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
    RadioGroup,
    Radio,
    ScrollShadow,
    Skeleton // Import Skeleton
} from "@heroui/react"; // Assuming HeroUI components handle dark theme via context
import { Icon } from "@iconify/react";
import { useShops } from "@/context/shops";

// Interface for a single WooCommerce connection entry
export interface WooEntry {
  consumerKey: string;
  consumerSecret: string;
  selectedShopUrl: string;
}

// --- Skeleton Components (Adapted for Dark Mode) ---
// Using HeroUI Skeleton component is preferred if available and adaptable
// If using custom divs, adjust background colors for dark mode

// Simple Skeleton - Adapts bg color for dark theme
const SimpleSkeleton = ({ className }: { className?: string }) => (
    // Use HeroUI theme colors if possible (e.g., bg-default-200/300), otherwise fallback
    <div className={`bg-default-300 dark:bg-default-200 rounded animate-pulse ${className}`}></div>
);

// Tab Skeleton - Adapts bg/border colors for dark theme
const WooCommerceTabSkeleton = ({ className }: { className?: string }) => (
    // Use HeroUI Skeleton component for a more integrated look
    <div className={`space-y-4 pt-4 ${className}`}>
         <div className="flex justify-between items-center mb-4">
             <Skeleton className="h-5 w-56 rounded-lg" />
             <Skeleton className="h-9 w-36 rounded-lg" />
         </div>
         {[...Array(2)].map((_, i) => (
              // Use Skeleton to wrap the structure if complex, or style divs
              <div key={i} className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex items-center justify-between min-h-[76px]">
                 <div className="flex items-center gap-4 w-full"> {/* Ensure skeleton takes space */}
                     <Skeleton className="h-7 w-7 rounded-md flex-shrink-0" />
                     <div className="space-y-2 w-full"> {/* Use gap-2 */}
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
  const [sel, setSel] = useState<string>("");

  // --- useEffect and Handlers (Remain the same) ---
   useEffect(() => {
    const raw = localStorage.getItem("wooConnections");
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setConnections(parsed);
            } else { setConnections([]); }
        } catch { setConnections([]); }
    }
  }, []);

  const saveAll = useCallback((next: WooEntry[]) => {
    if (!Array.isArray(next)) return;
    try {
        localStorage.setItem("wooConnections", JSON.stringify(next));
        setConnections(next);
    } catch (error) {
        console.error("Failed to save wooConnections:", error);
        alert("Failed to save connections.");
    }
  }, []);

  const handleAddClick = () => {
    setIsEditing(false); setEditingIndex(null); setCk(""); setCs(""); setSel("");
    onOpen();
  };

  const handleEditClick = (index: number) => {
    const conn = connections[index];
    if (!conn) return;
    setIsEditing(true); setEditingIndex(index); setCk(conn.consumerKey); setCs(conn.consumerSecret); setSel(conn.selectedShopUrl);
    onOpen();
  };

  const handleSaveConnection = () => {
    const trimmedCk = ck.trim();
    const trimmedCs = cs.trim();
    if (!trimmedCk || !trimmedCs || !sel) {
        alert("Please fill all fields and select a Webshop.");
        return;
    }
    const newEntry: WooEntry = { consumerKey: trimmedCk, consumerSecret: trimmedCs, selectedShopUrl: sel };
    let updatedConnections: WooEntry[];
    if (isEditing && editingIndex !== null) {
        updatedConnections = connections.map((conn, index) => index === editingIndex ? newEntry : conn);
    } else {
        const exists = connections.some(conn => conn.selectedShopUrl === sel);
        if (exists) {
            alert(`Connection for ${shops?.find(s => s.url === sel)?.name || sel} already exists.`);
            return;
        }
        updatedConnections = [...connections, newEntry];
    }
    saveAll(updatedConnections);
    onClose();
  };

  const handleRemoveClick = (indexToRemove: number) => {
    const shopName = shops?.find(s => s.url === connections[indexToRemove]?.selectedShopUrl)?.name || connections[indexToRemove]?.selectedShopUrl;
    if (window.confirm(`Remove connection for ${shopName}?`)) {
        saveAll(connections.filter((_, index) => index !== indexToRemove));
    }
  };

  // --- Render Logic ---
  // Use Skeleton component directly if preferred over WooCommerceTabSkeleton
   if (isLoadingShops) {
      // return <WooCommerceTabSkeleton className={className} />;
       // Or use HeroUI Skeletons directly
       return (
           <div className={`space-y-4 pt-4 ${className}`}>
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-5 w-56 rounded-lg" />
                    <Skeleton className="h-9 w-36 rounded-lg" />
                </div>
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="p-4 rounded-lg min-h-[76px] w-full"/>
                ))}
           </div>
       )
  }

  if (shopsError) {
      return (
           // Assuming parent sets dark theme, text-danger should work
          <div className={`pt-4 text-center ${className}`}>
              <p className="text-medium font-semibold mb-4 text-foreground">Manage WooCommerce Connections</p>
              <p className="text-danger py-4">Error loading webshops: {shopsError.message || 'Please try again.'}</p>
          </div>
      );
  }

  return (
     // Assuming parent container handles dark theme context (e.g., <main className="dark text-foreground bg-background">)
    <div className={`space-y-4 pt-4 ${className}`}>
       {/* Header */}
       <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
         <p className="text-medium font-semibold text-foreground">Manage WooCommerce Connections</p>
         <Button
            color="primary"
            // variant="solid" // Solid might be too bright, try flat or bordered
            variant="flat" // Flat often looks good in dark mode
            size="sm"
            onPress={handleAddClick}
            startContent={<Icon icon="solar:add-circle-linear" width={18} />}
            isDisabled={!shops || shops.length === 0}
            className="dark:text-primary-foreground" // Ensure text contrast if needed
         >
            Add Connection
         </Button>
      </div>

      {/* Empty States */}
       {!isLoadingShops && shops && shops.length === 0 && (
           // Use theme-aware text color
           <p className="text-center text-default-500 py-4">No webshops found in your account to connect.</p>
       )}

      {/* Connection List */}
      {shops && shops.length > 0 && (
          <>
              {connections.length === 0 ? (
                 // Use theme-aware text color
                 <p className="text-center text-default-500 py-4">No WooCommerce connections configured yet.</p>
              ) : (
                 <div className="space-y-3">
                    {connections.map((c, idx) => {
                       const shop = shops.find((s) => s.url === c.selectedShopUrl);
                       const shopDisplayName = shop?.name || c.selectedShopUrl;
                       return (
                          // Use theme-aware background and border
                         <div key={c.selectedShopUrl || idx} className="p-4 bg-content1 dark:bg-content1 border border-divider rounded-lg flex flex-wrap items-center justify-between gap-3">
                           <div className="flex items-center gap-4">
                             <Icon icon="logos:woocommerce" width={28} className="text-purple-600 flex-shrink-0" />
                             <div>
                                {/* Use theme-aware text colors */}
                               <p className="font-medium text-foreground">{shopDisplayName}</p>
                               <p className="text-small text-foreground-500">Keys configured</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-1"> {/* Reduced gap */}
                             <Button
                                variant="light"
                                color="default" // Default color should adapt
                                size="sm"
                                onPress={() => handleEditClick(idx)}
                                isIconOnly
                                aria-label={`Edit connection for ${shopDisplayName}`}
                                className="text-default-500 hover:text-foreground" // Ensure hover color
                             >
                               <Icon icon="solar:pen-linear" width={18} />
                             </Button>
                             <Button
                                variant="light"
                                color="danger" // Danger color should adapt
                                size="sm"
                                onPress={() => handleRemoveClick(idx)}
                                isIconOnly
                                aria-label={`Remove connection for ${shopDisplayName}`}
                                className="text-danger-400 hover:text-danger-300" // Explicit danger text color for light variant
                             >
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

      {/* Add/Edit Connection Modal - Should adapt to dark theme via HeroUI context */}
      <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          backdrop="blur"
          size="xl"
          scrollBehavior="inside"
          // className="dark" // Usually not needed here if parent has it
      >
        <ModalContent>
          {(modalOnClose) => (
            <>
              {/* Header text should adapt */}
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? 'Edit WooCommerce Connection' : 'Add New WooCommerce Connection'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                {/* Inputs should adapt */}
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

                {/* Radio Group should adapt */}
                <RadioGroup
                    label="Select Webshop"
                    value={sel}
                    onValueChange={setSel}
                    isRequired={true}
                    aria-label="Select Webshop for WooCommerce Connection"
                    className="mt-2" // Add some margin if needed
                >
                     {/* Optional ScrollShadow for long lists */}
                     <ScrollShadow className="max-h-48 w-full pr-2">
                        {shops && shops.length > 0 ? (
                            shops.map((s) => (
                                <Radio key={s.url} value={s.url}>
                                     {/* Radio label text should adapt */}
                                    {s.name} <span className="text-default-500 text-xs">({s.url})</span>
                                </Radio>
                            ))
                        ) : (
                           <p className="text-sm text-default-500 italic px-1">No webshops available</p>
                        )}
                    </ScrollShadow>
                </RadioGroup>

              </ModalBody>
              <ModalFooter>
                 {/* Buttons should adapt */}
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