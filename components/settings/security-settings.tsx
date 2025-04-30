// src/app/security/page.tsx (or wherever this component lives)
'use client';

// Import React hooks and Suspense
import React, { useState, useEffect, Suspense } from 'react';
import { useActionState } from 'react';
// Import SWR for data fetching
import useSWR, { mutate } from 'swr';

// --- HeroUI React Imports ---
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Input,
    // Label, // Using HTML label
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    Switch, // Import Switch for direct use
    useDisclosure, // Keep if used elsewhere, otherwise optional
} from "@heroui/react";
import { Icon } from '@iconify/react'; // For icons

// --- Your HeroUI Custom Component Imports ---
// import SwitchCell from '@/components/settings/switch-cell'; // Not used for PIN row
import CellWrapper from '@/components/settings/cell-wrapper'; // Adjust path if needed
import RequirePinModal from '@/components/settings/RequirePinModal'; // Import the new modal
import SwitchCell from '@/components/settings/switch-cell'; // Adjust path if needed

// --- Server Actions ---
// Import all necessary actions
import {
    updatePassword,
    deleteAccount,
    updateAccount,
    setAccountPin,
    // togglePinRequirement // Placeholder for the action needed for the Switch
} from '@/app/(login)/actions';

// --- State Types ---
type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

type AccountState = {
  name?: string;
  email?: string;
  error?: string;
  success?: string;
};

type PinActionState = {
  error?: string;
  success?: string;
};

// --- Data Types ---
type User = {
  id: string; // Or number
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  pinEnabled: boolean; // Tracks if user wants PIN enabled
  isPinSet: boolean;   // Tracks if a PIN exists for the user
};
type FetchError = Error & { status: number; info?: any }
// --- Helper Functions ---
// Define fetcher function
const fetcher = async (url: string): Promise<User> => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as FetchError
    // if you get JSON details:
    // error.info = await res.json()
    error.status = res.status
    throw error
  }
  return res.json()
}

// --- Reusable Loading Component ---
function SettingsLoadingSkeleton() {
  return (
      <div className="flex justify-center items-center p-10">
          <Spinner label="Loading settings..." color="primary" />
      </div>
  );
}

// --- Main Page Component ---
export default function SecuritySettingsPage() {
  // --- Modal State ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false); // State for PIN Modal

  // --- Password Visibility State ---
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirmPassword, setShowDeleteConfirmPassword] = useState(false);

  // --- Action States ---
  const [passwordState, passwordAction, isPasswordPending] = useActionState<PasswordState, FormData>(updatePassword, {});
  const [deleteState, deleteAction, isDeletePending] = useActionState<DeleteState, FormData>(deleteAccount, {});
  const [accountState, accountAction, isAccountPending] = useActionState<AccountState, FormData>(updateAccount, {});
  const [pinActionState, pinAction, isPinSetting] = useActionState<PinActionState, FormData>(setAccountPin, {}); // Action state for setting PIN

  // --- Data Fetching ---
  const { data: user, error: userError, isLoading: isUserLoading, mutate: mutateUser } = useSWR<User>('/api/user', fetcher);

  // --- Effects for Action Success ---
  useEffect(() => {
    if (passwordState.success) {
        setIsPasswordModalOpen(false);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        // Consider adding a success toast/notification
    }
  }, [passwordState.success]);

  useEffect(() => {
    if (accountState.success) {
        setIsEmailModalOpen(false);
        mutateUser(); // Revalidate user data
        // Consider adding a success toast/notification
    }
  }, [accountState.success]);

  useEffect(() => {
      if (pinActionState.success) {
          setIsPinModalOpen(false); // Close modal on success
          mutateUser(); // Refresh user data
          // Consider adding a success toast/notification
      }
  }, [pinActionState.success]);


  // --- Modal Close Handlers ---
  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setShowDeleteConfirmPassword(false);
  };

  const handleEmailModalClose = () => {
    setIsEmailModalOpen(false);
    // Reset account action state errors if needed
    // accountState.error = undefined; // This direct mutation isn't standard React practice
  };

   const handlePinModalClose = () => {
       setIsPinModalOpen(false);
       // Reset PIN action state errors if needed
       // pinActionState.error = undefined;
   };

  // --- Reusable Toggle Icon Component ---
  const PasswordToggleIcon = ({ isVisible, onPress }: { isVisible: boolean; onPress: () => void }) => (
    <button type="button" onClick={onPress} className="focus:outline-none p-1" aria-label={isVisible ? "Hide password" : "Show password"}>
        {isVisible ? (<Icon icon="solar:eye-linear" className="text-xl text-default-400 pointer-events-none" />) : (<Icon icon="solar:eye-closed-linear" className="text-xl text-default-400 pointer-events-none" />)}
    </button>
  );

  // --- Render Component ---
  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Use Suspense for initial data load */}
      <Suspense fallback={<SettingsLoadingSkeleton />}>
         {/* Pass all necessary data and handlers down */}
         <UserSettingsDisplay
             user={user}
             userError={userError}
             // Modals state & setters
             isPasswordModalOpen={isPasswordModalOpen} setIsPasswordModalOpen={setIsPasswordModalOpen}
             isDeleteModalOpen={isDeleteModalOpen} setIsDeleteModalOpen={setIsDeleteModalOpen}
             isEmailModalOpen={isEmailModalOpen} setIsEmailModalOpen={setIsEmailModalOpen}
             isPinModalOpen={isPinModalOpen} setIsPinModalOpen={setIsPinModalOpen}
             // Password visibility state & setters
             showCurrentPassword={showCurrentPassword} setShowCurrentPassword={setShowCurrentPassword}
             showNewPassword={showNewPassword} setShowNewPassword={setShowNewPassword}
             showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}
             showDeleteConfirmPassword={showDeleteConfirmPassword} setShowDeleteConfirmPassword={setShowDeleteConfirmPassword}
             // Action states & handlers
             passwordState={passwordState} passwordAction={passwordAction} isPasswordPending={isPasswordPending}
             deleteState={deleteState} deleteAction={deleteAction} isDeletePending={isDeletePending}
             accountState={accountState} accountAction={accountAction} isAccountPending={isAccountPending}
             pinActionState={pinActionState} pinAction={pinAction} isPinSetting={isPinSetting}
             // Modal close handlers
             handlePasswordModalClose={handlePasswordModalClose}
             handleDeleteModalClose={handleDeleteModalClose}
             handleEmailModalClose={handleEmailModalClose}
             handlePinModalClose={handlePinModalClose}
             // Components
             PasswordToggleIcon={PasswordToggleIcon}
          />
      </Suspense>
    </section>
  );
}

