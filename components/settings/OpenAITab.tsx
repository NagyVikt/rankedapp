// app/dashboard/settings/OpenAITab.tsx
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
    useDisclosure
} from "@heroui/react"; // Adjust import path if needed
import { Icon } from "@iconify/react";

// Simple mask helper for API keys (shows first/last few chars)
const maskApiKey = (key: string): string => {
  if (!key || key.length <= 8) {
    return "••••••••"; // Mask short or empty keys
  }
  // Example: sk-...-wxyz
  return `${key.slice(0, 5)}••••${key.slice(-4)}`;
};

// Define props if any are passed from SettingsComponent (e.g., className)
interface OpenAITabProps {
    className?: string;
}

export default function OpenAITab({ className }: OpenAITabProps) {
  // State for the stored API key
  const [apiKey, setApiKey] = useState<string>("");
  // State for the input field within the modal
  const [tempApiKey, setTempApiKey] = useState<string>("");
  // State to track if a key is configured (derived from apiKey length)
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  // Modal state management
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedKey = localStorage.getItem("openaiApiKey");
    if (storedKey) {
      setApiKey(storedKey);
      setIsConfigured(true);
    } else {
        setApiKey(""); // Ensure state is reset if key removed elsewhere
        setIsConfigured(false);
    }
  }, []);

  // Persist helper: Saves the key to localStorage and updates state
  const saveKey = useCallback((keyToSave: string) => {
    const trimmedKey = keyToSave.trim();
    // Basic validation: check if it looks like an OpenAI key (starts with sk-)
    if (!trimmedKey) {
        alert("API Key cannot be empty.");
        return; // Don't save empty key
    }
     if (!trimmedKey.startsWith("sk-")) {
        alert("Invalid OpenAI API Key format. It should start with 'sk-'.");
        return;
     }

    try {
        localStorage.setItem("openaiApiKey", trimmedKey);
        setApiKey(trimmedKey);
        setIsConfigured(true);

        // --- Optional: Save to cookie if needed for API routes ---
        // const value = encodeURIComponent(trimmedKey);
        // document.cookie = `openaiApiKey=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`; // 1 year expiry
        // --- End Optional Cookie Save ---

        onClose(); // Close modal on successful save
    } catch (error) {
        console.error("Failed to save OpenAI API key to localStorage:", error);
        alert("Failed to save API key. Local storage might be full or disabled.");
    }
  }, [onClose]); // Dependency on onClose to close modal

  // Remove helper: Clears the key from localStorage and updates state
  const removeKey = useCallback(() => {
    try {
        localStorage.removeItem("openaiApiKey");
        setApiKey("");
        setIsConfigured(false);

        // --- Optional: Remove cookie ---
        // document.cookie = 'openaiApiKey=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        // --- End Optional Cookie Remove ---

        // Optionally add user feedback (e.g., toast notification)
        console.log("OpenAI API Key removed.");
    } catch (error) {
         console.error("Failed to remove OpenAI API key from localStorage:", error);
         alert("Failed to remove API key.");
    }
  }, []); // No dependencies

  // Handler to open the modal and pre-fill input with the current key
  const handleEditClick = () => {
    setTempApiKey(apiKey); // Load current key into modal input for editing
    onOpen();
  };

  // Handler for modal save button click
  const handleSaveClick = () => {
      saveKey(tempApiKey); // Save the key from the modal's input state
  };

  // Handler for the main remove button click
  const handleRemoveClick = () => {
      // Add a confirmation dialog for better UX
      const confirmRemove = window.confirm("Are you sure you want to remove the OpenAI API Key?");
      if (confirmRemove) {
          removeKey();
      }
  }

  return (
    <div className={`space-y-6 pt-4 ${className}`}> {/* Apply className prop */}
      {/* Header */}
      <p className="text-medium font-semibold">Manage OpenAI API Key</p>

      {/* Display Area */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-4"> {/* Added flex-wrap and gap */}
        {/* Left side: Icon and Status */}
        <div className="flex items-center gap-4">
           {/* Use an appropriate OpenAI icon */}
          <Icon icon="simple-icons:openai" width={28} className={isConfigured ? "text-green-600" : "text-gray-400"} />
          <div>
            <p className="font-medium">OpenAI</p>
            {isConfigured ? (
               <p className="text-small text-gray-600">
                 API Key: <span className="font-mono bg-gray-200 px-1 rounded text-xs">{maskApiKey(apiKey)}</span>
              </p>
            ) : (
              <p className="text-small text-gray-500">No API Key configured.</p>
            )}
          </div>
        </div>
        {/* Right side: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="light"
            color="default"
            size="sm"
            onPress={handleEditClick} // Open modal
            startContent={<Icon icon="solar:pen-linear" width={16} />}
          >
             {isConfigured ? 'Edit Key' : 'Configure Key'}
          </Button>
          {/* Show remove button only if a key is configured */}
          {isConfigured && (
            <Button
              variant="light"
              color="danger"
              size="sm"
              onPress={handleRemoveClick} // Trigger removal confirmation
              startContent={<Icon icon="solar:trash-bin-minimalistic-linear" width={16} />}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

       {/* Edit/Add Modal */}
       <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
          <ModalContent>
             {(modalOnClose) => ( // Use the onClose provided by ModalContent for the cancel button
               <>
                 <ModalHeader className="flex flex-col gap-1">
                   {isConfigured ? 'Edit OpenAI API Key' : 'Configure OpenAI API Key'}
                 </ModalHeader>
                 <ModalBody>
                   <p className="text-small text-gray-600 mb-2">
                       Enter your secret API key from OpenAI. It will be stored securely in your browser's local storage.
                   </p>
                   <Input
                      // Use label prop for accessibility
                      label="OpenAI API Key"
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      variant="bordered" // Example variant, adjust as needed
                      value={tempApiKey}
                      onValueChange={setTempApiKey} // Preferred way for HeroUI/NextUI
                      type="password" // Mask input visually
                      autoFocus // Focus input when modal opens
                      fullWidth
                      // Add aria-label for screen readers if label is hidden visually
                      aria-label="OpenAI API Key Input"
                   />
                   {/* Optional: Add link to OpenAI API keys page */}
                   <p className="text-xs text-gray-500 mt-2">
                       Find your API keys on the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI website</a>.
                   </p>
                 </ModalBody>
                 <ModalFooter>
                   <Button color="danger" variant="light" onPress={modalOnClose}>
                     Cancel
                   </Button>
                   <Button
                     color="primary" // Use appropriate color from HeroUI
                     onPress={handleSaveClick} // Trigger save logic
                     // Disable save if input is empty/whitespace or doesn't look like a key
                     isDisabled={!tempApiKey.trim() || !tempApiKey.startsWith("sk-")}
                   >
                     Save Key
                   </Button>
                 </ModalFooter>
               </>
             )}
          </ModalContent>
       </Modal>

    </div>
  );
}
