// app/dashboard/settings/security-settings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';

// --- HeroUI React Imports ---
import {
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner, // Keep Spinner for modal loading states
    Switch,
    useDisclosure,
} from "@heroui/react"; // Adjust import path
import { Icon } from '@iconify/react';

// --- Your HeroUI Custom Component Imports ---
// Assuming these exist and paths are correct
import CellWrapper from '@/components/settings/cell-wrapper'; // Adjust path if needed
import RequirePinModal from '@/components/settings/RequirePinModal'; // Import the new modal

// --- Server Actions (Simulated with async functions) ---
// (Keep your existing action simulation functions here)
async function updatePasswordAction(formData: FormData): Promise<{ success?: string; error?: string }> {
    console.log("Simulating password update:", Object.fromEntries(formData));
    await new Promise(res => setTimeout(res, 1000));
    if (formData.get('newPassword') !== formData.get('confirmPassword')) {
        return { error: "New passwords do not match." };
    }
    const success = Math.random() > 0.3;
    if (success) {
        return { success: "Password updated successfully." };
    } else {
        return { error: "Incorrect current password (simulated)." };
    }
}
async function deleteAccountAction(formData: FormData): Promise<{ success?: string; error?: string }> {
    console.log("Simulating account deletion:", Object.fromEntries(formData));
    await new Promise(res => setTimeout(res, 1500));
    return { error: "Account deletion failed (simulated)." };
}
async function updateAccountAction(formData: FormData): Promise<{ success?: string; error?: string }> {
    console.log("Simulating account update:", Object.fromEntries(formData));
    await new Promise(res => setTimeout(res, 1000));
     return { success: "Account details updated." };
}
async function setAccountPinAction(formData: FormData): Promise<{ success?: string; error?: string }> {
    console.log("Simulating PIN set/change:", Object.fromEntries(formData));
    await new Promise(res => setTimeout(res, 1000));
    if (formData.get('pin') !== formData.get('confirmPin')) {
         return { error: "PINs do not match." };
    }
    return { success: "PIN updated successfully." };
}
async function togglePinRequirementAction(isEnabled: boolean): Promise<{ success?: string; error?: string }> {
    console.log("Simulating toggle PIN requirement:", isEnabled);
     await new Promise(res => setTimeout(res, 500));
    return { success: `PIN requirement ${isEnabled ? 'enabled' : 'disabled'}.` };
}
// --- End Simulated Actions ---


// --- State Types ---
type ActionState = {
  error?: string;
  success?: string;
  pending?: boolean;
};

// --- Data Types ---
type User = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  pinEnabled: boolean;
  isPinSet: boolean;
};

// --- Helper Functions ---
const fetcher = async (url: string): Promise<User> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as any;
    try { error.info = await res.json(); } catch (e) {}
    error.status = res.status;
    throw error;
  }
  const data = await res.json();
   // Basic validation (optional but recommended)
   if (typeof data?.pinEnabled === 'undefined' || typeof data?.isPinSet === 'undefined') {
       console.warn("Fetched user data missing expected PIN fields:", data);
       // Provide defaults or handle error
       // Example: return { ...data, pinEnabled: false, isPinSet: false };
   }
  return data as User;
}

// --- Skeleton Components (Defined within this file) ---
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

const SecuritySettingsSkeleton = ({ className }: { className?: string }) => (
   <div className={`space-y-2 max-w-4xl ${className}`}> {/* Apply className prop */}
      {/* Header Skeleton */}
      <div className="px-4 pt-4 pb-0 mb-2">
         <SimpleSkeleton className="h-5 w-48 rounded mb-1" /> {/* Title */}
         <SimpleSkeleton className="h-4 w-64 rounded mb-4" /> {/* Subtitle */}
      </div>
      {/* Settings Rows Skeleton */}
      <div className="px-0"> {/* Remove padding here, CellWrapper might have it */}
        {[...Array(7)].map((_, i) => ( // Simulate 7 setting rows (incl. delete)
          <div key={i} className="flex justify-between items-center p-3 border-b border-gray-100 min-h-[68px]"> {/* Mimic CellWrapper structure */}
              <div className="flex-grow mr-4 space-y-1.5">
                  <SimpleSkeleton className="h-4 w-32 rounded" /> {/* Label */}
                  <SimpleSkeleton className="h-3 w-48 rounded" /> {/* Description */}
              </div>
              {/* Make last button red-ish */}
              <SimpleSkeleton className={`h-8 w-28 rounded-full ${i === 6 ? 'bg-red-200' : ''}`} /> {/* Button Skeleton */}
          </div>
       ))}
      </div>
   </div>
);
// --- End Skeleton Components ---


