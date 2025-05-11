'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Select,
    SelectItem,
    Button,
    Chip,
    Skeleton,
    Switch,
    Input,
    Checkbox,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tabs,
    Tab,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from '@heroui/react'; // Assuming @heroui/react is a valid library
import { Icon } from '@iconify/react';

// --- Enhanced Type Definitions ---
type DesignItem = { id: number; name: string; }
type Assignment = Record<string, DesignItem | null> // For individual email assignments in specific groups
interface Shop { name: string; url: string; }
type Notification = { message: string; type: 'success' | 'error'; } | null;

// --- User Groups ---
type UserGroup = {
    id: string;
    name: string;
    description?: string;
    emails: string[];
    colorScheme: { light: string; dark: string; };
    supportsIndividualDesignAssignment: boolean; // True if designs can be assigned per email (e.g., Send Now)
    groupDesignId?: number | null; // ID of the design assigned to the whole group (if not supporting individual)
    isDefault?: boolean;
};

// --- Automation Types (Shop-Agnostic) ---
type AutomationTriggerType = 'badgeApplied' | 'manualAdd' | 'specificDate' | 'recurring';
type SuggestionTrigger = Extract<SuggestionType, 'abandoned' | 'welcome' | 'coupon' | 'loyalty'>;

type AutomationTrigger =
  | { type: 'badgeApplied'; badgeType: SuggestionTrigger; delayDays?: number }
  | { type: 'specificDate'; date: string }
  | { type: 'recurring'; cronExpression: string; description: string }
  | { type: 'manualAdd' };

type AutomationStep = {
  id: string;
  designId: number | null;
  delayDays: number;
  subject?: string;
};

type Automation = {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  trigger: AutomationTrigger;
  steps: AutomationStep[];
};

type PoolColumnId = 'pool';
type GroupColumnId = string;
type DroppableColumnId = PoolColumnId | GroupColumnId;


type SuggestionType = 'coupon' | 'loyalty' | 'abandoned' | 'welcome' | 'none';
type EmailSuggestion = { text: string; type: SuggestionType; badgeColor: "default" | "primary" | "secondary" | "success" | "warning" | "danger"; description: string; icon: string; };

// --- Constants ---
const POOL_PAGE_SIZE = 20;
const GROUP_PAGE_SIZE = 15;

const DEFAULT_GROUP_COLORS = [
    { light: 'bg-blue-50', dark: 'dark:bg-blue-900/40' },
    { light: 'bg-orange-50', dark: 'dark:bg-orange-900/40' },
    { light: 'bg-green-50', dark: 'dark:bg-green-900/40' },
    { light: 'bg-yellow-50', dark: 'dark:bg-yellow-900/40' },
    { light: 'bg-pink-50', dark: 'dark:bg-pink-900/40' },
    { light: 'bg-purple-50', dark: 'dark:bg-purple-900/40' },
    { light: 'bg-teal-50', dark: 'dark:bg-teal-900/40' },
];

const initialUserGroups: UserGroup[] = [
    { id: 'group-send-now', name: 'Send Now', description: "For immediate, one-time campaigns. Supports individual designs per email.", emails: [], colorScheme: DEFAULT_GROUP_COLORS[0], supportsIndividualDesignAssignment: true, groupDesignId: null, isDefault: true },
    { id: 'group-abandoned-cart', name: 'Abandoned Cart Prospects', description: "Customers who left items in their cart. Uses a single group design.", emails: [], colorScheme: DEFAULT_GROUP_COLORS[1], supportsIndividualDesignAssignment: false, groupDesignId: null, isDefault: true },
    { id: 'group-loyalty-rewards', name: 'Loyalty Rewards Candidates', description: "Customers eligible for loyalty perks. Uses a single group design.", emails: [], colorScheme: DEFAULT_GROUP_COLORS[2], supportsIndividualDesignAssignment: false, groupDesignId: null, isDefault: true },
];

const initialAutomations: Automation[] = [
    { id: 'auto-welcome-1', name: 'Welcome Series', description: 'Greets new customers and introduces the brand over several days.', isEnabled: true, trigger: { type: 'badgeApplied', badgeType: 'welcome', delayDays: 0 }, steps: [{id: 's1', designId: 1, delayDays: 0, subject: "Welcome to Our Family!"}, {id: 's2', designId: 4, delayDays: 2, subject: "Discover What's New"}] },
    { id: 'auto-abandoned-1', name: 'Cart Recovery Flow', description: 'Reminds customers about items left in their cart to encourage purchase completion.', isEnabled: true, trigger: { type: 'badgeApplied', badgeType: 'abandoned', delayDays: 1 }, steps: [{id: 's1', designId: 5, delayDays: 0, subject: "Did you forget something in your cart?"}] },
];

const POOL_COLUMN_METADATA = { pool: { name: 'All Customers', description: 'Available customers not in any group.' }};
const AUTOMATIONS_PANEL_METADATA = {
    name: 'Workflow Automation',
    description: "Manage shop-wide automated email flows.",
    bgColorClassLight: 'bg-violet-50',
    bgColorClassDark: 'dark:bg-violet-900/40'
};

const SUGGESTION_METADATA: Record<SuggestionType, EmailSuggestion> = {
    coupon:     { text: 'Send Coupon',    type: 'coupon',    badgeColor: 'warning', description: 'Customer might respond well to a discount offer.', icon: '🏷️' },
    loyalty:    { text: 'Loyalty Offer',  type: 'loyalty',   badgeColor: 'secondary', description: 'Recognize a returning or high-value customer.', icon: '⭐' },
    abandoned: { text: 'Abandoned Cart', type: 'abandoned', badgeColor: 'warning', description: 'Customer added items to cart but did not complete purchase.', icon: '🛒' },
    welcome:   { text: 'Welcome Email',  type: 'welcome',   badgeColor: 'primary',     description: 'New customer or recent signup.', icon: '👋' },
    none:       { text: '',               type: 'none',      badgeColor: 'default',     description: '', icon: '' },
};

// --- Helper Components ---

const SkeletonColumn: React.FC<{className?: string}> = ({className}) => (
    <Card className={`p-4 flex flex-col min-h-[400px] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm ${className}`}>
        <CardHeader className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-neutral-700">
            <Skeleton className="h-5 w-3/5 rounded-lg bg-gray-200 dark:bg-neutral-700" />
            <Skeleton className="h-5 w-1/5 rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </CardHeader>
        <CardBody className="flex-grow space-y-3 mt-2">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-neutral-700" />
            ))}
        </CardBody>
        <CardFooter className="flex justify-between items-center pt-3 mt-4 border-t border-gray-200 dark:border-neutral-700">
            <Skeleton className="h-8 w-1/4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
            <Skeleton className="h-6 w-1/4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
            <Skeleton className="h-8 w-1/4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
        </CardFooter>
    </Card>
);

const SuggestionBadge: React.FC<{ suggestion: EmailSuggestion }> = ({ suggestion }) => {
    if (suggestion.type === 'none' || !suggestion.text) return null;
    return (
        <Chip
            size="sm"
            variant="flat"
            color={suggestion.badgeColor}
            className="ml-2 whitespace-nowrap"
            title={suggestion.description}
            startContent={<span className="mr-1 text-xs">{suggestion.icon}</span>}
        >
            <span className="text-xs">{suggestion.text}</span>
        </Chip>
    );
};

const AddGroupCard: React.FC<{ onOpenGroupModal: () => void }> = ({ onOpenGroupModal }) => (
    <Card
        className="p-0 flex flex-col min-h-[400px] max-h-[calc(100vh-250px)] border-2 border-dashed border-gray-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800/30 hover:bg-gray-200 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer items-center justify-center rounded-lg shadow-sm hover:shadow-md"
        onPress={onOpenGroupModal}
        isPressable
    >
        <CardBody className="flex flex-col items-center justify-center text-center p-4">
            <Icon icon="mdi:plus-circle-outline" className="text-5xl text-gray-400 dark:text-neutral-500 mb-3" />
            <p className="text-sm font-medium text-gray-600 dark:text-neutral-300">Add New Group</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">Click to define a new customer segment.</p>
        </CardBody>
    </Card>
);