// --- Separate Component for Displaying Settings ---
// Define the props interface
interface UserSettingsDisplayProps {
  user: User | undefined;
  userError: Error | undefined;
  // Modals
  isPasswordModalOpen: boolean; setIsPasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteModalOpen: boolean; setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEmailModalOpen: boolean; setIsEmailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPinModalOpen: boolean; setIsPinModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // Password Visibility
  showCurrentPassword: boolean; setShowCurrentPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showNewPassword: boolean; setShowNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean; setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showDeleteConfirmPassword: boolean; setShowDeleteConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  // Actions
  passwordState: PasswordState; passwordAction: (payload: FormData) => void; isPasswordPending: boolean;
  deleteState: DeleteState; deleteAction: (payload: FormData) => void; isDeletePending: boolean;
  accountState: AccountState; accountAction: (payload: FormData) => void; isAccountPending: boolean;
  pinActionState: PinActionState; pinAction: (payload: FormData) => void; isPinSetting: boolean;
  // Close Handlers
  handlePasswordModalClose: () => void;
  handleDeleteModalClose: () => void;
  handleEmailModalClose: () => void;
  handlePinModalClose: () => void;
  // Components
  PasswordToggleIcon: React.FC<{ isVisible: boolean; onPress: () => void }>;
}

