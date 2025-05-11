"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext'; // Ensure this path is correct
import {
  Avatar, Button, Card, CardBody, CardFooter, ScrollShadow, Spacer,
  Skeleton, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Input, Divider, Progress, Tooltip as HeroUITooltip,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem // Added Dropdown components
} from '@heroui/react'; // Ensure this path is correct and all components are exported
import { Icon } from '@iconify/react';
import useSWR from 'swr';
import { navigationSections, SidebarItem as SidebarItemProps, SidebarSection, SidebarItemType } from './sidebar-items'; // Ensure this path is correct
import { AcmeIcon } from './acme'; // Ensure this path is correct
import { useShops } from '@/context/shops'; // Ensure this path is correct

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

interface User {
  id: string; // Added for referral link generation
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

const GLOBAL_NAVBAR_HEIGHT_CLASS = "pt-16"; // Assumes h-16 (64px) global navbar
const PLUGIN_CARD_VISIBILITY_KEY = 'sidebarPluginCardVisible'; // More specific key

// Example credit data (in a real app, this would come from props or context/API)
const totalCredits = 10000;
const usedCredits = 3500;
const creditsLeft = totalCredits - usedCredits;
const creditUsagePercentage = (usedCredits / totalCredits) * 100;

// Language options
const languageOptions = [
  { key: 'en', name: 'English', flag: 'twemoji:flag-united-kingdom' },
  { key: 'hu', name: 'Hungarian', flag: 'twemoji:flag-hungary', disabled: true, tooltip: 'Coming soon' },
];


export default function SidebarComponent() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { addShop } = useShops();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onOpenChange: onModalOpenChange, onClose: onModalClose } = useDisclosure();
  const [newName, setNewName] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

  // SWR hook for user data
  const { data: userData, error: userError } = useSWR<{ user: User }>('/api/user', fetcher);
  const isLoadingUser = !userData && !userError;
  const user = userData?.user;

  // Referral Link state
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Language state
  const [selectedLanguageKey, setSelectedLanguageKey] = useState<React.Key>('en');
  const selectedLanguage = React.useMemo(
    () => languageOptions.find(lang => lang.key === selectedLanguageKey) || languageOptions[0],
    [selectedLanguageKey]
  );

  useEffect(() => {
    if (user && typeof window !== 'undefined') { // Ensure window is defined for origin
        // Generate referral link once user data is available
        setReferralLink(`${window.location.origin}/referral/${user.id || user.email.split('@')[0]}`);
    }
  }, [user]);


  // State for collapsed sections (overall sections like "Email Tools", "General")
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    navigationSections.reduce((acc, section) => {
      if (section.title) { // Only sections with titles are collapsible
        acc[section.key] = section.isCollapsed ?? false;
      }
      return acc;
    }, {} as Record<string, boolean>)
  );

  // State for individual dropdown items (e.g., Advertising Campaign)
  const [openDropdownItems, setOpenDropdownItems] = useState<Record<string, boolean>>(
    navigationSections.flatMap(s => s.items)
      .filter(item => item.type === SidebarItemType.Dropdown)
      .reduce((acc, item) => {
        acc[item.key] = item.isInitiallyOpen ?? false;
        return acc;
      }, {} as Record<string, boolean>)
  );

  // State for email statistics visibility
  const [isEmailStatsVisible, setIsEmailStatsVisible] = useState(
    // Find the toggle item and get its initial state, default to true if not found
    navigationSections.flatMap(s => s.items).find(i => i.type === SidebarItemType.EmailStatsToggle)?.isInitiallyOpen ?? true
  );

  // State for "Download Plugin" card visibility
  const [isPluginCardVisible, setIsPluginCardVisible] = useState(true);

  useEffect(() => {
    const storedVisibility = localStorage.getItem(PLUGIN_CARD_VISIBILITY_KEY);
    if (storedVisibility === 'false') {
      setIsPluginCardVisible(false);
    }
  }, []);

  const toggleSectionCollapse = (sectionKey: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const toggleDropdownItem = (itemKey: string) => {
    setOpenDropdownItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const toggleEmailStatsVisibility = () => {
    setIsEmailStatsVisible(prev => !prev);
  };

  const handleCopyReferralLink = useCallback(() => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy referral link: ', err);
    });
  }, [referralLink]);


  const handleHidePluginCard = () => {
    localStorage.setItem(PLUGIN_CARD_VISIBILITY_KEY, 'false');
    setIsPluginCardVisible(false);
  };

  const handleAddShop = () => {
    const trimmedName = newName.trim();
    const trimmedUrl = newUrl.trim();
    if (!trimmedName || !trimmedUrl) return;
    if (addShop) {
      addShop({ name: trimmedName, url: trimmedUrl });
    }
    setNewName('');
    setNewUrl('');
    onModalClose();
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  // --- Skeleton Components ---
  const NavItemSkeleton = ({isSubItem = false}: {isSubItem?: boolean}) => (
    <div className={`flex items-center gap-3 h-11 ${isSubItem ? 'px-3 pl-10' : 'px-3'}`}>
      <Skeleton className="w-6 h-6 rounded-md" />
      <Skeleton className={`w-3/4 h-4 rounded-md ${isSubItem ? 'w-1/2' : ''}`} />
    </div>
  );

  const SectionTitleSkeleton = () => (
    <div className="px-3 py-3 mt-2"> {/* Increased py for better spacing */}
      <Skeleton className="w-1/3 h-4 rounded-md" /> {/* Slightly taller */}
    </div>
  );

  const CreditsSkeleton = () => (
    <div className="mt-auto pt-4 border-t border-divider px-3 pb-2"> {/* Increased px */}
      <div className="mb-2 space-y-1.5"> {/* Added space-y */}
        <div className="flex justify-between items-center">
          <Skeleton className="w-1/4 h-3 rounded-md" />
          <Skeleton className="w-2/5 h-3 rounded-md" /> {/* Adjusted width */}
        </div>
        <Skeleton className="w-full h-2.5 rounded-full" /> {/* Slightly taller progress bar */}
        <div className="flex justify-end">
          <Skeleton className="w-1/3 h-3 rounded-md" /> {/* Adjusted width */}
        </div>
      </div>
    </div>
  );
  // --- End Skeleton Components ---

  const renderSidebarItem = (item: SidebarItemProps, index: number, isSubItem: boolean = false) => {
    if (!item || !item.key || !item.title) return null;

    // Special rendering for EmailStatsToggle button
    if (item.type === SidebarItemType.EmailStatsToggle && typeof item.endContent === 'function') {
        return (
            <div key={`${item.key}-${index}`} className="mt-1 mb-0.5 px-1"> {/* Added px-1 for slight indent */}
                {item.endContent({ isItemOpen: isEmailStatsVisible, onToggle: toggleEmailStatsVisibility })}
            </div>
        );
    }

    // Conditionally render statistic items based on isEmailStatsVisible
    if (item.isStatistic) {
        if (!isEmailStatsVisible && item.key.includes('-stat')) return null; // Hide only email stats if toggle is off
        return (
            <div key={`${item.key}-${index}`} className={`flex justify-between items-center ${item.className || 'text-sm text-default-600 px-3 py-0.5'} ${isSubItem ? 'pl-10' : 'pl-4'}`}> {/* Consistent padding */}
              <div className="flex items-center gap-2">
                {item.icon && <Icon icon={item.icon} width={14} height={14} className="text-default-500" />}
                <span className="text-default-600 dark:text-default-400 text-xs">{item.title}</span>
              </div>
              {item.statisticValue && <span className="font-medium text-default-700 dark:text-default-300 text-xs">{item.statisticValue}</span>}
            </div>
        );
    }

    const isActive = item.href ? pathname === item.href : false;
    let buttonClasses = `h-11 justify-start gap-3 text-sm rounded-md w-full ${isSubItem ? 'px-3 pl-10 text-default-600 hover:text-primary dark:text-default-400 dark:hover:text-primary' : 'px-3'}`;

    if (isActive && !isSubItem) {
      if (item.className && (item.className.includes('bg-') || item.className.includes('text-'))) {
        buttonClasses += ` ${item.className}`;
      } else {
        buttonClasses += ` font-semibold text-primary bg-primary-50 dark:bg-primary-900/30`;
        if (item.className) buttonClasses += ` ${item.className}`;
      }
    } else if (isActive && isSubItem) {
        buttonClasses += ` font-semibold text-primary bg-primary-50 dark:bg-primary-900/30`;
    } else {
      buttonClasses += ` ${item.className || (isSubItem ? 'hover:bg-default-100 dark:hover:bg-default-50' : 'text-default-700 hover:bg-default-100 dark:hover:bg-default-50')}`;
    }

    let actualEndContent = item.endContent;
    if (item.key === 'webshops' && typeof item.endContent === 'function') {
      actualEndContent = item.endContent({ onOpenModal: onModalOpen });
    } else if (item.type === SidebarItemType.Dropdown && typeof item.endContent === 'function') {
      actualEndContent = item.endContent({ isItemOpen: openDropdownItems[item.key] });
    }

    const itemContent = (
      <Button
        as={item.href && item.type !== SidebarItemType.Dropdown ? Link : 'button'}
        href={item.href}
        onClick={item.type === SidebarItemType.Dropdown ? () => toggleDropdownItem(item.key) : item.onClick}
        fullWidth
        variant="light"
        color={isActive && !(item.className && item.className.includes('bg-')) && !isSubItem ? "primary" : "default"}
        className={buttonClasses}
        startContent={item.icon && <Icon icon={item.icon} width={isSubItem ? 18 : 22} height={isSubItem ? 18 : 22} className={isSubItem ? 'text-default-500 mr-1' : ''} />}
        endContent={actualEndContent as React.ReactNode}
      >
        <span className={`flex-grow text-left ${isSubItem ? 'text-xs' : ''}`}>{item.title}</span>
      </Button>
    );

    return (
      <div key={`${item.key}-${index}`}>
        {itemContent}
        {item.type === SidebarItemType.Dropdown && openDropdownItems[item.key] && item.items && (
          <div className="flex flex-col gap-0.5 mt-0.5 bg-default-50 dark:bg-default-900/20 rounded-md py-1">
            {item.items.map((subItem, subIndex) => renderSidebarItem(subItem, subIndex, true))}
          </div>
        )}
      </div>
    );
  };

  const isSidebarLoading = isLoadingUser; // Overall loading state

  return (
    <>
      {/* To make the sidebar wider (e.g., to 20rem / 320px):
        1. In your DefaultLayout.tsx:
           const SIDEBAR_WIDTH_CLASS = 'w-80'; // (20rem)
           const MAIN_CONTENT_MARGIN_LEFT_CLASS_OPEN = 'md:ml-80';
        2. This SidebarComponent will adapt to the width set by DefaultLayout.
      */}
      <div className={`flex h-full flex-col p-4 relative border-r border-divider bg-background ${GLOBAL_NAVBAR_HEIGHT_CLASS}`}>
        {/* Header: Brand and Toggle Button */}
        <div className="flex items-center justify-between px-2 mb-1">
            <div className="flex items-center gap-2">
                <Skeleton isLoaded={!isSidebarLoading} className="w-8 h-8 rounded-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                    <AcmeIcon className="text-background" />
                    </div>
                </Skeleton>
                <Skeleton isLoaded={!isSidebarLoading} className="w-32 h-5 rounded-md">
                    <span className="text-sm font-bold uppercase text-foreground">RANKED</span>
                </Skeleton>
            </div>
            {isSidebarOpen && (
                <Button
                isIconOnly size="sm" variant="light"
                className="border border-divider bg-background hover:bg-default-100 rounded-md text-default-600"
                aria-label="Collapse sidebar" onPress={toggleSidebar}
                >
                <Icon icon="mdi:chevron-double-left" width={18} />
                </Button>
            )}
        </div>

        <Spacer y={6} />

        {/* User Information Section - Improved Alignment */}
        <div className="px-2 space-y-3"> {/* Added space-y-3 for separation between profile and referral */}
            <div className="flex items-start gap-3"> {/* Changed to items-start for better alignment with dropdown */}
                <Skeleton isLoaded={!isLoadingUser} className="rounded-full w-12 h-12 text-lg flex-shrink-0">
                    <Avatar
                        isBordered
                        size="lg"
                        src={user?.avatarUrl ?? undefined}
                        name={user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
                        className="w-12 h-12 text-lg"
                    />
                </Skeleton>
                <div className="flex flex-col justify-center flex-grow overflow-hidden">
                    <Skeleton isLoaded={!isLoadingUser} className="h-5 w-4/5 rounded-lg mb-1.5">
                        {user && <p className="text-base font-semibold text-foreground truncate leading-tight">{user.name ?? user.email ?? 'Unknown User'}</p>}
                    </Skeleton>
                    <Skeleton isLoaded={!isLoadingUser} className="h-4 w-3/5 rounded-lg">
                        {user && <p className="text-xs text-default-500 truncate leading-tight">{user.role ?? 'No Role'}</p>}
                    </Skeleton>
                </div>
                {/* Language Switcher Dropdown */}
                <Skeleton isLoaded={!isLoadingUser} className="w-12 h-8 rounded-md ml-auto flex-shrink-0">
                    {user && (
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Button isIconOnly variant="light" className="w-10 h-10 min-w-0 data-[hover=true]:bg-default-100 dark:data-[hover=true]:bg-default-50">
                                    <Icon icon={selectedLanguage.flag} width={24} height={24} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Language Selection"
                                variant="flat"
                                disallowEmptySelection
                                selectionMode="single"
                                selectedKeys={new Set([selectedLanguageKey.toString()])}
                                onSelectionChange={(keys) => {
                                    // Since we only allow 'en' for now
                                    const newKey = Array.from(keys)[0];
                                    if (newKey === 'en') {
                                        setSelectedLanguageKey(newKey);
                                    }
                                    // For 'hu', it's disabled, so selection won't change to it via UI.
                                    // If it could, we'd add logic here.
                                }}
                                itemClasses={{
                                    base: "gap-2",
                                }}
                            >
                                {languageOptions.map((lang) => (
                                    <DropdownItem
                                        key={lang.key}
                                        description={lang.disabled ? lang.tooltip : undefined}
                                        startContent={<Icon icon={lang.flag} width={20} height={20} />}
                                        isDisabled={lang.disabled}
                                        className={lang.disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        {lang.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </Skeleton>
            </div>

            {/* Referral Link Section - Improved Alignment */}
            <Skeleton isLoaded={!isLoadingUser} className="h-20 rounded-lg">
                {user && referralLink && (
                    <div className="p-3 bg-default-100 dark:bg-default-50 rounded-lg shadow-sm border border-default-200 dark:border-default-700">
                        <p className="text-xs font-medium text-default-700 dark:text-default-300 mb-1.5">Your Referral Link:</p>
                        <div className="flex items-center gap-2">
                            <Input
                                isReadOnly
                                size="sm"
                                variant="bordered"
                                value={referralLink}
                                className="flex-grow"
                                classNames={{
                                    inputWrapper: "h-9 text-xs bg-background dark:bg-default-100 border-default-300 dark:border-default-200 focus-within:border-primary dark:focus-within:border-primary",
                                    input: "text-default-700 dark:text-default-200 placeholder:text-default-400"
                                }}
                                placeholder="Generating link..."
                            />
                            <HeroUITooltip content={copied ? "Copied!" : "Copy link"} placement="top" color="primary">
                                <Button
                                    isIconOnly
                                    size="md"
                                    variant={copied ? "flat" : "light"}
                                    color={copied ? "success" : "default"}
                                    onPress={handleCopyReferralLink}
                                    className="w-9 h-9 min-w-0 flex-shrink-0"
                                >
                                    <Icon icon={copied ? "mdi:check-circle-outline" : "mdi:content-copy"} width={18} />
                                </Button>
                            </HeroUITooltip>
                        </div>
                    </div>
                )}
            </Skeleton>
        </div>


        <Spacer y={6} />

        {/* Scrollable Navigation Area */}
        <ScrollShadow className="flex-grow -mr-4 pr-4 py-2" hideScrollBar>
          {isSidebarLoading ? (
            <nav className="flex flex-col gap-0.5">
              {[...Array(3)].map((_, i) => <NavItemSkeleton key={`navskel-${i}`} />)}
              <SectionTitleSkeleton />
              {[...Array(4)].map((_, i) => <NavItemSkeleton key={`navskel2-${i}`} />)}
              <NavItemSkeleton isSubItem={true} />
              <SectionTitleSkeleton />
              {[...Array(2)].map((_, i) => <NavItemSkeleton key={`navskel3-${i}`} />)}
            </nav>
          ) : (
            <nav className="flex flex-col gap-0.5">
              {navigationSections.map((section) => (
                !section.isHidden && (
                  <div key={section.key} className={section.className || ''}>
                    {section.title && (
                      <>
                        {section.key !== 'main' && <Divider className="my-2" />}
                        <div
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-default-50 dark:hover:bg-default-100 rounded-md group"
                          onClick={() => toggleSectionCollapse(section.key)}
                          role="button" tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && toggleSectionCollapse(section.key)}
                          aria-expanded={!collapsedSections[section.key]}
                          aria-controls={`section-content-${section.key}`}
                        >
                          <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wider group-hover:text-default-700">
                            {section.title}
                          </h3>
                          <Icon
                            icon={collapsedSections[section.key] ? "mdi:chevron-down" : "mdi:chevron-up"}
                            width={18}
                            className="text-default-400 group-hover:text-default-600 transition-transform"
                          />
                        </div>
                      </>
                    )}
                    {(!section.title || !collapsedSections[section.key]) && (
                      <div id={`section-content-${section.key}`} className="flex flex-col gap-0.5 pt-1">
                        {section.items.map((item, idx) => renderSidebarItem(item, idx))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </nav>
          )}

          <Spacer y={8} />

          {isPluginCardVisible && (
             isSidebarLoading ? <Skeleton className="mx-2 h-40 rounded-lg mb-10" /> : (
            <Card className="mx-2 overflow-visible mb-10 relative" shadow="sm" isBlurred>
              <Button
                isIconOnly size="sm" variant="light"
                className="absolute top-1.5 right-1.5 z-10 text-default-500 hover:text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-full w-7 h-7 min-w-0"
                aria-label="Hide plugin card" onPress={handleHidePluginCard}
              >
                <Icon icon="mdi:close" width={18} />
              </Button>
              <CardBody className="items-center py-5 text-center pt-7">
                <h3 className="text-base font-medium text-default-700">Download Our Plugin 🚀</h3>
                <p className="p-4 text-sm text-default-500">
                  Download our plugin to get the most out of your Webshop.
                </p>
              </CardBody>
              <CardFooter className="absolute -bottom-5 justify-center">
                <Button
                  className="px-10 shadow-lg" color="primary" radius="full" variant="shadow"
                  onPress={() => console.log("Download plugin clicked")}
                >
                  Download
                </Button>
              </CardFooter>
            </Card>
            )
          )}
        </ScrollShadow>

        {/* Credits Section */}
        {isSidebarLoading ? <CreditsSkeleton /> : (
            <div className="mt-auto pt-4 border-t border-divider px-3 pb-2">
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-default-600 dark:text-default-400 mb-1">
                        <span className="font-medium">Credits Used</span>
                        <span className="font-semibold">{usedCredits.toLocaleString()} / {totalCredits.toLocaleString()}</span>
                    </div>
                    <Progress
                        value={creditUsagePercentage}
                        color="primary"
                        size="sm"
                        aria-label="Credit usage"
                        classNames={{
                            indicator: "bg-primary",
                            label: "text-primary-foreground"
                        }}
                    />
                    <div className="text-xs text-default-500 dark:text-default-500 mt-1 text-right">
                        {creditsLeft.toLocaleString()} Credits Left
                    </div>
                </div>
            </div>
        )}

        {/* Bottom Actions Area */}
        {isSidebarLoading ? (
            <div className="flex flex-col gap-1 pt-2 border-t border-divider px-1">
                <Skeleton className="h-10 rounded-md mx-1" />
                <Skeleton className="h-10 rounded-md mx-1" />
            </div>
        ) : (
            <div className="flex flex-col gap-1 pt-2 border-t border-divider">
            <Button
                fullWidth radius="md" className="justify-start text-default-600 text-sm h-10"
                startContent={<Icon icon="solar:info-circle-line-duotone" width={20} />} variant="light"
                onPress={() => console.log("Help clicked")}
            >
                Help & Information
            </Button>
            <Button
                fullWidth radius="md" className="justify-start text-sm h-10" color="danger"
                startContent={<Icon icon="solar:logout-3-line-duotone" width={20} />} variant="light"
                onPress={handleLogout}
            >
                Log Out
            </Button>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onOpenChange={onModalOpenChange} placement="center" backdrop="blur">
        <ModalContent>
          {(onCloseModalCallback) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-lg font-medium">Add New Webshop</ModalHeader>
              <ModalBody>
                <Input autoFocus label="Shop Name" placeholder="e.g., My Awesome Store" variant="bordered" value={newName} onValueChange={setNewName} radius="md" />
                <Input label="Shop URL" placeholder="https://example.com" variant="bordered" value={newUrl} onValueChange={setNewUrl} radius="md" />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" color="default" onPress={onCloseModalCallback} radius="md">Cancel</Button>
                <Button color="primary" onPress={handleAddShop} isDisabled={!newName.trim() || !newUrl.trim()} radius="md">Add Shop</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
