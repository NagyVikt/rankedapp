// app/dashboard/settings/ApiKeyManager.tsx
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

// Configuration Type for each API Key
export interface ApiKeyConfig {
    id: string; // Unique identifier (e.g., 'openai', 'gemini')
    name: string; // Display name (e.g., 'OpenAI', 'Google Gemini')
    icon: string; // Iconify icon identifier (e.g., 'simple-icons:openai')
    localStorageKey: string; // Key used for localStorage
    keyPrefix?: string | null; // Optional prefix for basic validation (e.g., 'sk-')
    validationRegex?: RegExp | null; // Optional regex for more complex validation
    docsUrl?: string; // Optional link to the provider's API key documentation
    placeholder?: string; // Optional placeholder text for the input
    infoText?: string; // Optional extra info text in the modal
}

// Props for the manager component
interface ApiKeyManagerProps {
    config: ApiKeyConfig;
}

// Masking function (can be a shared utility)
const maskApiKey = (key: string): string => {
  if (!key || key.length <= 8) return "••••••••";
  // Show first 5 and last 4 chars
  return `${key.slice(0, 5)}••••${key.slice(-4)}`;
};

export function ApiKeyManager({ config }: ApiKeyManagerProps) {
    // State specific to this API key instance
    const [apiKey, setApiKey] = useState<string>("");
    const [tempApiKey, setTempApiKey] = useState<string>("");
    const [isConfigured, setIsConfigured] = useState<boolean>(false);
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    // Load key on mount based on config
    useEffect(() => {
        const storedKey = localStorage.getItem(config.localStorageKey);
        if (storedKey) {
            setApiKey(storedKey);
            setIsConfigured(true);
        } else {
            setApiKey("");
            setIsConfigured(false);
        }
    }, [config.localStorageKey]);

    // --- Action Handlers (Save, Remove, Modal interactions) ---

    const saveKey = useCallback((keyToSave: string) => {
        const trimmedKey = keyToSave.trim();
        if (!trimmedKey) {
            alert(`${config.name} API Key cannot be empty.`);
            return false;
        }
        // Prefix validation
        if (config.keyPrefix && !trimmedKey.startsWith(config.keyPrefix)) {
            alert(`Invalid ${config.name} API Key format. It should start with '${config.keyPrefix}'.`);
            return false;
        }
        // Regex validation (if provided)
        if (config.validationRegex && !config.validationRegex.test(trimmedKey)) {
             alert(`Invalid ${config.name} API Key format.`);
             return false;
        }

        try {
            localStorage.setItem(config.localStorageKey, trimmedKey);
            setApiKey(trimmedKey);
            setIsConfigured(true);
            onClose();
            return true; // Indicate success
        } catch (error) {
            console.error(`Failed to save ${config.name} API key:`, error);
            alert(`Failed to save ${config.name} API key. Storage might be full or disabled.`);
            return false; // Indicate failure
        }
    }, [config, onClose]);

    const removeKey = useCallback(() => {
        try {
            localStorage.removeItem(config.localStorageKey);
            setApiKey("");
            setIsConfigured(false);
        } catch (error) {
            console.error(`Failed to remove ${config.name} API key:`, error);
            alert(`Failed to remove ${config.name} API key.`);
        }
    }, [config.localStorageKey]);

    const handleEditClick = () => {
        setTempApiKey(apiKey); // Pre-fill modal input with current key
        onOpen();
    };

    const handleSaveClick = () => {
        saveKey(tempApiKey);
    };

    const handleRemoveClick = () => {
        if (window.confirm(`Are you sure you want to remove the ${config.name} API Key?`)) {
            removeKey();
        }
    };

    // Check if save button should be disabled based on validation rules
    const isSaveDisabled = () => {
        const trimmedKey = tempApiKey.trim();
        if (!trimmedKey) return true;
        if (config.keyPrefix && !trimmedKey.startsWith(config.keyPrefix)) return true;
        if (config.validationRegex && !config.validationRegex.test(trimmedKey)) return true;
        return false;
    };

    // --- Render Logic ---
    return (
        // Apply dark theme classes (using theme-aware HeroUI/NextUI conventions)
        <div className="p-4 bg-content1 border border-divider rounded-lg flex flex-wrap items-center justify-between gap-4 min-h-[76px]">
            {/* Left side: Icon and Status */}
            <div className="flex items-center gap-4">
                <Icon
                    icon={config.icon}
                    width={28}
                    className={isConfigured ? "text-success" : "text-default-400"} // Use semantic colors
                />
                <div>
                    <p className="font-medium text-foreground">{config.name}</p>
                    {isConfigured ? (
                        <p className="text-small text-foreground-500">
                            API Key: <span className="font-mono bg-content2 px-1 rounded text-xs">{maskApiKey(apiKey)}</span> {/* Use content2 for nested bg */}
                        </p>
                    ) : (
                        <p className="text-small text-default-500">No API Key configured.</p>
                    )}
                </div>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                    variant="light" // Light variant for less emphasis
                    size="sm"
                    onPress={handleEditClick}
                    startContent={<Icon icon="solar:pen-linear" width={16} />}
                    // Text color for light variant might need slight adjustment in dark mode
                    className="text-default-700 dark:text-default-400 hover:text-foreground dark:hover:text-foreground"
                >
                    {isConfigured ? 'Edit Key' : 'Configure Key'}
                </Button>
                {isConfigured && (
                    <Button
                        variant="light"
                        color="danger" // Use danger color semantic
                        size="sm"
                        onPress={handleRemoveClick}
                        startContent={<Icon icon="solar:trash-bin-minimalistic-linear" width={16} />}
                         // Text color for light variant might need slight adjustment in dark mode
                        className="text-danger dark:text-danger-400 hover:text-danger-600 dark:hover:text-danger-300"
                    >
                        Remove
                    </Button>
                )}
            </div>

            {/* Edit/Add Modal - HeroUI handles dark theme internally */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" placement="center">
                <ModalContent>
                    {(modalOnClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-foreground"> {/* Ensure header text color */}
                                {isConfigured ? `Edit ${config.name} API Key` : `Configure ${config.name} API Key`}
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-small text-foreground-500 mb-2"> {/* Body text color */}
                                    Enter your secret API key from {config.name}. It's stored only in your browser.
                                </p>
                                {config.infoText && <p className="text-xs text-warning mb-3">{config.infoText}</p>}
                                <Input
                                    label={`${config.name} API Key`}
                                    placeholder={config.placeholder || (config.keyPrefix ? `${config.keyPrefix}xxxxxxxxxx` : "Enter your API key")}
                                    variant="bordered"
                                    value={tempApiKey}
                                    onValueChange={setTempApiKey}
                                    type="password" // Mask visually
                                    autoFocus
                                    fullWidth
                                    aria-label={`${config.name} API Key Input`}
                                />
                                {config.docsUrl && (
                                    <p className="text-xs text-default-500 mt-3"> {/* Link text color */}
                                        Find your API keys on the <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official {config.name} website</a>.
                                    </p>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={modalOnClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSaveClick}
                                    isDisabled={isSaveDisabled()}
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