// --- Main Security Settings Component ---
interface SecuritySettingsProps {
    className?: string;
}

export default function SecuritySettings({ className }: SecuritySettingsProps) {
  // --- Modal State Hooks ---
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isEmailModalOpen, onOpen: onEmailModalOpen, onClose: onEmailModalClose } = useDisclosure();
  const { isOpen: isPinModalOpen, onOpen: onPinModalOpen, onClose: onPinModalClose } = useDisclosure();

  // --- Password Visibility State ---
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirmPassword, setShowDeleteConfirmPassword] = useState(false);

  // --- Action States (Manual tracking) ---
  const [passwordState, setPasswordState] = useState<ActionState>({});
  const [deleteState, setDeleteState] = useState<ActionState>({});
  const [accountState, setAccountState] = useState<ActionState>({});
  const [pinState, setPinState] = useState<ActionState>({});
  const [pinToggleState, setPinToggleState] = useState<ActionState>({});

  // --- Data Fetching ---
  // Added suspense: true to let SWR handle the loading state display via React Suspense
  // This simplifies the loading check below. Ensure parent component has <Suspense> boundary if needed.
  const { data: user, error: userError, isLoading: isUserLoading, mutate: mutateUser } = useSWR<User>(
      '/api/user', // Replace with your API endpoint
      fetcher,
      { suspense: false } // Set suspense: false to handle loading state manually
  );

  // --- Action Handlers (Using async/await) ---
  // (Keep your existing action handlers: handlePasswordSubmit, handleDeleteSubmit, etc.)
  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPasswordState({ pending: true, error: undefined, success: undefined });
      const formData = new FormData(event.target as HTMLFormElement);
      const result = await updatePasswordAction(formData);
      setPasswordState({ ...result, pending: false });
      if (result.success) {
          onPasswordModalClose();
      }
  };
  const handleDeleteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setDeleteState({ pending: true, error: undefined, success: undefined });
      const formData = new FormData(event.target as HTMLFormElement);
      const result = await deleteAccountAction(formData);
      setDeleteState({ ...result, pending: false });
      if (result.success) {
          console.log("Account deletion successful (simulated).");
          onDeleteModalClose();
      }
  };
   const handleAccountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAccountState({ pending: true, error: undefined, success: undefined });
      const formData = new FormData(event.target as HTMLFormElement);
      const result = await updateAccountAction(formData);
      setAccountState({ ...result, pending: false });
      if (result.success) {
          onEmailModalClose();
          mutateUser();
      }
  };
   const handlePinSubmit = async (formData: FormData) => {
      setPinState({ pending: true, error: undefined, success: undefined });
      const result = await setAccountPinAction(formData);
      setPinState({ ...result, pending: false });
      if (result.success) {
          onPinModalClose();
          mutateUser();
      }
      return result;
  };
   const handlePinEnableToggle = async (isSelected: boolean) => {
      setPinToggleState({ pending: true, error: undefined, success: undefined });
      const result = await togglePinRequirementAction(isSelected);
      setPinToggleState({ ...result, pending: false });
      if (result.success) {
          mutateUser();
      } else {
          alert(`Failed to toggle PIN: ${result.error}`);
      }
  };
  // --- End Action Handlers ---


  // --- Reusable Toggle Icon Component ---
  const PasswordToggleIcon = ({ isVisible, onPress }: { isVisible: boolean; onPress: () => void }) => (
    <button type="button" onClick={onPress} className="focus:outline-none p-1" aria-label={isVisible ? "Hide password" : "Show password"}>
        {isVisible ? (<Icon icon="solar:eye-linear" className="text-xl text-default-400 pointer-events-none" />) : (<Icon icon="solar:eye-closed-linear" className="text-xl text-default-400 pointer-events-none" />)}
    </button>
  );

  // --- Render Loading State using Skeleton ---
  // Check isUserLoading explicitly since suspense is false
   if (isUserLoading) {
     // Render the specific skeleton for this section
     return <SecuritySettingsSkeleton className={className} />;
   }

  // --- Render Error State ---
   if (userError) {
     return <div className={`p-4 text-danger text-center ${className}`}>Error loading user information. Please try again later.</div>;
   }

  // --- Render "No User Data" State ---
   if (!user) {
       // Handle case where data is fetched but user is null/undefined
       return <div className={`p-4 text-warning text-center ${className}`}>Could not retrieve user information.</div>;
   }

  // --- Render Component Body ---
  return (
    <>
        {/* Using div, assuming parent Card provides structure */}
        <div className={`w-full max-w-4xl p-2 ${className}`}>
            <div className="flex flex-col items-start px-4 pb-0 pt-4"> {/* Mimic CardHeader */}
                <p className="text-large font-semibold">Security Settings</p>
                <p className="text-small text-default-500">Manage your account security preferences</p>
            </div>
            <div className="space-y-2 p-4"> {/* Mimic CardBody */}
                {/* --- Email Address Cell --- */}
                <CellWrapper>
                    <div>
                        <p className="font-medium">Email Address</p>
                        <p className="text-small text-default-500">The email address associated with your account.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-4 sm:flex-nowrap">
                        <div className="flex flex-col items-end">
                            <p className="text-small">{user.email ?? 'N/A'}</p>
                            {user.emailVerified === true && (<p className="text-tiny text-success">Verified</p>)}
                            {user.emailVerified === false && (<p className="text-tiny text-warning">Not Verified</p>)}
                            {user.emailVerified === null && (<p className="text-tiny text-default-400">Verification status unknown</p>)}
                        </div>
                        <Button size="sm" radius="full" variant="bordered" endContent={<Icon icon="solar:pen-2-linear" />} onPress={onEmailModalOpen}> Edit </Button>
                    </div>
                </CellWrapper>

                {/* --- Password Cell --- */}
                <CellWrapper>
                   <div><p className="font-medium">Password</p><p className="text-small text-default-500">Set a unique password to protect your account.</p></div>
                   <Button size="sm" radius="full" variant="bordered" onPress={onPasswordModalOpen}>Change Password</Button>
                </CellWrapper>

                {/* --- 2FA Cell (Placeholder) --- */}
                 <CellWrapper>
                    <div><p className="font-medium">Two-Factor Authentication</p><p className="text-small text-default-500">Add an extra layer of security to your account.</p></div>
                    <div className="flex items-center gap-2">
                       <p className="text-small text-default-400 mr-2">Not Enabled</p> {/* Example status */}
                       <Button size="sm" radius="full" variant="bordered" isDisabled>Setup 2FA</Button>
                    </div>
                 </CellWrapper>

                {/* --- Require PIN Row --- */}
                <CellWrapper>
                    <div className="flex flex-grow items-center gap-3 mr-4"> {/* Allow text to wrap */}
                         <Switch
                             isSelected={user.pinEnabled ?? false}
                             onValueChange={handlePinEnableToggle}
                             aria-label="Enable PIN requirement for login"
                             isDisabled={!user.isPinSet || pinToggleState.pending} // Disable if no PIN set or toggle action pending
                             size="sm"
                         />
                         <div>
                             <p className="font-medium">Require PIN for Login</p>
                             <p className="text-small text-default-500">
                                 {user.isPinSet
                                     ? "Enable this to require your 4-digit PIN at login."
                                     : "Set a 4-digit PIN first to enable this option."}
                             </p>
                         </div>
                    </div>
                     <div className="shrink-0"> {/* Prevent button from shrinking */}
                         <Button
                            size="sm"
                            radius="full"
                            variant="bordered"
                            onPress={onPinModalOpen} // Open PIN modal
                         >
                            {user.isPinSet ? "Change PIN" : "Set PIN"}
                         </Button>
                     </div>
                </CellWrapper>

                {/* --- Deactivate Account Cell (Placeholder) --- */}
                <CellWrapper>
                   <div><p className="font-medium">Deactivate Account</p><p className="text-small text-default-500">Temporarily disable your account access.</p></div>
                   <Button size="sm" radius="full" variant="bordered" isDisabled>Deactivate</Button>
                </CellWrapper>

                {/* --- Delete Account Cell --- */}
                <CellWrapper>
                   <div><p className="font-medium">Delete Account</p><p className="text-small text-danger-500">Permanently delete your account and all data.</p></div>
                   <Button size="sm" color="danger" radius="full" variant="flat" onPress={onDeleteModalOpen}>Delete Account</Button>
                </CellWrapper>
            </div>
        </div>

        {/* ======================== MODALS ======================== */}
        {/* (Keep your existing Modal definitions here) */}
        {/* --- Email Edit Modal --- */}
        <Modal isOpen={isEmailModalOpen} onClose={onEmailModalClose} size="xl" backdrop="blur">
           <ModalContent>
              <form onSubmit={handleAccountSubmit}>
                   <ModalHeader>Account Information</ModalHeader>
                   <ModalBody>
                       <p className="text-small text-default-500 mb-4"> Update your name and email address. Changing your email might require re-verification. </p>
                       <div className="space-y-4">
                          <div>
                              <Input name="name" label="Name" placeholder="Enter your name" defaultValue={user.name ?? ''} isRequired />
                          </div>
                          <div>
                              <Input name="email" type="email" label="Email" placeholder="Enter your email" defaultValue={user.email ?? ''} isRequired />
                          </div>
                          {accountState.error && (<p className="text-danger text-small mt-2">{accountState.error}</p>)}
                          {accountState.success && (<p className="text-success text-small mt-2">{accountState.success}</p>)}
                       </div>
                   </ModalBody>
                   <ModalFooter>
                      <Button variant="bordered" onPress={onEmailModalClose} type="button"> Cancel </Button>
                      <Button color="primary" type="submit" isLoading={accountState.pending} startContent={!accountState.pending ? <Icon icon="solar:diskette-linear" /> : null} isDisabled={accountState.pending}> {accountState.pending ? "Saving..." : "Save Changes"} </Button>
                   </ModalFooter>
               </form>
           </ModalContent>
        </Modal>

        {/* --- Password Change Modal --- */}
        <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="xl" backdrop="blur">
           <ModalContent>
              <form onSubmit={handlePasswordSubmit}>
                   <ModalHeader>Update Password</ModalHeader>
                   <ModalBody>
                       <p className="text-small text-default-500 mb-4">Enter your current password and set a new one. Use at least 8 characters.</p>
                       <div className="space-y-4">
                           <div>
                               <Input name="currentPassword" label="Current Password" type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" endContent={ <PasswordToggleIcon isVisible={showCurrentPassword} onPress={() => setShowCurrentPassword(!showCurrentPassword)} /> } isRequired minLength={8} />
                           </div>
                           <div>
                               <Input name="newPassword" label="New Password" type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" endContent={ <PasswordToggleIcon isVisible={showNewPassword} onPress={() => setShowNewPassword(!showNewPassword)} /> } isRequired minLength={8} />
                           </div>
                           <div>
                               <Input name="confirmPassword" label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'} endContent={ <PasswordToggleIcon isVisible={showConfirmPassword} onPress={() => setShowConfirmPassword(!showConfirmPassword)} /> } isRequired minLength={8} />
                           </div>
                           {passwordState.error && (<p className="text-danger text-small mt-2">{passwordState.error}</p>)}
                           {passwordState.success && (<p className="text-success text-small mt-2">{passwordState.success}</p>)}
                       </div>
                   </ModalBody>
                   <ModalFooter>
                       <Button variant="bordered" onPress={onPasswordModalClose} type="button">Cancel</Button>
                       <Button color="warning" type="submit" isLoading={passwordState.pending} startContent={!passwordState.pending ? <Icon icon="solar:lock-password-linear" /> : null} isDisabled={passwordState.pending}> {passwordState.pending ? "Updating..." : "Update Password"} </Button>
                   </ModalFooter>
               </form>
           </ModalContent>
        </Modal>

        {/* --- Delete Account Modal --- */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="xl" backdrop="blur">
           <ModalContent>
               <form onSubmit={handleDeleteSubmit}>
                   <ModalHeader className="text-danger">Delete Account</ModalHeader>
                   <ModalBody>
                       <p className="text-danger font-medium mb-4"> This action is permanent and cannot be undone. All your data will be irreversibly deleted. Please confirm by entering your password. </p>
                       <div className="space-y-4">
                           <div>
                               <Input name="password" label="Confirm Password" type={showDeleteConfirmPassword ? 'text' : 'password'} endContent={ <PasswordToggleIcon isVisible={showDeleteConfirmPassword} onPress={() => setShowDeleteConfirmPassword(!showDeleteConfirmPassword)} /> } isRequired minLength={8} />
                            </div>
                           {deleteState.error && (<p className="text-danger text-small mt-2">{deleteState.error}</p>)}
                           {deleteState.success && (<p className="text-success text-small mt-2">{deleteState.success}</p>)}
                       </div>
                   </ModalBody>
                   <ModalFooter>
                       <Button variant="bordered" onPress={onDeleteModalClose} type="button">Cancel</Button>
                       <Button color="danger" type="submit" isLoading={deleteState.pending} startContent={!deleteState.pending ? <Icon icon="solar:trash-bin-trash-linear" /> : null} isDisabled={deleteState.pending}> {deleteState.pending ? "Deleting..." : "Delete Account Permanently"} </Button>
                   </ModalFooter>
               </form>
           </ModalContent>
        </Modal>

        {/* --- Require PIN Modal --- */}
        <RequirePinModal
            isOpen={isPinModalOpen}
            onClose={onPinModalClose}
            setPinAction={handlePinSubmit}
            isSettingPin={pinState.pending ?? false}
            pinActionState={pinState}
         />
    </>
  );
}
