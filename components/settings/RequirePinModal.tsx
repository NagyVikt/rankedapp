// src/components/settings/RequirePinModal.tsx (or your preferred path)
'use client';

import React, { useState, useEffect } from 'react';
import {
    Button,
    InputOtp, // Use the OTP input
    // Form, // Using standard form tag
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
} from "@heroui/react";
import { Icon } from '@iconify/react';

// Define types for props and action state
type PinActionState = {
    error?: string;
    success?: string;
};

interface RequirePinModalProps {
    isOpen: boolean;
    onClose: () => void;
    setPinAction: (payload: FormData) => void; // The server action to set the PIN
    isSettingPin: boolean; // Loading state from useActionState
    pinActionState: PinActionState; // Result state from useActionState
}

export default function RequirePinModal({
    isOpen,
    onClose,
    setPinAction,
    isSettingPin,
    pinActionState,
}: RequirePinModalProps) {
    const [pinStep, setPinStep] = useState<1 | 2>(1); // Control the step (Enter vs Confirm)
    const [firstPin, setFirstPin] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [otpValue, setOtpValue] = useState<string>(""); // Control OTP input value directly

    // Reset state when modal opens or closes
    useEffect(() => {
        if (isOpen) {
            setPinStep(1);
            setFirstPin("");
            setError(null);
            setOtpValue(""); // Clear input on open
        } else {
            // Optional: Clear state on close as well if desired
             setPinStep(1);
             setFirstPin("");
             setError(null);
             setOtpValue("");
        }
    }, [isOpen]);

     // Show server errors
     useEffect(() => {
        if (pinActionState.error) {
            setError(pinActionState.error);
        }
     }, [pinActionState.error]);


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); // Clear previous errors

        // We use the controlled otpValue state here
        const currentPin = otpValue;

        if (currentPin.length !== 4) {
            setError("Please enter a 4-digit PIN.");
            return;
        }

        if (pinStep === 1) {
            setFirstPin(currentPin);
            setPinStep(2);
            setOtpValue(""); // Clear input for next step
        } else { // pinStep === 2
            if (currentPin === firstPin) {
                // Pins match, call the server action
                const formData = new FormData();
                formData.append('pin', firstPin); // Send the confirmed PIN
                setPinAction(formData);
                // Success/error handling and closing will be managed by the parent via pinActionState.success
            } else {
                // Pins don't match
                setError("PINs do not match. Please try again.");
                setPinStep(1); // Go back to step 1
                setFirstPin("");
                setOtpValue(""); // Clear input
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md"> {/* Adjusted size */}
            <ModalContent>
                <ModalHeader>{pinStep === 1 ? "Set Your Login PIN" : "Confirm Your PIN"}</ModalHeader>
                <form onSubmit={handleSubmit} id="pin-set-form">
                    <ModalBody>
                        <p className="text-small text-default-500 mb-4">
                            {pinStep === 1
                                ? "Please enter a 4-digit PIN for login."
                                : "Please re-enter the 4-digit PIN to confirm."}
                        </p>
                        <div className="flex justify-center"> {/* Center the OTP input */}
                            <InputOtp
                                isRequired
                                aria-label="PIN input field"
                                length={4}
                                name="pin" // Name used if submitting directly without controlled state
                                placeholder="----" // Placeholder example
                                value={otpValue} // Controlled component
                                onValueChange={setOtpValue} // Update state on change
                                classNames={{ // Optional: Adjust styling
                                    input: "w-12 h-12 text-xl", // Example: Make inputs bigger
                                }}
                            />
                        </div>
                         {/* Display local validation errors or server errors */}
                        {(error || pinActionState.error) && (
                            <p className="text-danger text-small mt-3 text-center">{error || pinActionState.error}</p>
                         )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="bordered" onPress={onClose} isDisabled={isSettingPin}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            form="pin-set-form" // Not strictly needed if button is inside form
                            isLoading={isSettingPin}
                            isDisabled={otpValue.length !== 4 || isSettingPin} // Disable if not 4 digits or loading
                        >
                            {isSettingPin ? "Saving..." : (pinStep === 1 ? "Next" : "Confirm & Save PIN")}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}