function UserSettingsDisplay({
    user,
    userError,
    // Destructure all props for use
    isPasswordModalOpen, setIsPasswordModalOpen,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isEmailModalOpen, setIsEmailModalOpen,
    isPinModalOpen, setIsPinModalOpen,
    showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword,
    showConfirmPassword, setShowConfirmPassword,
    showDeleteConfirmPassword, setShowDeleteConfirmPassword,
    passwordState, passwordAction, isPasswordPending,
    deleteState, deleteAction, isDeletePending,
    accountState, accountAction, isAccountPending,
    pinActionState, pinAction, isPinSetting,
    handlePasswordModalClose,
    handleDeleteModalClose,
    handleEmailModalClose,
    handlePinModalClose,
    PasswordToggleIcon
}: UserSettingsDisplayProps) {

    // Handle Error State for User Fetching
    if (userError) {
        return <div className="p-4 text-danger text-center">Error loading user information. Please try again later.</div>;
    }

    // --- Handler for PIN Enable/Disable Switch ---
    // This function requires a separate server action
    const handlePinEnableToggle = async (isSelected: boolean) => {
        console.log("PIN requirement toggled:", isSelected);
        // Example: Placeholder for calling the action (replace with actual implementation)
        // try {
        //   await togglePinRequirementAction(isSelected); // Call your server action
        //   mutate('/api/user'); // Refresh user data on success
        // } catch (error) {
        //   console.error("Failed to toggle PIN requirement:", error);
        //   // Handle error (e.g., show toast notification)
        // }
    };

    // --- Toggle Handlers for Password Visibility (passed down from parent) ---
    const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword);
    const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
    const toggleDeleteConfirmPasswordVisibility = () => setShowDeleteConfirmPassword(!showDeleteConfirmPassword);


    return (
        <>
             <Card className="w-full p-2">
                <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
                    <p className="text-large font-semibold">Security Settings</p>
                    <p className="text-small text-default-500">Manage your account security preferences</p>
                </CardHeader>
                <CardBody className="space-y-2">
                    {/* --- Email Address Cell --- */}
                    <CellWrapper>
                        <div>
                            <p className="font-medium">Email Address</p>
                            <p className="text-small text-default-500">The email address associated with your account.</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-4 sm:flex-nowrap">
                            <div className="flex flex-col items-end">
                                <p className="text-small">{user?.email ?? '...'}</p>
                                {user?.emailVerified === true && (<p className="text-tiny text-success">Verified</p>)}
                                {user?.emailVerified === false && (<p className="text-tiny text-warning">Not Verified</p>)}
                            </div>
                            <Button size="sm" radius="full" variant="bordered" endContent={<Icon icon="solar:pen-2-linear" />} onPress={() => setIsEmailModalOpen(true)} isDisabled={!user}> Edit </Button>
                        </div>
                    </CellWrapper>

                    {/* --- Password Cell --- */}
                    <CellWrapper>
                       <div><p className="font-medium">Password</p><p className="text-small text-default-500">Set a unique password to protect your account.</p></div>
                       <Button size="sm" radius="full" variant="bordered" onPress={() => setIsPasswordModalOpen(true)}>Change Password</Button>
                    </CellWrapper>

                    {/* --- 2FA Cell (Using SwitchCell for example) --- */}
                    {/* Replace with actual logic/state if implementing 2FA */}
                    <SwitchCell label="Two-Factor Authentication" description="Add an extra layer of security (Not implemented)." defaultSelected={false} isDisabled />

                    {/* --- Password Reset Protection Cell (Using SwitchCell for example) --- */}
                    {/* Replace with actual logic/state */}
                    <SwitchCell label="Password Reset Protection" description="Require additional info to reset password (Not implemented)." isDisabled />

                    {/* --- Require PIN Row --- */}
                    <CellWrapper>
                        <div className="flex flex-grow items-center gap-3 mr-4"> {/* Allow text to wrap */}
                             <Switch
                                 isSelected={user?.pinEnabled ?? false}
                                 onValueChange={handlePinEnableToggle}
                                 aria-label="Enable PIN requirement for login"
                                 isDisabled={!user?.isPinSet || !user} // Disable if no PIN set or user not loaded
                                 size="sm"
                             />
                             <div>
                                 <p className="font-medium">Require PIN for Login</p>
                                 <p className="text-small text-default-500">
                                     {user?.isPinSet
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
                                onPress={() => setIsPinModalOpen(true)} // Open PIN modal
                                isDisabled={!user} // Disable if user data not loaded
                             >
                                {user?.isPinSet ? "Change PIN" : "Set PIN"}
                             </Button>
                         </div>
                    </CellWrapper>

                    {/* --- Deactivate Account Cell --- */}
                    <CellWrapper>
                       <div><p className="font-medium">Deactivate Account</p><p className="text-small text-default-500">Temporarily disable your account.</p></div>
                       <Button size="sm" radius="full" variant="bordered">Deactivate</Button>
                    </CellWrapper>

                    {/* --- Delete Account Cell --- */}
                    <CellWrapper>
                       <div><p className="font-medium">Delete Account</p><p className="text-small text-default-500">Permanently delete your account and all data.</p></div>
                       <Button size="sm" color="danger" radius="full" variant="flat" onPress={() => setIsDeleteModalOpen(true)}>Delete Account</Button>
                    </CellWrapper>
                </CardBody>
             </Card>

            {/* ======================== MODALS ======================== */}

            {/* --- Email Edit Modal --- */}
            <Modal isOpen={isEmailModalOpen} onClose={handleEmailModalClose} size="xl" backdrop="blur">
               <ModalContent>
                   <ModalHeader>Account Information</ModalHeader>
                   <ModalBody>
                       <p className="text-small text-default-500 mb-4"> Update your name and email address. Changing your email will require re-verification. </p>
                       {user && (
                           <form action={accountAction} className="space-y-4" id="account-update-form">
                              <div>
                                  <label htmlFor="name" className="block text-small font-medium text-default-700 mb-1">Name</label>
                                  <Input id="name" name="name" placeholder="Enter your name" defaultValue={accountState?.name ?? user?.name ?? ''} isRequired />
                              </div>
                              <div>
                                  <label htmlFor="email" className="block text-small font-medium text-default-700 mb-1">Email</label>
                                  <Input id="email" name="email" type="email" placeholder="Enter your email" defaultValue={accountState?.email ?? user?.email ?? ''} isRequired />
                              </div>
                              {accountState?.error && (<p className="text-danger text-small mt-2">{accountState.error}</p>)}
                           </form>
                       )}
                       {!user && <div className="text-center p-4"><Spinner label="Loading user data..." /></div>}
                   </ModalBody>
                   <ModalFooter>
                      <Button variant="bordered" onPress={handleEmailModalClose}> Cancel </Button>
                      <Button color="primary" type="submit" form="account-update-form" isLoading={isAccountPending} startContent={!isAccountPending ? <Icon icon="solar:diskette-linear" /> : null} isDisabled={!user || isAccountPending}> {isAccountPending ? "Saving..." : "Save Changes"} </Button>
                   </ModalFooter>
               </ModalContent>
            </Modal>

            {/* --- Password Change Modal --- */}
            <Modal isOpen={isPasswordModalOpen} onClose={handlePasswordModalClose} size="xl" backdrop="blur">
               <ModalContent>
                   <ModalHeader>Update Password</ModalHeader>
                   <ModalBody>
                       <p className="text-small text-default-500 mb-4">Enter your current password and set a new one.</p>
                       <form action={passwordAction} className="space-y-4" id="password-update-form">
                           <div>
                               <label htmlFor="current-password" className="block text-small font-medium text-default-700 mb-1">Current Password</label>
                               <Input id="current-password" name="currentPassword" type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" endContent={ <PasswordToggleIcon isVisible={showCurrentPassword} onPress={toggleCurrentPasswordVisibility} /> } isRequired minLength={8} />
                           </div>
                           <div>
                               <label htmlFor="new-password" className="block text-small font-medium text-default-700 mb-1">New Password</label>
                               <Input id="new-password" name="newPassword" type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" endContent={ <PasswordToggleIcon isVisible={showNewPassword} onPress={toggleNewPasswordVisibility} /> } isRequired minLength={8} />
                           </div>
                           <div>
                               <label htmlFor="confirm-password" className="block text-small font-medium text-default-700 mb-1">Confirm New Password</label>
                               <Input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} endContent={ <PasswordToggleIcon isVisible={showConfirmPassword} onPress={toggleConfirmPasswordVisibility} /> } isRequired minLength={8} />
                           </div>
                           {passwordState?.error && (<p className="text-danger text-small mt-2">{passwordState.error}</p>)}
                       </form>
                   </ModalBody>
                   <ModalFooter>
                       <Button variant="bordered" onPress={handlePasswordModalClose}>Cancel</Button>
                       <Button color="warning" type="submit" form="password-update-form" isLoading={isPasswordPending} startContent={!isPasswordPending ? <Icon icon="solar:lock-password-linear" /> : null}> {isPasswordPending ? "Updating..." : "Update Password"} </Button>
                   </ModalFooter>
               </ModalContent>
            </Modal>

            {/* --- Delete Account Modal --- */}
            <Modal isOpen={isDeleteModalOpen} onClose={handleDeleteModalClose} size="xl" backdrop="blur">
               <ModalContent>
                   <ModalHeader>Delete Account</ModalHeader>
                   <ModalBody>
                       <p className="text-danger font-medium mb-4"> This action is permanent and cannot be undone. All your data will be irreversibly deleted. Please confirm by entering your password. </p>
                       <form action={deleteAction} className="space-y-4" id="delete-account-form">
                           <div>
                               <label htmlFor="delete-password" className="block text-small font-medium text-default-700 mb-1">Confirm Password</label>
                               <Input id="delete-password" name="password" type={showDeleteConfirmPassword ? 'text' : 'password'} endContent={ <PasswordToggleIcon isVisible={showDeleteConfirmPassword} onPress={toggleDeleteConfirmPasswordVisibility} /> } isRequired minLength={8} />
                            </div>
                           {deleteState?.error && (<p className="text-danger text-small mt-2">{deleteState.error}</p>)}
                       </form>
                   </ModalBody>
                   <ModalFooter>
                       <Button variant="bordered" onPress={handleDeleteModalClose}>Cancel</Button>
                       <Button color="danger" type="submit" form="delete-account-form" isLoading={isDeletePending} startContent={!isDeletePending ? <Icon icon="solar:trash-bin-trash-linear" /> : null}> {isDeletePending ? "Deleting..." : "Delete Account Permanently"} </Button>
                   </ModalFooter>
               </ModalContent>
            </Modal>

            {/* --- Require PIN Modal --- */}
            {/* This modal is now included and receives its props */}
            <RequirePinModal
                isOpen={isPinModalOpen}
                onClose={handlePinModalClose}
                setPinAction={pinAction}
                isSettingPin={isPinSetting}
                pinActionState={pinActionState}
             />
        </>
    );
}

