"use client";

import React, { useState, useEffect } from 'react';
import {
  Button,
  InputOtp,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@heroui/react";
import { Icon } from '@iconify/react';

// Alias components to any to satisfy ReactNode requirements
const ModalX = Modal as any;
const ModalContentX = ModalContent as any;
const ModalHeaderX = ModalHeader as any;
const ModalBodyX = ModalBody as any;
const ModalFooterX = ModalFooter as any;
const InputOtpX = InputOtp as any;
const ButtonX = Button as any;

// Define types for props and action state
interface PinActionState {
  error?: string;
  success?: string;
}

interface RequirePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  setPinAction: (payload: FormData) => void;
  isSettingPin: boolean;
  pinActionState: PinActionState;
}

export default function RequirePinModal({
  isOpen,
  onClose,
  setPinAction,
  isSettingPin,
  pinActionState,
}: RequirePinModalProps): JSX.Element {
  const [pinStep, setPinStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setPinStep(1);
      setFirstPin("");
      setError(null);
      setOtpValue("");
    } else {
      setPinStep(1);
      setFirstPin("");
      setError(null);
      setOtpValue("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (pinActionState.error) {
      setError(pinActionState.error);
    }
  }, [pinActionState.error]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const currentPin = otpValue;

    if (currentPin.length !== 4) {
      setError("Please enter a 4-digit PIN.");
      return;
    }

    if (pinStep === 1) {
      setFirstPin(currentPin);
      setPinStep(2);
      setOtpValue("");
    } else {
      if (currentPin === firstPin) {
        const formData = new FormData();
        formData.append('pin', firstPin);
        setPinAction(formData);
      } else {
        setError("PINs do not match. Please try again.");
        setPinStep(1);
        setFirstPin("");
        setOtpValue("");
      }
    }
  };

  return (
    <ModalX isOpen={isOpen} onClose={onClose} size="md">
      <ModalContentX>
        <ModalHeaderX>{pinStep === 1 ? "Set Your Login PIN" : "Confirm Your PIN"}</ModalHeaderX>
        <form onSubmit={handleSubmit} id="pin-set-form">
          <ModalBodyX>
            <p className="text-small text-default-500 mb-4">
              {pinStep === 1
                ? "Please enter a 4-digit PIN for login."
                : "Please re-enter the 4-digit PIN to confirm."}
            </p>
            <div className="flex justify-center">
              <InputOtpX
                isRequired
                aria-label="PIN input field"
                length={4}
                value={otpValue}
                onValueChange={setOtpValue}
                classNames={{ input: "w-12 h-12 text-xl" }}
              />
            </div>
            {(error || pinActionState.error) && (
              <p className="text-danger text-small mt-3 text-center">{error || pinActionState.error}</p>
            )}
          </ModalBodyX>
          <ModalFooterX>
            <ButtonX variant="bordered" onPress={onClose} isDisabled={isSettingPin}>
              Cancel
            </ButtonX>
            <ButtonX
              color="primary"
              type="submit"
              form="pin-set-form"
              isLoading={isSettingPin}
              isDisabled={otpValue.length !== 4 || isSettingPin}
            >
              {isSettingPin ? "Saving..." : pinStep === 1 ? "Next" : "Confirm & Save PIN"}
            </ButtonX>
          </ModalFooterX>
        </form>
      </ModalContentX>
    </ModalX>
  );
}
