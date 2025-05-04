// app/campaigns/page.tsx (or relevant path)
'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DroppableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot
} from '@hello-pangea/dnd'
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Select,        // Use HeroUI Select
    SelectItem,    // Use HeroUI SelectItem
    Button,
    Chip,          // Use HeroUI Chip
    Tooltip,
    Skeleton,
    Switch,        // Use HeroUI Switch
    // Consider using Modal for notifications/errors if desired
} from '@heroui/react'; // Assuming HeroUI components are imported
import { Icon } from '@iconify/react'; // Keep Iconify

// --- Type Definitions ---
type DesignItem = { id: number; name: string; }
type Assignment = Record<string, DesignItem | null>
interface Shop { name: string; url: string; }
type Notification = { message: string; type: 'success' | 'error'; } | null;
type CampaignColumnId = 'now' | 'weekly' | 'abandonedCart' | 'loyaltyReward';
type PoolColumnId = 'pool';
type DroppableColumnId = PoolColumnId | CampaignColumnId;
type CampaignEmails = Record<CampaignColumnId, string[]>;
type SuggestionType = 'coupon' | 'loyalty' | 'abandoned' | 'welcome' | 'none';
// Use semantic color names for badges, let Chip handle styling
type EmailSuggestion = { text: string; type: SuggestionType; badgeColor: "default" | "primary" | "secondary" | "success" | "warning" | "danger"; description: string; icon: string; };

// --- Constants ---
const POOL_PAGE_SIZE = 20;
const CAMPAIGN_PAGE_SIZE = 20;

// Column Metadata - Simplified bg/border, rely on Card component
const CAMPAIGN_COLUMNS_METADATA: Record<CampaignColumnId, { name: string; supportsDesignAssignment: boolean; supportsPagination: boolean }> = {
    now:           { name: 'Send Now',           supportsDesignAssignment: true,  supportsPagination: true },
    weekly:        { name: 'Scheduled Weekly',   supportsDesignAssignment: false, supportsPagination: false },
    abandonedCart: { name: 'Abandoned Cart',     supportsDesignAssignment: false, supportsPagination: false },
    loyaltyReward: { name: 'Loyalty Reward',     supportsDesignAssignment: false, supportsPagination: false },
};
const ALL_CAMPAIGN_COLUMN_IDS = Object.keys(CAMPAIGN_COLUMNS_METADATA) as CampaignColumnId[];

const POOL_COLUMN_METADATA = {
    pool: { name: 'All Customers' }
}

const BULK_MOVE_DRAGGABLE_PREFIX = 'bulk-move-';

// Suggestion Metadata with Semantic Colors for Chip
const SUGGESTION_METADATA: Record<SuggestionType, EmailSuggestion> = {
    coupon:    { text: 'Send Coupon',    type: 'coupon',    badgeColor: 'warning', description: 'Customer might respond well to a discount offer.', icon: '🏷️' },
    loyalty:   { text: 'Loyalty Offer',  type: 'loyalty',   badgeColor: 'secondary', description: 'Recognize a returning or high-value customer.', icon: '⭐' },
    abandoned: { text: 'Abandoned Cart', type: 'abandoned', badgeColor: 'warning', description: 'Customer added items to cart but did not complete purchase.', icon: '🛒' }, // Changed to warning
    welcome:   { text: 'Welcome Email',  type: 'welcome',   badgeColor: 'primary',    description: 'New customer or recent signup.', icon: '👋' },
    none:      { text: '',               type: 'none',      badgeColor: 'default',                              description: '', icon: '' },
};


// --- Helper Components ---

// Skeleton Column - Use HeroUI Skeleton more
const SkeletonColumn = () => (
  <Card className="p-4 flex flex-col min-h-[300px]">
      <CardHeader className="flex justify-between items-center mb-3 pb-2 border-b border-divider">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/4 rounded-lg" />
      </CardHeader>
      <CardBody className="flex-grow space-y-2 mt-2">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 w-5/6 rounded-lg" />
          <Skeleton className="h-8 w-4/6 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
      </CardBody>
       <CardFooter className="flex justify-between items-center pt-3 mt-4 border-t border-divider">
          <Skeleton className="h-6 w-1/4 rounded-lg" />
          <Skeleton className="h-4 w-1/4 rounded-lg" />
          <Skeleton className="h-6 w-1/4 rounded-lg" />
       </CardFooter>
  </Card>
);