// --- Core Campaign Editor Component ---
function CampaignEditor() {
  // --- State Variables ---
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [allEmailsRaw, setAllEmailsRaw] = useState<string[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>(initialUserGroups.map(g => ({...g, emails: [], groupDesignId: g.groupDesignId || null }))); // Ensure groupDesignId is initialized
  const [shopAutomations, setShopAutomations] = useState<Automation[]>(initialAutomations);
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment>({}); // For individual email assignments

  const [showPoolEmails, setShowPoolEmails] = useState<boolean>(true);
  const [isSectionLoading, setIsSectionLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification>(null);

  const [poolCurrentPage, setPoolCurrentPage] = useState<number>(1);
  const [groupPagination, setGroupPagination] = useState<Record<GroupColumnId, number>>({});
  const [poolSearchTerm, setPoolSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<DroppableColumnId, Set<string>>>({ pool: new Set() });
  const [targetGroupIdForPoolMove, setTargetGroupIdForPoolMove] = useState<string | null>(null);

  const {isOpen: isAutomationModalOpen, onOpen: onAutomationModalOpen, onClose: onAutomationModalClose, onOpenChange: onAutomationModalOpenChange} = useDisclosure();
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const {isOpen: isGroupModalOpen, onOpen: onGroupModalOpen, onClose: onGroupModalClose, onOpenChange: onGroupModalOpenChange} = useDisclosure();
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(DEFAULT_GROUP_COLORS[0]);
  const [newGroupSupportsIndividual, setNewGroupSupportsIndividual] = useState(false);
  const [newGroupDesignId, setNewGroupDesignId] = useState<number | null>(null);


  const [currentView, setCurrentView] = useState<'kanban' | 'calendar'>('kanban');

  // --- Utility Functions ---
  const slugify = useCallback((url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(), []);
  const showNotification = useCallback((message: string, type: 'success' | 'error') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); }, []);
  const getSuggestionForEmail = useCallback((email: string): EmailSuggestion => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const suggestionTypes = Object.keys(SUGGESTION_METADATA) as SuggestionType[];
    const activeSuggestionTypes = suggestionTypes.filter(t => t !== 'none');
    if (activeSuggestionTypes.length === 0) return SUGGESTION_METADATA.none;
    const typeIndex = Math.abs(hash) % activeSuggestionTypes.length;
    return Math.abs(hash % 4) === 0 ? SUGGESTION_METADATA.none : SUGGESTION_METADATA[activeSuggestionTypes[typeIndex]] || SUGGESTION_METADATA.none;
  }, []);

   // --- Effects ---
   useEffect(() => {
     // Load shops from cookie
     const rawCookie = document.cookie.split('; ').find((c) => c.startsWith('my_webshops='))?.split('=')[1] ?? '[]';
     try {
         const list = JSON.parse(decodeURIComponent(rawCookie)) as Shop[];
         if (Array.isArray(list) && list.every(item => typeof item === 'object' && item !== null && 'name' in item && 'url' in item)) {
             setShops(list);
         } else {
             setError("Invalid shop data format in cookie.");
             setShops([]);
         }
     } catch (err) {
         console.error("Cookie parsing error:", err);
         setError("Could not parse shop list from cookie.");
         setShops([]);
     }
   }, []);

   useEffect(() => {
     // Mock load designs
     setTimeout(() => {
         try {
             setDesigns([
                 { id: 1, name: 'Welcome Offer Design' },
                 { id: 2, name: 'Spring Sale Design' },
                 { id: 3, name: 'Loyalty Discount Design' },
                 { id: 4, name: 'New Arrivals Design' },
                 { id: 5, name: 'Abandoned Cart Reminder Design'}
             ]);
         } catch (err) {
             setError("Failed to load designs.");
         }
     }, 500);
   }, []);

   useEffect(() => {
     if (!selectedShop) {
         setAllEmailsRaw([]);
         setUserGroups(initialUserGroups.map(g => ({...g, emails: [], groupDesignId: g.groupDesignId || null })));
         setShopAutomations(initialAutomations);
         setAssignments({});
         setIsSectionLoading(false);
         setError(null);
         return;
     }
     const shopId = slugify(selectedShop.url);
     setIsSectionLoading(true);
     setError(null);
     setShowPoolEmails(true);
     setPoolCurrentPage(1);
     setPoolSearchTerm('');
     setGroupPagination({});
     
     const loadedUserGroups = initialUserGroups.map(g => ({
        ...g, 
        emails: [], // Reset emails for new shop selection
        groupDesignId: g.groupDesignId !== undefined ? g.groupDesignId : null // Ensure it's defined
     }));
     
     const initialSelections: Record<DroppableColumnId, Set<string>> = { pool: new Set() };
     loadedUserGroups.forEach(g => initialSelections[g.id] = new Set());
     
     setUserGroups(loadedUserGroups);
     setShopAutomations(initialAutomations);
     setAssignments({});
     setSelectedItems(initialSelections);
     setTargetGroupIdForPoolMove(null);

     console.log(`Fetching data for shop: ${shopId}`);
     setTimeout(() => {
         const mockCustomers = Array.from({length: Math.floor(Math.random() * 150) + 50}, (_,i) => `customer${i+1}-${shopId.substring(0,3)}@example.com`);
         setAllEmailsRaw(mockCustomers);

         const shopSpecificGroups = loadedUserGroups.map(g => ({...g, emails: []}));

         let customerIdx = 0;
         const sendNowGroup = shopSpecificGroups.find(g => g.id === 'group-send-now');
         if (sendNowGroup && mockCustomers.length > customerIdx) {
             const numToSendNow = Math.min(mockCustomers.length - customerIdx, Math.floor(Math.random() * 3) + 1);
             sendNowGroup.emails = mockCustomers.slice(customerIdx, customerIdx + numToSendNow);
             customerIdx += numToSendNow;
             if (designs.length > 0 && sendNowGroup.emails.length > 0 && sendNowGroup.supportsIndividualDesignAssignment) {
                 setAssignments({ [sendNowGroup.emails[0]]: designs[0]});
             }
         }

         const abandonedGroup = shopSpecificGroups.find(g => g.id === 'group-abandoned-cart');
         if (abandonedGroup && mockCustomers.length > customerIdx) {
             const numToAbandoned = Math.min(mockCustomers.length - customerIdx, Math.floor(Math.random() * 4) + 2);
             abandonedGroup.emails = mockCustomers.slice(customerIdx, customerIdx + numToAbandoned);
             // Example: Assign a group design if one is configured (e.g., design ID 5 for abandoned cart)
             if (!abandonedGroup.supportsIndividualDesignAssignment && designs.find(d => d.id === 5)) {
                abandonedGroup.groupDesignId = 5; // Pre-assign a design for demo
             }
         }
         setUserGroups(shopSpecificGroups);
         setIsSectionLoading(false);
     }, 1000);

   }, [selectedShop, designs, slugify]);

  // --- Memoized Derived State ---
  const assignedEmailsToGroups = useMemo(() => {
    const emailSet = new Set<string>();
    userGroups.forEach(group => {
        group.emails.forEach(email => emailSet.add(email));
    });
    return emailSet;
  }, [userGroups]);

  const filteredPoolEmails = useMemo(() => {
    return allEmailsRaw
      .filter(email => !assignedEmailsToGroups.has(email))
      .filter(email => email.toLowerCase().includes(poolSearchTerm.toLowerCase()));
  }, [allEmailsRaw, assignedEmailsToGroups, poolSearchTerm]);

  const poolTotalPages = Math.ceil(filteredPoolEmails.length / POOL_PAGE_SIZE);
  const paginatedPoolEmails = useMemo(() => {
    const startIndex = (poolCurrentPage - 1) * POOL_PAGE_SIZE;
    return filteredPoolEmails.slice(startIndex, startIndex + POOL_PAGE_SIZE);
  }, [filteredPoolEmails, poolCurrentPage]);

  const getPaginatedGroupEmails = useCallback((groupId: string): string[] => {
    const group = userGroups.find(g => g.id === groupId);
    if (!group) return [];
    const currentPage = groupPagination[groupId] || 1;
    const startIndex = (currentPage - 1) * GROUP_PAGE_SIZE;
    return group.emails.slice(startIndex, startIndex + GROUP_PAGE_SIZE);
  }, [userGroups, groupPagination]);

  const getGroupTotalPages = useCallback((groupId: string): number => {
    const group = userGroups.find(g => g.id === groupId);
    if (!group) return 1;
    return Math.ceil(group.emails.length / GROUP_PAGE_SIZE);
  }, [userGroups]);

  // --- Event Handlers: Selection ---
  const handleToggleSelectAll = (colId: DroppableColumnId, pageEmails: string[]) => {
    setSelectedItems(prev => {
        const currentSelectionInCol = prev[colId] || new Set<string>();
        const newSelectionForCol = new Set(currentSelectionInCol);
        const allSelectedOnPage = pageEmails.length > 0 && pageEmails.every(email => newSelectionForCol.has(email));

        if (allSelectedOnPage) {
            pageEmails.forEach(email => newSelectionForCol.delete(email));
        } else {
            pageEmails.forEach(email => newSelectionForCol.add(email));
        }
        return { ...prev, [colId]: newSelectionForCol };
    });
  };

  const handleEmailCheckboxChange = (colId: DroppableColumnId, email: string) => {
    setSelectedItems(prev => {
        const newSelectionForCol = new Set(prev[colId] || new Set<string>());
        if (newSelectionForCol.has(email)) {
            newSelectionForCol.delete(email);
        } else {
            newSelectionForCol.add(email);
        }
        return { ...prev, [colId]: newSelectionForCol };
    });
  };

  // --- Event Handlers: Drag and Drop for Emails ---
  const onEmailDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId: draggedEmail } = result;
    if (!destination) return;

    const sourceColId = source.droppableId as DroppableColumnId;
    const destColId = destination.droppableId as DroppableColumnId;

    if (sourceColId === destColId && source.index === destination.index) return;

    if (destColId !== 'pool' && !userGroups.find(g => g.id === destColId)) {
        showNotification("Emails can only be dropped into the Pool or Email Groups.", "error");
        return;
    }

    setUserGroups(prevUserGroups => {
        let newUserGroups = [...prevUserGroups];
        const sourceGroup = newUserGroups.find(g => g.id === sourceColId);
        const destGroup = newUserGroups.find(g => g.id === destColId);

        // Case 1: Pool to Group
        if (sourceColId === 'pool' && destGroup) {
            if (!destGroup.emails.includes(draggedEmail)) {
                destGroup.emails = [draggedEmail, ...destGroup.emails];
                showNotification(`${draggedEmail} added to ${destGroup.name}.`, 'success');
            }
        }
        // Case 2: Group to Pool
        else if (sourceGroup && destColId === 'pool') {
            sourceGroup.emails = sourceGroup.emails.filter(email => email !== draggedEmail);
            if (sourceGroup.supportsIndividualDesignAssignment && assignments[draggedEmail]) {
                setAssignments(prev => { const newA = {...prev}; delete newA[draggedEmail]; return newA;});
                showNotification(`Individual design for ${draggedEmail} removed as it returned to pool.`, 'success');
            } else {
                showNotification(`${draggedEmail} removed from ${sourceGroup.name} and returned to pool.`, 'success');
            }
        }
        // Case 3: Group to Group
        else if (sourceGroup && destGroup && sourceGroup.id !== destGroup.id) {
            if (sourceGroup.emails.includes(draggedEmail) && !destGroup.emails.includes(draggedEmail)) {
                sourceGroup.emails = sourceGroup.emails.filter(email => email !== draggedEmail);
                destGroup.emails = [draggedEmail, ...destGroup.emails];
                
                let notificationMessage = `${draggedEmail} moved from ${sourceGroup.name} to ${destGroup.name}.`;
                // If email had an individual assignment and moved from a group that supported it
                if (assignments[draggedEmail] && sourceGroup.supportsIndividualDesignAssignment) {
                    // If new group does NOT support individual assignments, remove the individual one.
                    if (!destGroup.supportsIndividualDesignAssignment) {
                        setAssignments(prev => { const newA = {...prev}; delete newA[draggedEmail]; return newA;});
                        notificationMessage += ` Its individual design was removed as ${destGroup.name} uses a group design.`;
                    }
                    // If new group ALSO supports individual, the assignment carries over (no change to `assignments` needed here).
                }
                 showNotification(notificationMessage, 'success');
            }
        }
        // Case 4: Reordering within the same Group
        else if (sourceGroup && destGroup && sourceGroup.id === destGroup.id) {
            const reorderedEmails = Array.from(sourceGroup.emails);
            const [removed] = reorderedEmails.splice(source.index, 1);
            reorderedEmails.splice(destination.index, 0, removed);
            sourceGroup.emails = reorderedEmails;
        }
        return newUserGroups;
    });

    setSelectedItems(prev => ({
        ...prev,
        [sourceColId]: new Set(),
        ...(sourceColId !== destColId && { [destColId]: new Set() })
    }));

  }, [userGroups, assignments, showNotification]);


  // --- Event Handlers: Drag and Drop for Design Assignments ---
  const onAssignDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId: designDraggableId } = result;

    if (source.droppableId !== 'designs' || !destination) return;

    const targetGroupId = destination.droppableId;
    const targetGroup = userGroups.find(g => g.id === targetGroupId);
    const designId = parseInt(designDraggableId.replace('design-', ''), 10);
    const draggedDesign = designs.find(d => d.id === designId);

    if (!targetGroup || !draggedDesign) {
        showNotification("Target group or design not found.", "error");
        return;
    }

    if (targetGroup.supportsIndividualDesignAssignment) {
        // Assign to individual email (current logic)
        const paginatedGroupEmails = getPaginatedGroupEmails(targetGroupId);
        const emailIndexInPage = destination.index;

        if (emailIndexInPage < 0 || emailIndexInPage >= paginatedGroupEmails.length) {
            showNotification("Invalid drop location for individual design assignment.", "error");
            return;
        }
        const targetEmail = paginatedGroupEmails[emailIndexInPage];
        if (targetEmail) {
            setAssignments(prev => ({ ...prev, [targetEmail]: draggedDesign }));
            showNotification(`Assigned '${draggedDesign.name}' to ${targetEmail} in ${targetGroup.name}.`, 'success');
        } else {
            showNotification("Failed to assign design. Email not found.", "error");
        }
    } else {
        // Assign to the entire group
        setUserGroups(prevUserGroups =>
            prevUserGroups.map(g =>
                g.id === targetGroupId ? { ...g, groupDesignId: draggedDesign.id } : g
            )
        );
        showNotification(`Assigned '${draggedDesign.name}' to group '${targetGroup.name}'.`, 'success');
    }
  }, [designs, userGroups, getPaginatedGroupEmails, showNotification]);


  // --- Event Handlers: Bulk Actions & Data Management ---
  const handleBulkMoveFromPool = useCallback((moveAllFiltered: boolean) => {
    if (!targetGroupIdForPoolMove) {
        showNotification("Please select a target group first.", "error");
        return;
    }
    const targetGroup = userGroups.find(g => g.id === targetGroupIdForPoolMove);
    if (!targetGroup) {
        showNotification("Target group not found.", "error");
        return;
    }

    const emailsToMove = moveAllFiltered ? filteredPoolEmails : Array.from(selectedItems.pool || new Set());

    if (emailsToMove.length === 0) {
        showNotification("No emails selected or available to move.", "error");
        return;
    }

    setUserGroups(prevGroups =>
        prevGroups.map(g => {
            if (g.id === targetGroupIdForPoolMove) {
                const newEmailsForGroup = Array.from(new Set([...g.emails, ...emailsToMove]));
                return { ...g, emails: newEmailsForGroup };
            }
            return g;
        })
    );

    setSelectedItems(prev => ({ ...prev, pool: new Set() }));
    setTargetGroupIdForPoolMove(null);
    showNotification(`${emailsToMove.length} emails moved to ${targetGroup.name}.`, 'success');
    if (poolCurrentPage > Math.ceil((filteredPoolEmails.length - emailsToMove.length) / POOL_PAGE_SIZE) && poolCurrentPage > 1) {
        setPoolCurrentPage(p => p -1);
    }

  }, [targetGroupIdForPoolMove, userGroups, filteredPoolEmails, selectedItems.pool, showNotification, poolCurrentPage]);


  const saveCampaignData = useCallback(() => {
    if (!selectedShop) { showNotification("Please select a shop first.", 'error'); return; }
    setIsSaving(true); setError(null);
    const payload = {
        shopSlug: slugify(selectedShop.url),
        userGroupsData: userGroups.map(g => ({ 
            id: g.id, 
            name: g.name, 
            description: g.description, 
            emails: g.emails, 
            colorScheme: g.colorScheme, 
            supportsIndividualDesignAssignment: g.supportsIndividualDesignAssignment, 
            groupDesignId: g.groupDesignId,
            isDefault: g.isDefault 
        })),
        shopAutomationsData: shopAutomations,
        assignmentsData: assignments, // Individual assignments for "Send Now" like groups
    };
    console.log("Saving Data:", JSON.stringify(payload, null, 2));
    setTimeout(() => {
        showNotification('Shop data saved successfully (Mocked)!', 'success');
        setIsSaving(false);
    }, 1000);
  }, [selectedShop, userGroups, shopAutomations, assignments, slugify, showNotification]);


  const handleBulkAssignDesignToSelectedEmails = (groupId: GroupColumnId, design: DesignItem) => { // Renamed for clarity
    const targetGroup = userGroups.find(g => g.id === groupId);
    if (!targetGroup || !targetGroup.supportsIndividualDesignAssignment) { // Only for groups supporting individual assignment
        showNotification("This group uses a single group-level design or was not found.", "error");
        return;
    }
    const selectedInGroup = selectedItems[groupId];
    if (!selectedInGroup || selectedInGroup.size === 0) {
        showNotification(`No emails selected in '${targetGroup.name}' to assign design.`, 'error');
        return;
    }
    setAssignments(prev => {
        const newAssignments = { ...prev };
        selectedInGroup.forEach(email => { newAssignments[email] = design; });
        return newAssignments;
    });
    showNotification(`Assigned '${design.name}' to ${selectedInGroup.size} selected emails in ${targetGroup.name}.`, 'success');
    setSelectedItems(prev => ({...prev, [groupId]: new Set()}));
  };

  const handleSetGroupDesign = (groupId: GroupColumnId, designId: number | null) => {
    setUserGroups(prevUserGroups =>
        prevUserGroups.map(g =>
            g.id === groupId ? { ...g, groupDesignId: designId } : g
        )
    );
    const designName = designId ? designs.find(d => d.id === designId)?.name : 'No Design';
    const groupName = userGroups.find(g => g.id === groupId)?.name;
    showNotification(`Set design for group '${groupName}' to '${designName}'.`, 'success');
  };


  const handleBulkRemoveFromGroup = (groupId: GroupColumnId) => {
    const selectedInGroup = selectedItems[groupId];
    const group = userGroups.find(g => g.id === groupId);
    if (!group) return;

    if (!selectedInGroup || selectedInGroup.size === 0) {
        showNotification(`No emails selected in '${group.name}' to remove.`, "error");
        return;
    }

    setUserGroups(prevGroups => prevGroups.map(g => {
        if (g.id === groupId) {
            const newEmails = g.emails.filter(email => !selectedInGroup.has(email));
            if (g.supportsIndividualDesignAssignment) { // Only clear individual assignments if group supported them
                setAssignments(prevAssignments => {
                    const newAssignments = {...prevAssignments};
                    selectedInGroup.forEach(email => {
                        delete newAssignments[email];
                    });
                    return newAssignments;
                });
            }
            return { ...g, emails: newEmails };
        }
        return g;
    }));
    showNotification(`Removed ${selectedInGroup.size} emails from '${group.name}'. They are now in the pool.`, 'success');
    setSelectedItems(prev => ({...prev, [groupId]: new Set()}));
  };

  // --- Group Modal Handlers ---
  const handleOpenGroupModal = (group?: UserGroup) => {
    setEditingGroup(group || null);
    setNewGroupName(group?.name || '');
    setNewGroupDescription(group?.description || '');
    setNewGroupSupportsIndividual(group ? group.supportsIndividualDesignAssignment : false); // Default new groups to single group design
    setNewGroupDesignId(group?.groupDesignId || null);

    const customGroups = userGroups.filter(ug => !ug.isDefault);
    const usedLightColors = new Set(customGroups.map(ug => ug.colorScheme.light));
    let defaultColor = DEFAULT_GROUP_COLORS[customGroups.length % DEFAULT_GROUP_COLORS.length];
    const availableColors = DEFAULT_GROUP_COLORS.filter(c => !usedLightColors.has(c.light));
    if (availableColors.length > 0) {
        defaultColor = availableColors[0];
    }
    setNewGroupColor(group?.colorScheme || defaultColor);
    onGroupModalOpen();
  };

  const handleSaveGroup = () => {
    if (!newGroupName.trim()) {
        showNotification("Group name cannot be empty.", "error");
        return;
    }
    if (editingGroup) {
        setUserGroups(prev => prev.map(g => g.id === editingGroup.id ? {
            ...g, 
            name: newGroupName.trim(), 
            description: newGroupDescription.trim(), 
            colorScheme: newGroupColor,
            supportsIndividualDesignAssignment: newGroupSupportsIndividual,
            groupDesignId: newGroupSupportsIndividual ? null : newGroupDesignId, // Clear groupDesignId if individual is chosen
        } : g));
        showNotification(`Group '${newGroupName.trim()}' updated.`, 'success');
    } else {
        const newGroup: UserGroup = {
            id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: newGroupName.trim(),
            description: newGroupDescription.trim(),
            emails: [],
            colorScheme: newGroupColor,
            supportsIndividualDesignAssignment: newGroupSupportsIndividual,
            groupDesignId: newGroupSupportsIndividual ? null : newGroupDesignId,
            isDefault: false,
        };
        setUserGroups(prev => [...prev, newGroup]);
        setSelectedItems(prev => ({...prev, [newGroup.id]: new Set()}));
        showNotification(`Group '${newGroup.name}' created.`, 'success');
    }
    onGroupModalClose();
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupToDelete = userGroups.find(g => g.id === groupId);
    if (!groupToDelete) return;

    if (groupToDelete.isDefault) {
        showNotification(`Default group '${groupToDelete.name}' cannot be deleted.`, "error");
        return;
    }

    setUserGroups(prev => prev.filter(g => g.id !== groupId));

    if (groupToDelete.supportsIndividualDesignAssignment) {
        setAssignments(prevAssignments => {
            const newAssignments = {...prevAssignments};
            groupToDelete.emails.forEach(email => delete newAssignments[email]);
            return newAssignments;
        });
    }
    // Group-level design (groupDesignId) is removed with the group itself.
    
    setSelectedItems(prev => {
        const newSelections = {...prev};
        delete newSelections[groupId];
        return newSelections;
    });
    showNotification(`Group '${groupToDelete.name}' deleted. Its members are now in the pool.`, 'success');
  };


  // --- Automation Modal Handlers ---
  const handleOpenAutomationModal = (automation?: Automation) => {
    setEditingAutomation(automation || null);
    onAutomationModalOpen();
  };

  const handleSaveAutomation = (automationToSave: Automation) => {
    setShopAutomations(prev => {
        const existing = prev.find(a => a.id === automationToSave.id);
        if (existing) {
            return prev.map(a => a.id === automationToSave.id ? automationToSave : a);
        }
        return [...prev, {...automationToSave, id: automationToSave.id || `auto-${Date.now()}`}];
    });
    onAutomationModalClose();
    showNotification(`Automation '${automationToSave.name}' saved.`, 'success');
  };

  // --- Render Logic ---
  const showBulkMoveFromPoolOptions = useMemo(() => (selectedItems.pool?.size || 0) > 0 || poolSearchTerm.length > 0, [selectedItems.pool, poolSearchTerm]);
  const canMoveAllFilteredFromPool = useMemo(() => filteredPoolEmails.length > 0 && filteredPoolEmails.length !== (selectedItems.pool?.size || 0), [filteredPoolEmails, selectedItems.pool]);


  return (
    <div className="mt-6">
        {/* Shop Selector and View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <Select
                label="Select Shop"
                placeholder="-- Select a Shop --"
                variant="bordered"
                selectedKeys={selectedShop ? [selectedShop.url] : []}
                onSelectionChange={(keys) => {
                    const newUrl = Array.from(keys)[0] as string | undefined;
                    setSelectedShop(shops.find((s) => s.url === newUrl) ?? null);
                }}
                isDisabled={isSectionLoading || isSaving || shops.length === 0}
                className="max-w-xs w-full sm:w-auto"
                classNames={{
                    label: "text-neutral-700 dark:text-neutral-400",
                    value: "text-black dark:text-neutral-200",
                    trigger: "border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:border-gray-400 dark:hover:border-neutral-500 rounded-md",
                    popoverContent: "bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 shadow-lg rounded-md",
                }}
            >
                {shops.map((shop) => (
                    <SelectItem key={shop.url} value={shop.url} textValue={shop.name}
                        className="text-black dark:text-neutral-200 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-neutral-700 data-[selectable=true]:focus:bg-primary-50 dark:data-[selectable=true]:focus:bg-primary-700/30"
                    >
                        {shop.name}
                    </SelectItem>
                ))}
            </Select>
            <div className="flex items-center gap-2 sm:gap-4">
                <Tabs aria-label="View Mode" selectedKey={currentView} onSelectionChange={(key) => setCurrentView(key as 'kanban' | 'calendar')}
                  classNames={{tabList: "bg-gray-100 dark:bg-neutral-700/50 rounded-md", cursor: "bg-white dark:bg-neutral-600 shadow-sm", tabContent: "group-data-[selected=true]:text-primary-600 dark:group-data-[selected=true]:text-primary-400"}}
                >
                    <Tab key="kanban" title={<div className="flex items-center"><Icon icon="mdi:view-kanban" className="mr-1"/> Kanban</div>}/>
                    <Tab key="calendar" title={<div className="flex items-center"><Icon icon="mdi:calendar-month" className="mr-1"/> Calendar</div>}/>
                </Tabs>
            </div>
        </div>

        {/* Notifications and Errors */}
        {notification && (
            <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-sm z-[100] border ${notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/70 border-green-600 dark:border-green-500 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/70 border-red-600 dark:border-red-500 text-red-700 dark:text-red-300'}`}>
                <div className="flex items-center">
                    <Icon icon={notification.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} className="mr-2 text-lg"/>
                    {notification.message}
                </div>
            </div>
        )}
        {error && (
            <div className="bg-red-50 dark:bg-red-900/70 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                <strong className="font-bold"><Icon icon="mdi:alert-octagon" className="inline mr-1"/> Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {!selectedShop && !isSectionLoading && (
            <Card className="text-center mt-10 p-8 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
                <CardBody className="text-neutral-600 dark:text-neutral-400">
                    <Icon icon="mdi:store-search-outline" className="text-4xl mb-2 text-neutral-400 dark:text-neutral-500"/>
                    {shops.length > 0 ? "Please select a shop to manage campaigns." : "No shops found. Please add shops in your settings."}
                </CardBody>
            </Card>
        )}

        {/* Main Content Area: Automations, Kanban (Pool & Groups) */}
        {selectedShop && (
          <>
            {/* Automations Panel (Separate Section) */}
            <section className={`my-8 ${isSectionLoading || isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
                <h2 className="text-xl font-semibold text-black dark:text-neutral-100 mb-4 flex items-center">
                    <Icon icon="mdi:robot-cog-outline" className="mr-2 text-2xl"/> {AUTOMATIONS_PANEL_METADATA.name}
                </h2>
                <Card className={`p-0 flex flex-col min-h-[250px] max-h-[calc(100vh-400px)] border rounded-lg shadow-sm border-gray-300 dark:border-neutral-700 ${AUTOMATIONS_PANEL_METADATA.bgColorClassLight} ${AUTOMATIONS_PANEL_METADATA.bgColorClassDark}`}>
                    <CardHeader className={`sticky top-0 z-10 flex justify-between items-center p-3 sm:p-4 border-b border-gray-200/50 dark:border-neutral-600/50 ${AUTOMATIONS_PANEL_METADATA.bgColorClassLight} ${AUTOMATIONS_PANEL_METADATA.bgColorClassDark}`}>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">{AUTOMATIONS_PANEL_METADATA.description}</p>
                        <Button size="sm" color="primary" variant="ghost" onPress={() => handleOpenAutomationModal()} className="rounded-md">
                            <Icon icon="mdi:plus"/> Add New
                        </Button>
                    </CardHeader>
                    <CardBody className="flex-grow overflow-y-auto space-y-3 p-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                        {isSectionLoading ? (
                            <>
                                <Skeleton className="h-16 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                                <Skeleton className="h-16 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                            </>
                        ) : shopAutomations.length === 0 ? (
                            <p className="text-center text-xs p-4 text-neutral-500 dark:text-neutral-400 italic">No automations defined for this shop.</p>
                        ) : (
                            shopAutomations.map(auto => (
                                <Card key={auto.id} className="p-3 bg-white dark:bg-neutral-700/90 border border-gray-200 dark:border-neutral-600 shadow-md rounded-lg hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-black dark:text-neutral-100 text-base">{auto.name}</p>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2" title={auto.description}>{auto.description || `Trigger: ${auto.trigger.type}`}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                                <Chip size="sm" variant="flat" color={auto.trigger.type === 'badgeApplied' ? 'secondary' : 'default'}>
                                                    <Icon icon="mdi:tag-outline" className="mr-1"/> Trigger: {auto.trigger.type}
                                                </Chip>
                                                <Chip size="sm" variant="flat">
                                                    <Icon icon="mdi:format-list-numbered" className="mr-1"/>Steps: {auto.steps.length}
                                                </Chip>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <Switch size="sm"
                                                isSelected={auto.isEnabled}
                                                onValueChange={(isSelected) => setShopAutomations(prev => prev.map(a => a.id === auto.id ? {...a, isEnabled: isSelected} : a))}
                                                aria-label={`Enable ${auto.name}`}
                                                color="success"
                                            />
                                            <Button size="sm" variant="light" onPress={() => handleOpenAutomationModal(auto)} isIconOnly className="text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                                                <Icon icon="mdi:pencil-outline" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </CardBody>
                </Card>
            </section>

            {/* Kanban View: Pool and Groups */}
            {currentView === 'kanban' && (
                <section className="relative mt-8">
                    {isSectionLoading ? (
                        <>
                            {/* Skeleton for Kanban Area (Pool and Groups) */}
                            <div className="flex flex-col xl:flex-row gap-6 items-start w-full mt-6">
                                {/* Pool Skeleton (Left) */}
                                <div className="w-full xl:w-[380px] xl:flex-shrink-0 order-1">
                                    <Skeleton className="h-8 w-1/2 mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                                    <SkeletonColumn className="bg-gray-50 dark:bg-neutral-800/50"/>
                                </div>
                                {/* Groups Area Skeleton (Right) */}
                                <div className="w-full xl:flex-grow order-2">
                                    <Skeleton className="h-8 w-1/3 mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                        <SkeletonColumn /> <SkeletonColumn /> <SkeletonColumn />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <DragDropContext onDragEnd={onEmailDragEnd}> {/* This context is for EMAIL drags */}
                            <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
                                {/* Pool Column (All Customers) - Far Left */}
                                <div className="w-full xl:w-[380px] xl:flex-shrink-0 order-1">
                                    <h2 className="text-xl font-semibold text-black dark:text-neutral-100 mb-4 flex items-center">
                                        <Icon icon="mdi:database-outline" className="mr-2 text-2xl"/> Customer Pool
                                    </h2>
                                    <Card className={`p-0 flex flex-col min-h-[400px] max-h-[calc(100vh-350px)] border rounded-lg shadow-sm border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50`}>
                                        <CardHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-neutral-800/50 flex flex-col items-start p-3 sm:p-4 border-b border-gray-200 dark:border-neutral-700 space-y-2">
                                            <div className="w-full flex justify-between items-center">
                                                <h3 className="font-semibold text-black dark:text-neutral-100 text-sm sm:text-base flex items-center">
                                                    {POOL_COLUMN_METADATA.pool.name}
                                                </h3>
                                                <Button size="sm" variant="light" color="primary" onPress={() => setShowPoolEmails(!showPoolEmails)} isDisabled={allEmailsRaw.length === 0 || isSaving} className="rounded-md">
                                                    {showPoolEmails ? 'Hide' : 'Show'} ({filteredPoolEmails.length})
                                                </Button>
                                            </div>
                                            <Input clearable fullWidth size="sm" placeholder="Search all customers..." value={poolSearchTerm} onValueChange={setPoolSearchTerm} className="bg-white dark:bg-neutral-700 rounded-md"
                                                startContent={<Icon icon="mdi:magnify" className="text-neutral-400"/>}
                                            />
                                            {showPoolEmails && paginatedPoolEmails.length > 0 && (
                                                <div className="w-full space-y-2 pt-1">
                                                    <Checkbox size="sm"
                                                        isSelected={selectedItems.pool?.size > 0 && paginatedPoolEmails.every(e => selectedItems.pool.has(e))}
                                                        onValueChange={() => handleToggleSelectAll('pool', paginatedPoolEmails)}
                                                        className="text-neutral-700 dark:text-neutral-300"
                                                    >
                                                        Select Page ({selectedItems.pool?.size || 0} selected)
                                                    </Checkbox>
                                                    {showBulkMoveFromPoolOptions && (
                                                        <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
                                                            <Select
                                                                size="sm"
                                                                placeholder="Move to Group..."
                                                                className="flex-grow"
                                                                selectedKeys={targetGroupIdForPoolMove ? [targetGroupIdForPoolMove] : []}
                                                                onSelectionChange={(keys) => setTargetGroupIdForPoolMove(Array.from(keys)[0] as string)}
                                                                classNames={{trigger: "bg-white dark:bg-neutral-600/50 rounded-md text-xs", popoverContent:"bg-white dark:bg-neutral-800 border rounded-md"}}
                                                            >
                                                                {userGroups.map(ug => <SelectItem key={ug.id} value={ug.id} className="text-black dark:text-neutral-200">{ug.name}</SelectItem>)}
                                                            </Select>
                                                            <div className="flex gap-2 w-full sm:w-auto">
                                                                <Button
                                                                    size="sm" color="primary" variant="flat" className="flex-grow sm:flex-grow-0 rounded-md"
                                                                    onPress={() => handleBulkMoveFromPool(false)}
                                                                    isDisabled={!targetGroupIdForPoolMove || (selectedItems.pool?.size || 0) === 0}
                                                                >
                                                                    Move Page Sel. ({selectedItems.pool?.size || 0})
                                                                </Button>
                                                                {canMoveAllFilteredFromPool && (
                                                                    <Button
                                                                        size="sm" color="secondary" variant="flat" className="flex-grow sm:flex-grow-0 rounded-md"
                                                                        onPress={() => handleBulkMoveFromPool(true)}
                                                                        isDisabled={!targetGroupIdForPoolMove || filteredPoolEmails.length === 0}
                                                                    >
                                                                        Move All ({filteredPoolEmails.length})
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    </div>
                                            )}
                                        </CardHeader>
                                        <Droppable droppableId="pool" isDropDisabled={false}>
                                            {(provided, snapshot) => (
                                                <CardBody ref={provided.innerRef} {...provided.droppableProps} className={`flex-grow overflow-y-auto space-y-1.5 p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent ${snapshot.isDraggingOver ? 'bg-blue-100/50 dark:bg-blue-800/30' : ''}`}>
                                                    {showPoolEmails && paginatedPoolEmails.map((email, index) => (
                                                        <Draggable key={email} draggableId={email} index={index}>
                                                            {(dp, ds) => (
                                                                <div ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps}
                                                                    className={`flex items-center p-2.5 border rounded-md text-xs sm:text-sm cursor-grab transition-shadow ${ ds.isDragging ? 'bg-primary-100 dark:bg-primary-700/40 text-primary-900 dark:text-primary-200 shadow-xl ring-2 ring-primary-500' : 'bg-white dark:bg-neutral-700/80 border-gray-300 dark:border-neutral-600 text-black dark:text-neutral-200 hover:shadow-md' }`}
                                                                >
                                                                    <Checkbox size="sm" className="mr-2 shrink-0" isSelected={selectedItems.pool?.has(email)} onValueChange={() => handleEmailCheckboxChange('pool', email)}/>
                                                                    <span className="truncate flex-grow" title={email}>{email}</span>
                                                                    <SuggestionBadge suggestion={getSuggestionForEmail(email)} />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {!showPoolEmails && filteredPoolEmails.length > 0 && ( <p className="text-center text-xs p-4 text-neutral-500 dark:text-neutral-400">Click 'Show' to view customers.</p> )}
                                                    {showPoolEmails && paginatedPoolEmails.length === 0 && poolSearchTerm && (<p className="text-center text-xs p-4 text-neutral-500 dark:text-neutral-400">No customers match your search.</p>)}
                                                    {showPoolEmails && paginatedPoolEmails.length === 0 && !poolSearchTerm && allEmailsRaw.length > 0 && (<p className="text-center text-xs p-4 text-neutral-500 dark:text-neutral-400">All customers are in groups.</p>)}
                                                    {allEmailsRaw.length === 0 && !isSectionLoading && (<p className="text-center text-xs p-4 text-neutral-500 dark:text-neutral-400">No customers found for this shop.</p>)}
                                                    {provided.placeholder}
                                                </CardBody>
                                            )}
                                        </Droppable>
                                        {showPoolEmails && poolTotalPages > 1 && (
                                            <CardFooter className="flex justify-between items-center p-2 border-t border-gray-200 dark:border-neutral-700 text-xs sticky bottom-0 bg-gray-50 dark:bg-neutral-800/50">
                                                <Button size="sm" variant="bordered" onPress={() => setPoolCurrentPage(p => Math.max(p - 1, 1))} isDisabled={poolCurrentPage === 1} className="rounded-md">Prev</Button>
                                                <span className="text-neutral-600 dark:text-neutral-400">Page {poolCurrentPage} of {poolTotalPages}</span>
                                                <Button size="sm" variant="bordered" onPress={() => setPoolCurrentPage(p => Math.min(p + 1, poolTotalPages))} isDisabled={poolCurrentPage === poolTotalPages} className="rounded-md">Next</Button>
                                            </CardFooter>
                                        )}
                                    </Card>
                                </div>

                                {/* Groups Area - Center/Right */}
                                <div className="w-full xl:flex-grow order-2">
                                    <h2 className="text-xl font-semibold text-black dark:text-neutral-100 mb-4 flex items-center">
                                        <Icon icon="mdi:account-group-outline" className="mr-2 text-2xl"/>Email Groups
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {userGroups.map(group => {
                                            const paginatedGroupUserEmails = getPaginatedGroupEmails(group.id);
                                            const totalGroupPages = getGroupTotalPages(group.id);
                                            const currentGroupPage = groupPagination[group.id] || 1;
                                            const selectedInThisGroup = selectedItems[group.id] || new Set();
                                            const intensifiedDarkBg = group.colorScheme.dark.replace('dark:bg-', 'dark:bg-').replace('/40', '/60');
                                            const groupOverallDesign = !group.supportsIndividualDesignAssignment ? designs.find(d => d.id === group.groupDesignId) : null;

                                            return (
                                                <Card key={group.id} className={`p-0 flex flex-col min-h-[400px] max-h-[calc(100vh-350px)] border rounded-lg shadow-sm border-gray-300 dark:border-neutral-600 ${group.colorScheme.light} ${group.colorScheme.dark}`}>
                                                    <CardHeader className={`sticky top-0 z-10 flex flex-col items-start p-3 sm:p-4 border-b border-gray-200/50 dark:border-neutral-600/50 space-y-2 ${group.colorScheme.light} ${group.colorScheme.dark}`}>
                                                        <div className="w-full flex justify-between items-center">
                                                            <h3 className="font-semibold text-black dark:text-neutral-100 text-sm sm:text-base truncate pr-2 flex items-center" title={group.name}>
                                                                <Icon icon="mdi:email-multiple-outline" className="mr-2 text-lg"/> {group.name} ({group.emails.length})
                                                            </h3>
                                                            <Dropdown>
                                                                <DropdownTrigger><Button isIconOnly size="sm" variant="light" className="text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><Icon icon="mdi:dots-vertical" /></Button></DropdownTrigger>
                                                                <DropdownMenu aria-label="Group Actions" onAction={(key) => { if(key === 'edit') handleOpenGroupModal(group); else if(key === 'delete') handleDeleteGroup(group.id);}}
                                                                    itemClasses={{base:"gap-3 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-neutral-700 rounded-md", title:"text-black dark:text-neutral-200"}}
                                                                >
                                                                    <DropdownItem key="edit" startContent={<Icon icon="mdi:pencil-outline"/>}>Edit Group</DropdownItem>
                                                                    {!group.isDefault && <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Icon icon="mdi:delete-outline"/>}>Delete Group</DropdownItem>}
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </div>
                                                        {group.description && <p className="text-xs text-neutral-600 dark:text-neutral-400 w-full truncate" title={group.description}>{group.description}</p>}
                                                        
                                                        {/* Group Design Selector / Info */}
                                                        {!group.supportsIndividualDesignAssignment && (
                                                            <div className="w-full mt-1 text-xs">
                                                                <Select
                                                                    size="sm"
                                                                    labelPlacement="outside-left"
                                                                    label={<span className="text-xs text-neutral-700 dark:text-neutral-300">Group Design:</span>}
                                                                    placeholder="Select design"
                                                                    selectedKeys={group.groupDesignId ? [group.groupDesignId.toString()] : []}
                                                                    onSelectionChange={(keys) => handleSetGroupDesign(group.id, Number(Array.from(keys)[0]) || null)}
                                                                    className="w-full"
                                                                    classNames={{trigger:`bg-white/70 dark:bg-black/20 rounded-md text-xs`, popoverContent:"bg-white dark:bg-neutral-800 border rounded-md"}}
                                                                >
                                                                    <SelectItem key="null" value="" className="text-black dark:text-neutral-200 italic">No Design</SelectItem>
                                                                    {designs.map(d => <SelectItem key={d.id.toString()} value={d.id.toString()} className="text-black dark:text-neutral-200">{d.name}</SelectItem>)}
                                                                </Select>
                                                            </div>
                                                        )}
                                                        {group.supportsIndividualDesignAssignment && (
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 w-full italic">Assigns designs per email.</p>
                                                        )}


                                                        {paginatedGroupUserEmails.length > 0 && (
                                                            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mt-1 gap-2">
                                                                <Checkbox size="sm"
                                                                    isSelected={selectedInThisGroup.size > 0 && paginatedGroupUserEmails.every(e => selectedInThisGroup.has(e))}
                                                                    onValueChange={() => handleToggleSelectAll(group.id, paginatedGroupUserEmails)}
                                                                    className="text-neutral-700 dark:text-neutral-300"
                                                                >
                                                                    Select Page ({selectedInThisGroup.size})
                                                                </Checkbox>
                                                                <Button size="xs" color="danger" variant="flat" onPress={() => handleBulkRemoveFromGroup(group.id)} isDisabled={selectedInThisGroup.size === 0} className="rounded-md">
                                                                    <Icon icon="mdi:account-multiple-remove-outline" className="mr-1"/> Remove Sel.
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {group.supportsIndividualDesignAssignment && designs.length > 0 && selectedInThisGroup.size > 0 && (
                                                            <Select size="sm" labelPlacement="outside-left" label={<span className="text-xs text-neutral-700 dark:text-neutral-300">Assign to Sel:</span>} placeholder="Select design" className="w-full mt-1"
                                                                classNames={{trigger:`bg-white/70 dark:bg-black/20 rounded-md text-xs`, popoverContent:"bg-white dark:bg-neutral-800 border rounded-md"}}
                                                                onSelectionChange={(keys) => {
                                                                    const designId = Array.from(keys)[0];
                                                                    const designToAssign = designs.find(d => d.id === Number(designId));
                                                                    if (designToAssign) handleBulkAssignDesignToSelectedEmails(group.id, designToAssign);
                                                                }}
                                                            >
                                                                {designs.map(d => <SelectItem key={d.id} value={d.id.toString()} className="text-black dark:text-neutral-200 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-neutral-700">{d.name}</SelectItem>)}
                                                            </Select>
                                                        )}
                                                    </CardHeader>
                                                    <Droppable droppableId={group.id} isDropDisabled={false}>
                                                        {(provided, snapshot) => (
                                                            <CardBody ref={provided.innerRef} {...provided.droppableProps} className={`flex-grow overflow-y-auto space-y-1.5 p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent ${snapshot.isDraggingOver ? `${group.colorScheme.light.replace('bg-','bg-')}-100 dark:${intensifiedDarkBg}` : ''}`}>
                                                                {paginatedGroupUserEmails.map((email, index) => {
                                                                    const individualDesign = group.supportsIndividualDesignAssignment ? assignments[email] : null;
                                                                    const displayDesign = individualDesign || groupOverallDesign;
                                                                    
                                                                    return (
                                                                    <Draggable key={email} draggableId={email} index={index}>
                                                                        {(dp, ds) => (
                                                                            <div ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps}
                                                                                className={`flex items-center p-2.5 border rounded-md text-xs sm:text-sm cursor-grab transition-shadow ${ ds.isDragging ? 'bg-primary-100 dark:bg-primary-700/40 text-primary-900 dark:text-primary-200 shadow-xl ring-2 ring-primary-500' : 'bg-white/80 dark:bg-neutral-700/70 border-gray-300/70 dark:border-neutral-600/70 text-black dark:text-neutral-200 hover:shadow-md' }`}
                                                                            >
                                                                                <Checkbox size="sm" className="mr-2 shrink-0" isSelected={selectedInThisGroup.has(email)} onValueChange={() => handleEmailCheckboxChange(group.id, email)}/>
                                                                                <span className="truncate flex-grow" title={email}>{email}</span>
                                                                                
                                                                                {/* Display design info on email card */}
                                                                                {group.supportsIndividualDesignAssignment && (
                                                                                    displayDesign ? (
                                                                                        <Chip size="xs" color="primary" variant="flat" className="ml-1 whitespace-nowrap" title={displayDesign.name}>
                                                                                            <Icon icon="mdi:palette-outline" className="mr-0.5"/> {displayDesign.name.substring(0,10)}..
                                                                                        </Chip>
                                                                                    ) : (
                                                                                        <Chip size="xs" color="default" variant="bordered" className="ml-1 whitespace-nowrap">
                                                                                            <Icon icon="mdi:palette-outline" className="mr-0.5"/> No Design
                                                                                        </Chip>
                                                                                    )
                                                                                )}
                                                                                {!group.supportsIndividualDesignAssignment && groupOverallDesign && (
                                                                                     <Chip size="xs" color="default" variant="flat" className="ml-1 whitespace-nowrap opacity-70" title={`Uses group design: ${groupOverallDesign.name}`}>
                                                                                        <Icon icon="mdi:palette-outline" className="mr-0.5"/> Group: {groupOverallDesign.name.substring(0,7)}..
                                                                                    </Chip>
                                                                                )}
                                                                                {!group.supportsIndividualDesignAssignment && !groupOverallDesign && (
                                                                                     <Chip size="xs" color="default" variant="bordered" className="ml-1 opacity-70 whitespace-nowrap">
                                                                                        <Icon icon="mdi:palette-outline" className="mr-0.5"/> Group: None
                                                                                    </Chip>
                                                                                )}
                                                                                <SuggestionBadge suggestion={getSuggestionForEmail(email)} />
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                )}
                                                                )}
                                                                {group.emails.length === 0 && (<p className="text-center text-xs p-4 text-neutral-500 dark:text-neutral-400 italic">Drag emails here or from the pool.</p>)}
                                                                {provided.placeholder}
                                                            </CardBody>
                                                        )}
                                                    </Droppable>
                                                    {totalGroupPages > 1 && (
                                                        <CardFooter className={`flex justify-between items-center p-2 border-t border-gray-200/50 dark:border-neutral-600/50 text-xs sticky bottom-0 ${group.colorScheme.light} ${group.colorScheme.dark}`}>
                                                            <Button size="sm" variant="bordered" onPress={() => setGroupPagination(p => ({...p, [group.id]: Math.max((p[group.id] || 1) - 1, 1)}))} isDisabled={currentGroupPage === 1} className="rounded-md">Prev</Button>
                                                            <span className="text-neutral-600 dark:text-neutral-400">Page {currentGroupPage} of {totalGroupPages}</span>
                                                            <Button size="sm" variant="bordered" onPress={() => setGroupPagination(p => ({...p, [group.id]: Math.min((p[group.id] || 1) + 1, totalGroupPages)}))} isDisabled={currentGroupPage === totalGroupPages} className="rounded-md">Next</Button>
                                                        </CardFooter>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                        <AddGroupCard onOpenGroupModal={() => handleOpenGroupModal()} />
                                    </div>
                                </div>
                            </div>
                        </DragDropContext>
                    )}
                </section>
            )} {/* End Kanban View */}

            {/* Calendar View Placeholder */}
            {selectedShop && currentView === 'calendar' && (
                <Card className="mt-6 p-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
                    <CardHeader><h2 className="text-xl font-semibold text-black dark:text-neutral-100 flex items-center"><Icon icon="mdi:calendar-clock" className="mr-2"/>Campaign Calendar (Placeholder)</h2></CardHeader>
                    <CardBody className="text-neutral-700 dark:text-neutral-400">
                        <p>This view will display scheduled automations and campaigns on a calendar.</p>
                        <div className="mt-4 p-8 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg text-center text-neutral-500 dark:text-neutral-500">
                            <Icon icon="mdi:construction" className="text-4xl mb-2"/>
                            <p>Calendar View Under Construction</p>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Design Assignment Section - This DND context is for DESIGN drags */}
            {selectedShop && currentView === 'kanban' && !isSectionLoading && (
                <section className={`mt-12 pt-6 border-t border-gray-300 dark:border-neutral-700 ${isSectionLoading || isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-black dark:text-neutral-100 text-xl font-semibold mb-2 flex items-center">
                        <Icon icon="mdi:palette-swatch-outline" className="mr-2 text-2xl"/> Assign Email Designs
                    </h2>
                    <p className="text-neutral-700 dark:text-neutral-400 text-sm mb-3">
                        Drag a design below. Drop it onto an email in a group that supports <strong>individual designs</strong> (like 'Send Now').
                        Or, drop it onto any part of a group that uses a <strong>single group design</strong> to assign it to the whole group.
                        Alternatively, use the 'Group Design' selector in the group's header.
                    </p>
                    <DragDropContext onDragEnd={onAssignDragEnd}>
                        <Droppable droppableId="designs" direction="horizontal">
                            {(provided, snapshot) => (
                                <Card ref={provided.innerRef} {...provided.droppableProps} className={`p-3 min-h-[80px] border rounded-lg shadow-sm bg-gray-100 dark:bg-neutral-800/70 border-gray-200 dark:border-neutral-700 ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                    <CardBody className="flex flex-row gap-3 items-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent pb-2">
                                        {designs.length > 0 ? designs.map((design, index) => (
                                            <Draggable key={design.id} draggableId={`design-${design.id}`} index={index}>
                                                {(dp, ds) => (
                                                    <Chip ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps}
                                                        color="secondary" variant="solid" size="lg"
                                                        className={`shadow-md cursor-grab transition-transform hover:scale-105 ${ds.isDragging ? 'ring-2 ring-secondary-500 scale-105 shadow-xl' : ''}`}
                                                        style={{...dp.draggableProps.style}} // Important for dnd
                                                        startContent={<Icon icon="mdi:drag-horizontal-variant" className="mr-1"/>}
                                                    >
                                                        {design.name}
                                                    </Chip>
                                                )}
                                            </Draggable>
                                        )) : ( <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">No designs available. Load or create designs.</p> )}
                                        {provided.placeholder}
                                    </CardBody>
                                </Card>
                            )}
                        </Droppable>
                    </DragDropContext>
                </section>
            )}

            {/* Save Button */}
             {selectedShop && currentView === 'kanban' && !isSectionLoading && (
                <div className="mt-8 pt-6 border-t border-gray-300 dark:border-neutral-700 text-right">
                    <Button color="success" variant="solid" onPress={saveCampaignData} isDisabled={isSectionLoading || isSaving || !selectedShop} isLoading={isSaving} className="min-w-[160px] rounded-md" size="lg"
                        startContent={!isSaving ? <Icon icon="mdi:content-save-outline"/> : null}
                    >
                        {isSaving ? 'Saving...' : 'Save Shop Data'}
                    </Button>
                </div>
            )}
          </>
        )} {/* End selectedShop conditional rendering */}


        {/* Modal for Adding/Editing Automations */}
        <Modal isOpen={isAutomationModalOpen} onOpenChange={onAutomationModalOpenChange} size="2xl" scrollBehavior="inside" backdrop="blur">
            <ModalContent className="bg-white dark:bg-neutral-800 text-black dark:text-neutral-100 border border-gray-300 dark:border-neutral-700 rounded-lg">
                {(onCloseModal) => (
                    <>
                        <ModalHeader className="border-b border-gray-200 dark:border-neutral-700 text-lg font-semibold">
                            {editingAutomation ? "Edit Automation" : "Create New Automation"}
                        </ModalHeader>
                        <ModalBody className="py-4">
                            <div className="space-y-4 mt-4">
                                <Input label="Automation Name" placeholder="e.g., Welcome Series" defaultValue={editingAutomation?.name} fullWidth autoFocus className="rounded-md" id="automation-name-input"/>
                                <Input label="Description" placeholder="e.g., Greets new customers" defaultValue={editingAutomation?.description} fullWidth className="rounded-md" id="automation-desc-input"/>
                                <Select label="Trigger Type" placeholder="Select trigger" defaultSelectedKeys={editingAutomation?.trigger?.type ? [editingAutomation.trigger.type] : []} fullWidth className="rounded-md"
                                  classNames={{popoverContent:"bg-white dark:bg-neutral-800 border rounded-md"}} id="automation-trigger-select"
                                >
                                    <SelectItem key="badgeApplied" value="badgeApplied" className="text-black dark:text-neutral-200">Badge Applied</SelectItem>
                                    <SelectItem key="specificDate" value="specificDate" className="text-black dark:text-neutral-200">Specific Date</SelectItem>
                                    <SelectItem key="recurring" value="recurring" className="text-black dark:text-neutral-200">Recurring</SelectItem>
                                    <SelectItem key="manualAdd" value="manualAdd" className="text-black dark:text-neutral-200">Manual Add (Placeholder)</SelectItem>
                                </Select>
                                <h4 className="text-md font-semibold mt-4 pt-3 border-t border-gray-200 dark:border-neutral-700">Email Steps (Placeholder)</h4>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">Define the sequence of emails, designs, and delays for this automation.</p>
                                {editingAutomation?.steps.map((step, idx) => (
                                    <div key={step.id || idx} className="p-3 border border-gray-200 dark:border-neutral-700 rounded-md bg-gray-50 dark:bg-neutral-700/50">
                                        Step {idx + 1}: Design ID {step.designId || 'N/A'}, Delay {step.delayDays} day(s)
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="rounded-md"><Icon icon="mdi:plus-box-outline" className="mr-1"/>Add Step</Button>
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-200 dark:border-neutral-700">
                            <Button color="danger" variant="light" onPress={onCloseModal} className="rounded-md">Cancel</Button>
                            <Button color="primary" onPress={() => {
                                const nameInput = document.getElementById('automation-name-input') as HTMLInputElement | null;
                                const descInput = document.getElementById('automation-desc-input') as HTMLInputElement | null;
                                const mockAutoData: Automation = {
                                    id: editingAutomation?.id || `auto-${Date.now()}`,
                                    name: nameInput?.value || (editingAutomation?.name || "New Automation"),
                                    description: descInput?.value || (editingAutomation?.description || ""),
                                    isEnabled: editingAutomation?.isEnabled ?? true,
                                    trigger: editingAutomation?.trigger || {type: 'manualAdd'},
                                    steps: editingAutomation?.steps || [] 
                                };
                                handleSaveAutomation(mockAutoData);
                                onCloseModal();
                            }} className="rounded-md">
                                {editingAutomation ? "Save Changes" : "Create Automation"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>

        {/* Modal for Adding/Editing User Groups */}
        <Modal isOpen={isGroupModalOpen} onOpenChange={onGroupModalOpenChange} size="xl" backdrop="blur">
            <ModalContent className="bg-white dark:bg-neutral-800 text-black dark:text-neutral-100 border border-gray-300 dark:border-neutral-700 rounded-lg">
                {(onCloseModal) => (
                    <>
                        <ModalHeader className="border-b border-gray-200 dark:border-neutral-700 text-lg font-semibold">
                            {editingGroup ? "Edit Email Group" : "Create New Email Group"}
                        </ModalHeader>
                        <ModalBody className="py-4 space-y-4">
                            <Input label="Group Name" placeholder="e.g., VIP Customers" value={newGroupName} onValueChange={setNewGroupName} fullWidth autoFocus className="rounded-md"/>
                            <Input label="Description (Optional)" placeholder="Briefly describe this group" value={newGroupDescription} onValueChange={setNewGroupDescription} fullWidth className="rounded-md" />
                            <div>
                                <label className="text-sm text-neutral-700 dark:text-neutral-300 mb-1 block font-medium">Color Scheme</label>
                                <div className="flex gap-2 flex-wrap">
                                    {DEFAULT_GROUP_COLORS.map(color => (
                                        <button key={color.light} onClick={() => setNewGroupColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ease-in-out
                                                ${newGroupColor.light === color.light ? 'ring-2 ring-primary-500 dark:ring-primary-400 ring-offset-1 ring-offset-white dark:ring-offset-neutral-800 scale-110' : 'border-gray-300 dark:border-neutral-600 hover:scale-105'}
                                                ${color.light} ${color.dark.split(':')[1]}`}
                                            title={`Light: ${color.light}, Dark: ${color.dark.split(':')[1]}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <Switch
                                isSelected={newGroupSupportsIndividual}
                                onValueChange={setNewGroupSupportsIndividual}
                                size="md"
                                color="primary"
                                isDisabled={editingGroup?.isDefault && editingGroup.id === 'group-send-now'} // 'Send Now' must support individual
                            >
                                Supports Individual Designs per Email
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {newGroupSupportsIndividual ? "Allows assigning different designs to each email in this group." : "Assigns one design to the entire group."}
                                </p>
                            </Switch>

                            {!newGroupSupportsIndividual && (
                                <Select 
                                    label="Group Design" 
                                    placeholder="Select a design for the whole group"
                                    selectedKeys={newGroupDesignId ? [newGroupDesignId.toString()] : []}
                                    onSelectionChange={(keys) => setNewGroupDesignId(Number(Array.from(keys)[0]) || null)}
                                    fullWidth 
                                    className="rounded-md mt-2"
                                    classNames={{popoverContent:"bg-white dark:bg-neutral-800 border rounded-md"}}
                                >
                                     <SelectItem key="null-design" value="" className="text-black dark:text-neutral-200 italic">No Group Design</SelectItem>
                                    {designs.map(d => (
                                        <SelectItem key={d.id.toString()} value={d.id.toString()} className="text-black dark:text-neutral-200">{d.name}</SelectItem>
                                    ))}
                                </Select>
                            )}

                        </ModalBody>
                        <ModalFooter className="border-t border-gray-200 dark:border-neutral-700">
                            <Button color="danger" variant="light" onPress={onCloseModal} className="rounded-md">Cancel</Button>
                            <Button color="primary" onPress={() => {handleSaveGroup(); onCloseModal();}} className="rounded-md">
                                {editingGroup ? "Save Changes" : "Create Group"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    </div>
  );
}

// --- Main Page Component (Wrapper) ---
export default function CampaignManagerPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); 
    }, []);

    if (!isClient) {
        return (
            <main className="p-4 md:p-6 lg:p-8 font-sans bg-white text-black min-h-screen dark:bg-neutral-900 dark:text-neutral-100">
                <div className="flex flex-col justify-center items-center min-h-[calc(100vh-100px)]">
                    <div className="w-full max-w-5xl mb-6">
                        <Skeleton className="h-12 w-1/2 rounded-lg mb-4 bg-gray-200 dark:bg-neutral-700" />
                        <Skeleton className="h-px w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
                    </div>
                    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="lg:col-span-2 p-4 bg-gray-100 dark:bg-neutral-800/50 rounded-lg"><Skeleton className="h-32 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" /></Card>
                        <Card className="p-4 bg-gray-100 dark:bg-neutral-800/50 rounded-lg"><Skeleton className="h-32 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" /></Card>
                    </div>
                    <div className="w-full max-w-5xl my-8">
                        <Skeleton className="h-8 w-1/3 mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                        <SkeletonColumn className="bg-violet-50 dark:bg-violet-900/40" />
                    </div>
                    <div className="w-full max-w-5xl flex flex-col xl:flex-row gap-6 items-start mt-6">
                        <div className="w-full xl:w-[380px] xl:flex-shrink-0 order-1">
                            <Skeleton className="h-8 w-1/2 mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                            <SkeletonColumn className="bg-gray-50 dark:bg-neutral-800/50"/>
                        </div>
                        <div className="w-full xl:flex-grow order-2">
                            <Skeleton className="h-8 w-1/3 mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                <SkeletonColumn /> <SkeletonColumn /> <SkeletonColumn />
                            </div>
                        </div>
                    </div>
                    <p className="text-xl mt-12 text-neutral-500 dark:text-neutral-400">Loading Advanced Campaign Manager...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="p-4 md:p-6 lg:p-8 space-y-6 font-sans bg-gray-50 text-black min-h-screen relative dark:bg-neutral-900 dark:text-neutral-100">
            <header className="border-b border-gray-300 dark:border-neutral-700 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-black dark:text-neutral-50 flex items-center">
                    <Icon icon="mdi:email-newsletter" className="mr-3 text-primary-600 dark:text-primary-400 text-4xl"/>
                    Advanced Campaign Manager
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Organize customers into groups, manage shop-level automations, and assign email designs.
                </p>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm">
                    <CardHeader><h3 className="text-lg font-semibold text-black dark:text-neutral-100 flex items-center"><Icon icon="mdi:tag-multiple-outline" className="mr-2"/>Badge Legend</h3></CardHeader>
                    <CardBody className="space-y-2 pt-0">
                        {Object.values(SUGGESTION_METADATA).filter(meta => meta.type !== 'none').map(meta => (
                            <div key={meta.type} className="flex items-start text-sm">
                                <SuggestionBadge suggestion={meta} />
                                <span className="ml-2 text-neutral-700 dark:text-neutral-400">- {meta.description}</span>
                            </div>
                        ))}
                    </CardBody>
                </Card>
                <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm">
                    <CardHeader><h3 className="text-lg font-semibold text-black dark:text-neutral-100 flex items-center"><Icon icon="mdi:cog-fast" className="mr-2"/>Quick Settings</h3></CardHeader>
                    <CardBody className="space-y-4 pt-0">
                        <Switch isDisabled={true} size="md" color="primary" classNames={{label: "text-sm text-black dark:text-neutral-300"}}> Auto-send based on triggers </Switch>
                        <Switch isDisabled={true} size="md" color="primary" classNames={{label: "text-sm text-black dark:text-neutral-300"}}> Auto-generate coupons </Switch>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 italic pt-2">(These settings are illustrative and not fully functional in this demo)</p>
                    </CardBody>
                </Card>
            </section>

            <CampaignEditor />
        </main>
    );
}