// Suggestion Badge using HeroUI Chip
const SuggestionBadge: React.FC<{ suggestion: EmailSuggestion }> = ({ suggestion }) => {
    if (suggestion.type === 'none') return null;
    return (
        <Chip
            size="sm"
            variant="flat" // Flat often looks better
            color={suggestion.badgeColor}
            className="ml-2 whitespace-nowrap" // Ensure it doesn't wrap
            title={suggestion.description} // Tooltip via title
            startContent={<span className="mr-1">{suggestion.icon}</span>} // Icon inside chip
        >
            {suggestion.text}
        </Chip>
    );
};

// --- Core Campaign Editor Component ---

function CampaignEditor() {
  // State Management (Remains the same)
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [allEmailsRaw, setAllEmailsRaw] = useState<string[]>([])
  const [campaignEmails, setCampaignEmails] = useState<CampaignEmails>({ now: [], weekly: [], abandonedCart: [], loyaltyReward: [] });
  const [designs, setDesigns] = useState<DesignItem[]>([])
  const [assignments, setAssignments] = useState<Assignment>({})
  const [showPoolEmails, setShowPoolEmails] = useState<boolean>(false)
  const [isSectionLoading, setIsSectionLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification>(null);
  const [poolCurrentPage, setPoolCurrentPage] = useState<number>(1);
  const [campaignPagination, setCampaignPagination] = useState<Record<CampaignColumnId, number>>({ now: 1, weekly: 1, abandonedCart: 1, loyaltyReward: 1 });

  // Helper Functions (Remain the same)
  const slugify = useCallback((url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(), []);
  const showNotification = useCallback((message: string, type: 'success' | 'error') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); }, []);
  const getSuggestionForEmail = useCallback((email: string): EmailSuggestion => {
      let hash = 0; for (let i = 0; i < email.length; i++) { hash = email.charCodeAt(i) + ((hash << 5) - hash); }
      const typeIndex = Math.abs(hash) % 5;
      return SUGGESTION_METADATA[Object.keys(SUGGESTION_METADATA)[typeIndex] as SuggestionType] || SUGGESTION_METADATA.none;
  }, []);

  // Data Fetching Effects (Remain the same)
  useEffect(() => { /* Load shops */
      const raw = document.cookie.split('; ').find((c) => c.startsWith('my_webshops='))?.split('=')[1] ?? '[]';
      try {
          const list = JSON.parse(decodeURIComponent(raw)) as Shop[];
          if (Array.isArray(list) && list.every(item => typeof item === 'object' && item !== null && 'name' in item && 'url' in item)) {
              setShops(list);
          } else { setError("Invalid shop data."); setShops([]); }
      } catch (err) { setError("Could not load shop list."); setShops([]); }
  }, []);
  useEffect(() => { /* Load designs (mock) */
      setTimeout(() => { try { setDesigns([ { id: 1, name: 'Welcome Offer' }, { id: 2, name: 'Spring Sale' }, { id: 3, name: 'Loyalty Discount' }, { id: 4, name: 'New Arrivals' }, ]); } catch (err) {} }, 500);
  }, []);
  useEffect(() => { /* Fetch campaign/emails */
    if (!selectedShop) {
        setAllEmailsRaw([]); setCampaignEmails({ now: [], weekly: [], abandonedCart: [], loyaltyReward: [] }); setAssignments({}); setIsSectionLoading(false); setError(null); return;
    }
    const slug = slugify(selectedShop.url);
    setIsSectionLoading(true); setError(null); setShowPoolEmails(false); setPoolCurrentPage(1); setCampaignPagination({ now: 1, weekly: 1, abandonedCart: 1, loyaltyReward: 1 });
    Promise.allSettled([
        fetch(`/api/campaigns/${slug}`).then(res => res.ok ? res.json() : Promise.reject(new Error(res.statusText))),
        fetch(`/api/webshops/${slug}/customers`).then(res => res.ok ? res.json() : Promise.reject(new Error(res.statusText)))
    ]).then(([campaignResult, customersResult]) => {
        let fetchError = false; let errorMessages: string[] = [];
        if (campaignResult.status === 'fulfilled') {
            const camp = campaignResult.value as Partial<CampaignEmails & { assignments?: Assignment }>;
            setCampaignEmails({ now: camp.now ?? [], weekly: camp.weekly ?? [], abandonedCart: camp.abandonedCart ?? [], loyaltyReward: camp.loyaltyReward ?? [] });
            setAssignments(camp.assignments ?? {});
        } else {
            console.error("Campaign fetch error:", campaignResult.reason); errorMessages.push(campaignResult.reason?.message || 'Failed campaign load.');
            setCampaignEmails({ now: [], weekly: [], abandonedCart: [], loyaltyReward: [] }); setAssignments({}); fetchError = true;
        }
        if (customersResult.status === 'fulfilled') {
            const data = customersResult.value as { emails?: string[] }; setAllEmailsRaw(data.emails ?? []);
        } else {
            console.error("Customer fetch error:", customersResult.reason); errorMessages.push(customersResult.reason?.message || 'Failed customer load.');
            setAllEmailsRaw([]); fetchError = true;
        }
        if (fetchError) { setError(`Data load failed for ${selectedShop.name}: ${errorMessages.join(' ')}`); } else { setError(null); }
    }).finally(() => { setIsSectionLoading(false); });
  }, [selectedShop, slugify]);

  // Derived State (Remains the same)
  const assignedEmails = useMemo(() => { /* ... */ const emailSet = new Set<string>(); Object.values(campaignEmails).forEach(list => { list.forEach(email => emailSet.add(email)); }); return emailSet; }, [campaignEmails]);
  const poolEmails = useMemo(() => allEmailsRaw.filter(email => !assignedEmails.has(email)), [allEmailsRaw, assignedEmails]);
  const poolTotalPages = Math.ceil(poolEmails.length / POOL_PAGE_SIZE);
  const poolStartIndex = (poolCurrentPage - 1) * POOL_PAGE_SIZE;
  const poolEndIndex = poolStartIndex + POOL_PAGE_SIZE;
  const paginatedPoolEmails = useMemo(() => poolEmails.slice(poolStartIndex, poolEndIndex), [poolEmails, poolStartIndex, poolEndIndex]);
  const getPaginatedCampaignEmails = useCallback((columnId: CampaignColumnId): string[] => { /* ... */ const emails = campaignEmails[columnId]; if (!CAMPAIGN_COLUMNS_METADATA[columnId]?.supportsPagination) return emails; const currentPage = campaignPagination[columnId]; const startIndex = (currentPage - 1) * CAMPAIGN_PAGE_SIZE; const endIndex = startIndex + CAMPAIGN_PAGE_SIZE; return emails.slice(startIndex, endIndex); }, [campaignEmails, campaignPagination]);
  const getCampaignColumnTotalPages = useCallback((columnId: CampaignColumnId): number => { /* ... */ if (!CAMPAIGN_COLUMNS_METADATA[columnId]?.supportsPagination) return 1; return Math.ceil(campaignEmails[columnId].length / CAMPAIGN_PAGE_SIZE); }, [campaignEmails]);
  const poolCount = poolEmails.length;
  const getCampaignColumnCount = useCallback((columnId: CampaignColumnId) => campaignEmails[columnId].length, [campaignEmails]);

  // Drag & Drop Handlers (Logic remains the same)
  const onEmailDragEnd = useCallback((result: DropResult) => { /* ... D&D Logic ... */
        const { source, destination, draggableId } = result;
        if (!destination) return;
        const sourceColId = source.droppableId as DroppableColumnId;
        const destColId = destination.droppableId as DroppableColumnId;
        // --- Handle Bulk Move ---
        if (draggableId.startsWith(BULK_MOVE_DRAGGABLE_PREFIX)) {
            const sourceCampaignColId = draggableId.replace(BULK_MOVE_DRAGGABLE_PREFIX, '') as CampaignColumnId;
            if (destColId === 'pool' || destColId === sourceCampaignColId) return;
            const emailsToMove = getPaginatedCampaignEmails(sourceCampaignColId);
            if (emailsToMove.length === 0) return;
            setCampaignEmails(prev => {
                const sourceList = prev[sourceCampaignColId].filter(email => !emailsToMove.includes(email));
                const destList = [...prev[destColId as CampaignColumnId], ...emailsToMove.filter(email => !prev[destColId as CampaignColumnId].includes(email))];
                return { ...prev, [sourceCampaignColId]: sourceList, [destColId as CampaignColumnId]: destList };
            });
            setCampaignPagination(prev => ({ ...prev, [sourceCampaignColId]: 1 }));
            if (CAMPAIGN_COLUMNS_METADATA[sourceCampaignColId]?.supportsDesignAssignment) {
                setAssignments(prev => { const na = { ...prev }; emailsToMove.forEach(email => delete na[email]); return na; });
            }
            showNotification(`Moved ${emailsToMove.length} emails to ${CAMPAIGN_COLUMNS_METADATA[destColId as CampaignColumnId].name}`, 'success');
            return;
         }
        // --- Handle Single Item Move ---
        const draggedEmail = draggableId;
        if (sourceColId === destColId && source.index === destination.index) return;
        const findActualSourceIndex = (colId: DroppableColumnId, visualIndex: number): number => {
            if (colId === 'pool') { const emailToFind = paginatedPoolEmails[visualIndex]; return poolEmails.findIndex(email => email === emailToFind); }
            const columnData = CAMPAIGN_COLUMNS_METADATA[colId as CampaignColumnId];
            if (columnData?.supportsPagination) {
                const paginatedList = getPaginatedCampaignEmails(colId as CampaignColumnId);
                const itemIndex = visualIndex - (paginatedList.length > 0 && columnData.supportsPagination ? 1 : 0);
                const emailToFind = paginatedList[itemIndex];
                return campaignEmails[colId as CampaignColumnId].findIndex(e => e === emailToFind);
            }
            return visualIndex;
        };
         const findInsertionIndex = (colId: DroppableColumnId, visualIndex: number): number => {
             const destMetadata = CAMPAIGN_COLUMNS_METADATA[colId as CampaignColumnId];
             const destPaginatedEmails = getPaginatedCampaignEmails(colId as CampaignColumnId);
             const canBulkMoveDest = destMetadata?.supportsPagination && destPaginatedEmails.length > 0;
             return visualIndex - (canBulkMoveDest ? 1 : 0);
         };
        setCampaignEmails(prev => {
            const newCampaignEmails = { ...prev }; let emailToMove: string | undefined;
            if (sourceColId === 'pool') {
                emailToMove = paginatedPoolEmails[source.index];
                if (!emailToMove) { console.error("Source email not found in paginated pool"); return prev; }
            } else {
                const sourceList = [...prev[sourceColId as CampaignColumnId]];
                const actualSourceIndex = findActualSourceIndex(sourceColId, source.index);
                if (actualSourceIndex !== -1 && actualSourceIndex < sourceList.length) { [emailToMove] = sourceList.splice(actualSourceIndex, 1); newCampaignEmails[sourceColId as CampaignColumnId] = sourceList; }
                else { console.error(`Could not find email at visual index ${source.index} (actual: ${actualSourceIndex}) in source list ${sourceColId}`); return prev; }
            }
            if (!emailToMove) { console.error("Could not determine email to move"); return prev; }
            if (destColId === 'pool') { /* Removed from campaign list above */ }
            else {
                const destList = newCampaignEmails[destColId as CampaignColumnId] ? [...newCampaignEmails[destColId as CampaignColumnId]] : [];
                const actualDestIndex = findInsertionIndex(destColId, destination.index);
                if (!destList.includes(emailToMove)) {
                     const insertionPoint = Math.max(0, Math.min(actualDestIndex, destList.length));
                     destList.splice(insertionPoint, 0, emailToMove);
                     newCampaignEmails[destColId as CampaignColumnId] = destList;
                }
            }
            return newCampaignEmails;
        });
        // --- Post-Move Updates ---
        if (sourceColId !== 'pool' && CAMPAIGN_COLUMNS_METADATA[sourceColId as CampaignColumnId]?.supportsDesignAssignment) { setAssignments(prev => { const na = {...prev}; delete na[draggedEmail]; return na; }); }
        if (sourceColId !== 'pool' && CAMPAIGN_COLUMNS_METADATA[sourceColId as CampaignColumnId]?.supportsPagination) { setCampaignPagination(prev => ({ ...prev, [sourceColId as CampaignColumnId]: 1 })); }
        if (destColId === 'pool') { setPoolCurrentPage(1); showNotification(`${draggedEmail} unassigned.`, 'success'); }
    }, [campaignEmails, poolEmails, paginatedPoolEmails, campaignPagination, poolCurrentPage, getPaginatedCampaignEmails, showNotification]);

    const onAssignDragEnd = useCallback((result: DropResult) => { /* ... D&D Logic ... */
        const { source, destination, draggableId: designDraggableId } = result;
        if (source.droppableId !== 'designs' || !destination || destination.droppableId !== 'now' ) return;
        const visualIndex = destination.index;
        const paginatedNowEmails = getPaginatedCampaignEmails('now');
        const canBulkMoveNow = CAMPAIGN_COLUMNS_METADATA.now.supportsPagination && paginatedNowEmails.length > 0;
        const itemIndex = visualIndex - (canBulkMoveNow ? 1 : 0);
        if (itemIndex < 0 || itemIndex >= paginatedNowEmails.length) { console.warn("Assign drop index out of bounds", itemIndex); return; }
        const targetEmail = paginatedNowEmails[itemIndex];
        const designId = parseInt(designDraggableId.replace('design-', ''), 10);
        const draggedDesign = designs.find(d => d.id === designId);
        if (draggedDesign && targetEmail) { setAssignments(prev => ({ ...prev, [targetEmail]: draggedDesign })); showNotification(`Assigned '${draggedDesign.name}' to ${targetEmail}`, 'success'); }
        else { console.warn("Could not find design or target email", draggedDesign, targetEmail); }
    }, [campaignEmails.now, designs, campaignPagination.now, getPaginatedCampaignEmails, showNotification]);

  // Save Action (Logic remains the same)
  const saveCampaign = useCallback(() => { /* ... Save Logic ... */
      if (!selectedShop) { showNotification("Please select a shop first.", 'error'); return; }
      const slug = slugify(selectedShop.url);
      setIsSaving(true); setError(null);
      fetch(`/api/campaigns/${slug}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop: slug, ...campaignEmails, assignments }), })
      .then(res => { if (!res.ok) throw new Error(`Save failed: ${res.statusText}`); })
      .then(() => { showNotification('Campaign saved successfully!', 'success'); setError(null); })
      .catch((err) => { console.error("Save campaign error:", err); const eMsg=`Error saving: ${err.message}`; showNotification(eMsg, 'error'); setError(eMsg); })
      .finally(() => { setIsSaving(false); });
  }, [selectedShop, campaignEmails, assignments, slugify, showNotification]);

  // Render Logic for the Editor part (Using HeroUI Components)
  return (
    <div className="mt-6">
        {/* Shop Selector - Use HeroUI Select */}
        <div className="mb-6">
            <Select
                label="Select Shop"
                placeholder="-- Select a Shop --"
                variant="bordered" // Example variant
                selectedKeys={selectedShop ? [selectedShop.url] : []}
                onSelectionChange={(keys) => {
                    // @ts-ignore - Key is Set<string> or similar
                    const newUrl = Array.from(keys)[0] as string | undefined;
                    setSelectedShop(shops.find((s) => s.url === newUrl) ?? null);
                }}
                isDisabled={isSectionLoading || isSaving || shops.length === 0}
                className="max-w-xs" // Control width
                classNames={{ // Ensure bright text in dark mode
                    label: "text-foreground-700 dark:text-foreground-200",
                    value: "text-foreground dark:text-foreground-100",
                }}
            >
                {shops.map((s) => (
                    <SelectItem key={s.url} value={s.url} textValue={s.name}>
                        {/* Ensure item text is bright */}
                        <span className="text-foreground dark:text-foreground-100">{s.name}</span>
                    </SelectItem>
                ))}
            </Select>
        </div>

       {/* Notification Area - Consider HeroUI Modal or external toast library */}
       {notification && ( <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white dark:text-gray-900 text-sm z-50 ${notification.type === 'success' ? 'bg-green-500 dark:bg-green-400' : 'bg-red-600 dark:bg-red-500'}`}> {notification.message} </div> )}

       {/* Error Display - Consider HeroUI Alert component if available */}
       {error && ( <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4" role="alert"> Error: {error} </div> )}

        {/* Placeholder */}
        {!selectedShop && !isSectionLoading && (
            <Card className="text-center mt-10 p-8"> {/* Use Card */}
                <CardBody className="text-foreground-400 dark:text-foreground-300">
                     {shops.length > 0 ? "Please select a shop from the dropdown above to start." : "No shops loaded."}
                </CardBody>
            </Card>
        )}

        {selectedShop && (
            <>
                {/* === Email Assignment Section === */}
                <section className="relative">
                    <h2 className="text-xl font-semibold text-foreground-700 dark:text-foreground-100 mb-4">Assign Customer Emails</h2>
                    {isSectionLoading ? (
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${ALL_CAMPAIGN_COLUMN_IDS.length + 1} gap-4`}>
                            <SkeletonColumn /> {ALL_CAMPAIGN_COLUMN_IDS.map(id => <SkeletonColumn key={id} />)}
                        </div>
                    ) : (
                        <DragDropContext onDragEnd={onEmailDragEnd}>
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${ALL_CAMPAIGN_COLUMN_IDS.length + 1} gap-4`}>
                                {/* Pool Column - Use HeroUI Card */}
                                <Droppable droppableId="pool">
                                    {(provided, snapshot) => (
                                        <Card
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`p-0 flex flex-col min-h-[300px] border ${snapshot.isDraggingOver ? 'border-primary' : 'border-divider'} ${snapshot.isDraggingOver ? POOL_COLUMN_METADATA.pool.hoverBgColor : 'bg-content1'}`} // Use Card classes, adjust padding
                                        >
                                          <CardHeader className="flex justify-between items-center p-4 border-b border-divider">
                                              <h3 className="font-semibold text-foreground-700 dark:text-foreground-200"> {POOL_COLUMN_METADATA.pool.name} ({poolCount}/{allEmailsRaw.length}) </h3>
                                              {/* Use HeroUI Button */}
                                              <Button size="sm" variant="light" color="primary" onPress={() => { setShowPoolEmails(!showPoolEmails); if (showPoolEmails) setPoolCurrentPage(1); }} isDisabled={allEmailsRaw.length === 0 || isSaving}> {showPoolEmails ? 'Hide' : 'Show'} </Button>
                                          </CardHeader>
                                          {/* CardBody handles scrolling */}
                                          <CardBody className="flex-grow overflow-y-auto space-y-1 p-2">
                                            {showPoolEmails && paginatedPoolEmails.map((email, index) => (
                                                <Draggable key={email} draggableId={email} index={index}>
                                                    {(dragProvided, dragSnapshot) => (
                                                        // Draggable Item Styling (Keep custom for fine control)
                                                        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                                                            className={`p-2 border rounded text-sm cursor-grab text-foreground-800 dark:text-foreground-100 ${ dragSnapshot.isDragging
                                                                ? 'bg-blue-100 dark:bg-blue-800/50 shadow-md ring-1 ring-blue-300 dark:ring-blue-600'
                                                                : 'bg-content2 border-divider hover:bg-gray-100 dark:hover:bg-gray-700/50' }`}
                                                            style={{...dragProvided.draggableProps.style}}>
                                                            {email} <SuggestionBadge suggestion={getSuggestionForEmail(email)} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {/* Placeholder Texts */}
                                            {!showPoolEmails && poolCount > 0 && ( <p className="text-center text-foreground-500 dark:text-foreground-400 text-xs mt-4 p-4 bg-content2 rounded">Click 'Show' to view/drag.</p> )}
                                            {!showPoolEmails && poolCount === 0 && allEmailsRaw.length > 0 && (<p className="text-center text-foreground-500 dark:text-foreground-400 text-xs mt-4">All customers assigned.</p>)}
                                            {showPoolEmails && poolEmails.length === 0 && allEmailsRaw.length > 0 && (<p className="text-center text-foreground-500 dark:text-foreground-400 text-xs mt-4">All customers assigned.</p>)}
                                            {allEmailsRaw.length === 0 && !isSectionLoading && (<p className="text-center text-foreground-500 dark:text-foreground-400 text-xs mt-4">No customers found.</p>)}
                                            {provided.placeholder}
                                          </CardBody>
                                          {/* Pagination Buttons - Use HeroUI Buttons */}
                                          {showPoolEmails && poolTotalPages > 1 && (
                                              <CardFooter className="flex justify-between items-center pt-3 border-t border-divider text-xs text-foreground-500 dark:text-foreground-400">
                                                  <Button size="sm" variant="bordered" onPress={() => setPoolCurrentPage(p => Math.max(p - 1, 1))} isDisabled={poolCurrentPage === 1 || isSaving}> Prev </Button>
                                                  <span> Page {poolCurrentPage} of {poolTotalPages} </span>
                                                  <Button size="sm" variant="bordered" onPress={() => setPoolCurrentPage(p => Math.min(p + 1, poolTotalPages))} isDisabled={poolCurrentPage === poolTotalPages || isSaving}> Next </Button>
                                              </CardFooter>
                                         )}
                                        </Card>
                                    )}
                                </Droppable>
                                {/* Campaign Columns - Use HeroUI Card */}
                                {ALL_CAMPAIGN_COLUMN_IDS.map((colId) => {
                                    const metadata = CAMPAIGN_COLUMNS_METADATA[colId]; const emailsInColumn = campaignEmails[colId]; const columnEmailCount = emailsInColumn.length; const paginatedEmails = getPaginatedCampaignEmails(colId); const totalPages = getCampaignColumnTotalPages(colId); const currentPage = campaignPagination[colId]; const canBulkMove = metadata.supportsPagination && paginatedEmails.length > 0;
                                    return (
                                        <Droppable key={colId} droppableId={colId}>
                                          {(provided, snapshot) => (
                                            <Card
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`p-0 flex flex-col min-h-[300px] border ${snapshot.isDraggingOver ? 'border-primary' : 'border-divider'} ${snapshot.isDraggingOver ? CAMPAIGN_COLUMNS_METADATA[colId]?.hoverBgColor : 'bg-content1'}`} // Use Card classes
                                            >
                                              <CardHeader className="p-4 border-b border-divider">
                                                  <h3 className="font-semibold text-foreground-700 dark:text-foreground-200"> {metadata.name} ({columnEmailCount}) </h3>
                                              </CardHeader>
                                              {/* Bulk Move Draggable - Styling remains custom */}
                                              {canBulkMove && (
                                                  <div className="p-2"> {/* Add padding around bulk move */}
                                                      <Draggable draggableId={`${BULK_MOVE_DRAGGABLE_PREFIX}${colId}`} index={0}>
                                                          {(dragProvided, dragSnapshot) => (
                                                              <div
                                                                  ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                                                                  title={`Drag to move these ${paginatedEmails.length} emails`}
                                                                  className={`p-1.5 border rounded text-center text-xs cursor-grab text-foreground-700 dark:text-foreground-200 ${dragSnapshot.isDragging ? 'bg-indigo-100 dark:bg-indigo-800/50 shadow-md ring-1 ring-indigo-300 dark:ring-indigo-600' : 'bg-content2 border-divider hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                                                  style={{...dragProvided.draggableProps.style}}
                                                              >
                                                                  Move All Visible ({paginatedEmails.length})
                                                              </div>
                                                          )}
                                                      </Draggable>
                                                  </div>
                                              )}
                                              {/* List */}
                                              <CardBody className="flex-grow overflow-y-auto space-y-1 p-2">
                                                {paginatedEmails.map((email, index) => (
                                                    <Draggable key={email} draggableId={email} index={index + (canBulkMove ? 1 : 0)}>
                                                        {(dragProvided, dragSnapshot) => (
                                                            // Draggable Item Styling (Keep custom)
                                                            <div
                                                                ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                                                                className={`p-2 border rounded text-sm cursor-grab text-foreground-800 dark:text-foreground-100 ${ dragSnapshot.isDragging ? `${CAMPAIGN_COLUMNS_METADATA[colId]?.bgColor.replace('bg-','bg-')}-100 dark:${CAMPAIGN_COLUMNS_METADATA[colId]?.hoverBgColor} shadow-md ring-1 ${CAMPAIGN_COLUMNS_METADATA[colId]?.borderColor.replace('border-','ring-')}` : 'bg-content2 border-divider hover:bg-gray-100 dark:hover:bg-gray-700/50' }`}
                                                                style={{...dragProvided.draggableProps.style}}
                                                            >
                                                                <div className="flex justify-between items-center flex-wrap gap-1">
                                                                    <span className="truncate" title={email}>{email}</span>
                                                                    <div className="flex items-center flex-shrink-0">
                                                                        {/* Design Assignment Badge - Use Chip */}
                                                                        {metadata.supportsDesignAssignment && assignments[email] && (
                                                                            <Chip size="sm" color="primary" variant="flat" className="mr-1">
                                                                                {assignments[email]?.name}
                                                                            </Chip>
                                                                        )}
                                                                        <SuggestionBadge suggestion={getSuggestionForEmail(email)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {columnEmailCount === 0 && (<p className="text-center text-foreground-500 dark:text-foreground-400 text-xs mt-4">Drag emails here.</p>)}
                                                {provided.placeholder}
                                              </CardBody>
                                              {/* Pagination - Use HeroUI Buttons */}
                                              {metadata.supportsPagination && totalPages > 1 && (
                                                  <CardFooter className="flex justify-between items-center pt-3 border-t border-divider text-xs text-foreground-500 dark:text-foreground-400">
                                                      <Button size="sm" variant="bordered" onPress={() => setCampaignPagination(p => ({ ...p, [colId]: Math.max(p[colId] - 1, 1) }))} isDisabled={currentPage === 1 || isSaving}> Prev </Button>
                                                      <span> Page {currentPage} of {totalPages} </span>
                                                      <Button size="sm" variant="bordered" onPress={() => setCampaignPagination(p => ({ ...p, [colId]: Math.min(p[colId] + 1, totalPages) }))} isDisabled={currentPage === totalPages || isSaving}> Next </Button>
                                                  </CardFooter>
                                              )}
                                            </Card>
                                          )}
                                        </Droppable>
                                    );
                                })}
                            </div>
                        </DragDropContext>
                    )}
                </section>

                {/* === Design Assignment Section === */}
                <section className={`mt-8 ${isSectionLoading || isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-xl font-semibold text-foreground-700 dark:text-foreground-100 mb-4">Assign Designs</h2>
                    <p className="text-sm text-foreground-600 dark:text-foreground-300 mb-3">Drag a design and drop it onto an email in the 'Send Now' column.</p>
                    <DragDropContext onDragEnd={onAssignDragEnd}>
                        <Droppable droppableId="designs" direction="horizontal">
                            {(provided, snapshot) => (
                               // Use Card for design pool container
                               <Card ref={provided.innerRef} {...provided.droppableProps}
                                    className={`p-3 min-h-[60px] border ${snapshot.isDraggingOver ? 'border-primary bg-primary/10 dark:bg-primary/20' : 'bg-content2 border-divider'}`}
                               >
                                   <CardBody className="flex flex-row gap-2 overflow-x-auto">
                                     {designs.length > 0 ? designs.map((design, index) => (
                                         <Draggable key={design.id} draggableId={`design-${design.id}`} index={index}>
                                             {(dragProvided, dragSnapshot) => (
                                                 // Use Chip for draggable designs
                                                 <Chip
                                                     ref={dragProvided.innerRef}
                                                     {...dragProvided.draggableProps}
                                                     {...dragProvided.dragHandleProps}
                                                     color="secondary" // Example color
                                                     variant="solid" // Solid looks distinct
                                                     size="lg" // Make them a bit larger
                                                     className={`shadow-sm cursor-grab flex-shrink-0 ${dragSnapshot.isDragging ? 'ring-2 ring-secondary ring-offset-2 dark:ring-offset-background' : ''}`}
                                                     style={{...dragProvided.draggableProps.style}}
                                                 >
                                                     {design.name}
                                                 </Chip>
                                             )}
                                        </Draggable>
                                     )) : ( <p className="text-foreground-500 dark:text-foreground-400 text-sm">No designs available.</p> )}
                                     {provided.placeholder}
                                   </CardBody>
                               </Card>
                            )}
                        </Droppable>
                    </DragDropContext>
                </section>

                {/* === Save Action - Use HeroUI Button === */}
                <div className="mt-8 pt-6 border-t border-divider text-right">
                    <Button
                        color="success" // Use success color
                        variant="solid" // Solid stands out
                        onPress={saveCampaign}
                        isDisabled={isSectionLoading || isSaving || !selectedShop}
                        isLoading={isSaving} // Show loading spinner
                        className="min-w-[120px]" // Ensure minimum width
                    >
                        {isSaving ? 'Saving...' : 'Save Campaign'}
                    </Button>
                </div>
            </>
        )}
    </div>
  );
}


// --- Main Page Component (Wrapper) - Use HeroUI Components ---

export default function CampaignManagerPage() {
    // State for the Fast Settings Panel
    const [autoSendEnabled, setAutoSendEnabled] = useState(false);
    const [autoCouponEnabled, setAutoCouponEnabled] = useState(false);

    return (
        // Apply dark theme classes to the main container
        <main className="p-4 md:p-6 lg:p-8 space-y-6 font-sans bg-background text-foreground min-h-screen relative dark">
            {/* Main Title */}
            <h1 className="text-3xl font-bold text-foreground dark:text-foreground-100 border-b border-divider pb-3 mb-6">
                Advanced Campaign Manager
            </h1>

            {/* Info Panels Section - Use HeroUI Cards */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Badge Legend Panel */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-foreground-700 dark:text-foreground-200">Badge Legend</h3>
                    </CardHeader>
                    <CardBody className="space-y-2 pt-0">
                        {Object.values(SUGGESTION_METADATA)
                            .filter(meta => meta.type !== 'none')
                            .map(meta => (
                                <div key={meta.type} className="flex items-start text-sm">
                                    <SuggestionBadge suggestion={meta} />
                                    <span className="ml-2 text-foreground-600 dark:text-foreground-300">- {meta.description}</span>
                                </div>
                         ))}
                    </CardBody>
                </Card>

                {/* Fast Settings Panel - Use HeroUI Card & Switch */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-foreground-700 dark:text-foreground-200">Fast Settings</h3>
                    </CardHeader>
                    <CardBody className="space-y-4 pt-0">
                        <Switch // Use HeroUI Switch
                            isSelected={autoSendEnabled}
                            onValueChange={setAutoSendEnabled}
                            isDisabled={true} // Still disabled as example
                            size="sm" // Consistent size
                            color="primary" // Example color
                        >
                            <span className="text-sm text-foreground-700 dark:text-foreground-200">Auto-send based on triggers</span>
                        </Switch>
                        <Switch // Use HeroUI Switch
                            isSelected={autoCouponEnabled}
                            onValueChange={setAutoCouponEnabled}
                            isDisabled={true} // Still disabled as example
                            size="sm"
                            color="primary"
                        >
                             <span className="text-sm text-foreground-700 dark:text-foreground-200">Auto-generate coupons</span>
                        </Switch>
                         <p className="text-xs text-foreground-500 dark:text-foreground-400 italic pt-2">(Note: Automation requires backend setup)</p>
                    </CardBody>
                </Card>
            </section>

            {/* Render the Core Campaign Editor */}
            <CampaignEditor />

        </main>
    );
}
