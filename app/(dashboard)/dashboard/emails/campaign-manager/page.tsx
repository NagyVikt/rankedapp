'use client' // Necessary for client-side hooks (useState, useEffect)

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DroppableProvided,
  DraggableStateSnapshot, // Import snapshot type
  DroppableStateSnapshot
} from '@hello-pangea/dnd' // Using the maintained fork

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
type EmailSuggestion = { text: string; type: SuggestionType; badgeColor: string; description: string; icon: string; };

// --- Constants ---

const POOL_PAGE_SIZE = 20;
const CAMPAIGN_PAGE_SIZE = 20;

const CAMPAIGN_COLUMNS_METADATA: Record<CampaignColumnId, { name: string; bgColor: string; borderColor: string; supportsDesignAssignment: boolean; supportsPagination: boolean }> = {
    now:           { name: 'Send Now',           bgColor: 'bg-green-50',  borderColor: 'border-green-300', supportsDesignAssignment: true,  supportsPagination: true },
    weekly:        { name: 'Scheduled Weekly',   bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300',supportsDesignAssignment: false, supportsPagination: false },
    abandonedCart: { name: 'Abandoned Cart',     bgColor: 'bg-orange-50', borderColor: 'border-orange-300',supportsDesignAssignment: false, supportsPagination: false },
    loyaltyReward: { name: 'Loyalty Reward',     bgColor: 'bg-purple-50', borderColor: 'border-purple-300',supportsDesignAssignment: false, supportsPagination: false },
};
const ALL_CAMPAIGN_COLUMN_IDS = Object.keys(CAMPAIGN_COLUMNS_METADATA) as CampaignColumnId[];

const POOL_COLUMN_METADATA = {
    pool: { name: 'All Customers', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' }
}

const BULK_MOVE_DRAGGABLE_PREFIX = 'bulk-move-';

const SUGGESTION_METADATA: Record<SuggestionType, EmailSuggestion> = {
    coupon:    { text: 'Send Coupon',    type: 'coupon',    badgeColor: 'bg-yellow-100 text-yellow-800', description: 'Customer might respond well to a discount offer.', icon: '🏷️' },
    loyalty:   { text: 'Loyalty Offer',  type: 'loyalty',   badgeColor: 'bg-purple-100 text-purple-800', description: 'Recognize a returning or high-value customer.', icon: '⭐' },
    abandoned: { text: 'Abandoned Cart', type: 'abandoned', badgeColor: 'bg-orange-100 text-orange-800', description: 'Customer added items to cart but did not complete purchase.', icon: '🛒' },
    welcome:   { text: 'Welcome Email',  type: 'welcome',   badgeColor: 'bg-blue-100 text-blue-800',    description: 'New customer or recent signup.', icon: '👋' },
    none:      { text: '',               type: 'none',      badgeColor: '',                              description: '', icon: '' },
};


// --- Helper Components ---

const SkeletonColumn = () => (
  <div className="border rounded-lg p-4 flex flex-col bg-white border-gray-200 animate-pulse" style={{ minHeight: '300px' }}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200"><div className="h-4 bg-gray-300 rounded w-3/4"></div><div className="h-4 bg-gray-300 rounded w-1/4"></div></div>
      <div className="flex-grow space-y-2 mt-2"><div className="h-8 bg-gray-300 rounded"></div><div className="h-8 bg-gray-300 rounded"></div><div className="h-8 bg-gray-300 rounded w-5/6"></div><div className="h-8 bg-gray-300 rounded w-4/6"></div><div className="h-8 bg-gray-300 rounded"></div></div>
      <div className="flex justify-between items-center pt-3 mt-4 border-t border-gray-200"><div className="h-6 bg-gray-300 rounded w-1/4"></div><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-6 bg-gray-300 rounded w-1/4"></div></div>
  </div>
);

const SuggestionBadge: React.FC<{ suggestion: EmailSuggestion }> = ({ suggestion }) => {
    if (suggestion.type === 'none') return null;
    return ( <span className={`ml-2 text-xs px-1.5 py-0.5 ${suggestion.badgeColor} rounded-full font-medium whitespace-nowrap`} title={suggestion.description}> {suggestion.icon} {suggestion.text} </span> );
};

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }> = ({ label, enabled, onChange, disabled = false }) => (
    <label className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
            <div className={`block w-10 h-6 rounded-full transition ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${enabled ? 'translate-x-4' : ''}`}></div>
        </div>
        <div className={`ml-3 text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</div>
    </label>
);


// --- Core Campaign Editor Component ---

function CampaignEditor() {
  // State Management
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

  // Helper Functions
  const slugify = useCallback((url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(), []);
  const showNotification = useCallback((message: string, type: 'success' | 'error') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); }, []);
  const getSuggestionForEmail = useCallback((email: string): EmailSuggestion => {
      let hash = 0; for (let i = 0; i < email.length; i++) { hash = email.charCodeAt(i) + ((hash << 5) - hash); }
      const typeIndex = Math.abs(hash) % 5;
      return SUGGESTION_METADATA[Object.keys(SUGGESTION_METADATA)[typeIndex] as SuggestionType] || SUGGESTION_METADATA.none;
  }, []);

  // Data Fetching Effects
  useEffect(() => { // Load shops
      const raw = document.cookie.split('; ').find((c) => c.startsWith('my_webshops='))?.split('=')[1] ?? '[]';
      try {
          const list = JSON.parse(decodeURIComponent(raw)) as Shop[];
          if (Array.isArray(list) && list.every(item => typeof item === 'object' && item !== null && 'name' in item && 'url' in item)) {
              setShops(list);
          } else { setError("Invalid shop data."); setShops([]); }
      } catch (err) { setError("Could not load shop list."); setShops([]); }
  }, []);
  useEffect(() => { // Load designs (mock)
      setTimeout(() => { try { setDesigns([ { id: 1, name: 'Welcome Offer' }, { id: 2, name: 'Spring Sale' }, { id: 3, name: 'Loyalty Discount' }, { id: 4, name: 'New Arrivals' }, ]); } catch (err) {} }, 500);
  }, []);
  useEffect(() => { // Fetch campaign/emails when selectedShop changes
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
        if (fetchError) { setError(`Data load failed for ${selectedShop.name}: ${errorMessages.join(' ')}`); } else { setError(null); } // Include shop name in error
    }).finally(() => { setIsSectionLoading(false); });
  }, [selectedShop, slugify]);

  // Derived State
  const assignedEmails = useMemo(() => {
      const emailSet = new Set<string>();
      Object.values(campaignEmails).forEach(list => { list.forEach(email => emailSet.add(email)); });
      return emailSet;
   }, [campaignEmails]);

  const poolEmails = useMemo(() => allEmailsRaw.filter(email => !assignedEmails.has(email)), [allEmailsRaw, assignedEmails]);
  const poolTotalPages = Math.ceil(poolEmails.length / POOL_PAGE_SIZE);
  const poolStartIndex = (poolCurrentPage - 1) * POOL_PAGE_SIZE;
  const poolEndIndex = poolStartIndex + POOL_PAGE_SIZE;
  const paginatedPoolEmails = useMemo(() => poolEmails.slice(poolStartIndex, poolEndIndex), [poolEmails, poolStartIndex, poolEndIndex]);

  const getPaginatedCampaignEmails = useCallback((columnId: CampaignColumnId): string[] => {
      const emails = campaignEmails[columnId];
      if (!CAMPAIGN_COLUMNS_METADATA[columnId]?.supportsPagination) { return emails; }
      const currentPage = campaignPagination[columnId];
      const startIndex = (currentPage - 1) * CAMPAIGN_PAGE_SIZE;
      const endIndex = startIndex + CAMPAIGN_PAGE_SIZE;
      return emails.slice(startIndex, endIndex);
  }, [campaignEmails, campaignPagination]);

  const getCampaignColumnTotalPages = useCallback((columnId: CampaignColumnId): number => {
      if (!CAMPAIGN_COLUMNS_METADATA[columnId]?.supportsPagination) return 1;
      return Math.ceil(campaignEmails[columnId].length / CAMPAIGN_PAGE_SIZE);
  }, [campaignEmails]);

  const poolCount = poolEmails.length;
  const getCampaignColumnCount = useCallback((columnId: CampaignColumnId) => campaignEmails[columnId].length, [campaignEmails]);

  // Drag & Drop Handlers
  const onEmailDragEnd = useCallback((result: DropResult) => {
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
              const page = campaignPagination[colId as CampaignColumnId];
              const paginatedList = getPaginatedCampaignEmails(colId as CampaignColumnId);
              // Adjust visualIndex if bulk move button is present
              const itemIndex = visualIndex - (paginatedList.length > 0 && CAMPAIGN_COLUMNS_METADATA[colId as CampaignColumnId].supportsPagination ? 1 : 0);
              const emailToFind = paginatedList[itemIndex];
              return campaignEmails[colId as CampaignColumnId].findIndex(e => e === emailToFind);
          }
          return visualIndex;
      };
       const findInsertionIndex = (colId: DroppableColumnId, visualIndex: number): number => {
           // Adjust visualIndex if bulk move button is present in the destination
           const destMetadata = CAMPAIGN_COLUMNS_METADATA[colId as CampaignColumnId];
           const destPaginatedEmails = getPaginatedCampaignEmails(colId as CampaignColumnId);
           const canBulkMoveDest = destMetadata?.supportsPagination && destPaginatedEmails.length > 0;
           return visualIndex - (canBulkMoveDest ? 1 : 0); // Use adjusted index for splice
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
              const actualDestIndex = findInsertionIndex(destColId, destination.index); // Use calculated insertion index
              if (!destList.includes(emailToMove)) {
                   // Ensure index is within bounds for splice
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

  const onAssignDragEnd = useCallback((result: DropResult) => {
      const { source, destination, draggableId: designDraggableId } = result;
      if (source.droppableId !== 'designs' || !destination || destination.droppableId !== 'now' ) return;
      const visualIndex = destination.index;
      const paginatedNowEmails = getPaginatedCampaignEmails('now');
      const canBulkMoveNow = CAMPAIGN_COLUMNS_METADATA.now.supportsPagination && paginatedNowEmails.length > 0;
      const itemIndex = visualIndex - (canBulkMoveNow ? 1 : 0); // Adjust index if bulk move is present
      if (itemIndex < 0 || itemIndex >= paginatedNowEmails.length) { console.warn("Assign drop index out of bounds", itemIndex); return; }
      const targetEmail = paginatedNowEmails[itemIndex];
      const designId = parseInt(designDraggableId.replace('design-', ''), 10);
      const draggedDesign = designs.find(d => d.id === designId);
      if (draggedDesign && targetEmail) { setAssignments(prev => ({ ...prev, [targetEmail]: draggedDesign })); showNotification(`Assigned '${draggedDesign.name}' to ${targetEmail}`, 'success'); }
      else { console.warn("Could not find design or target email", draggedDesign, targetEmail); }
  }, [campaignEmails.now, designs, campaignPagination.now, getPaginatedCampaignEmails, showNotification]);

  // Save Action
  const saveCampaign = useCallback(() => {
      if (!selectedShop) { showNotification("Please select a shop first.", 'error'); return; }
      const slug = slugify(selectedShop.url);
      setIsSaving(true); setError(null);
      fetch(`/api/campaigns/${slug}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop: slug, ...campaignEmails, assignments }), })
      .then(res => { if (!res.ok) throw new Error(`Save failed: ${res.statusText}`); })
      .then(() => { showNotification('Campaign saved successfully!', 'success'); setError(null); })
      .catch((err) => { console.error("Save campaign error:", err); const eMsg=`Error saving: ${err.message}`; showNotification(eMsg, 'error'); setError(eMsg); })
      .finally(() => { setIsSaving(false); });
  }, [selectedShop, campaignEmails, assignments, slugify, showNotification]);

  // Render Logic for the Editor part
  return (
    <div className="mt-6">
        {/* Shop Selector */}
        <div className="mb-6">
            <label htmlFor="shop-select-editor" className="block text-sm font-medium text-gray-700 mb-1">Select Shop</label>
            <select
                id="shop-select-editor"
                className="block w-full sm:w-64 border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={selectedShop?.url ?? ''}
                onChange={(e) => { const newUrl = e.target.value; setSelectedShop(shops.find((s) => s.url === newUrl) ?? null); }}
                disabled={isSectionLoading || isSaving || shops.length === 0}
            >
                <option value="" disabled={!!selectedShop}>-- Select a Shop --</option>
                {shops.map((s) => ( <option key={s.url} value={s.url}>{s.name}</option> ))}
            </select>
        </div>

       {/* Notification Area */}
       {notification && ( <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white text-sm z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}> {notification.message} </div> )}

       {/* Error Display */}
       {error && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"> Error: {error} </div> )}

        {/* Show placeholder or editor content */}
        {!selectedShop && !isSectionLoading && (
            <div className="text-center text-gray-500 mt-10 border rounded-lg p-8 bg-white shadow-sm">
                {shops.length > 0 ? "Please select a shop from the dropdown above to start." : "No shops loaded."}
            </div>
        )}

        {selectedShop && (
            <>
                {/* === Email Assignment Section === */}
                <section className="relative">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Assign Customer Emails</h2>
                    {isSectionLoading ? (
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${ALL_CAMPAIGN_COLUMN_IDS.length + 1} gap-4`}>
                            <SkeletonColumn /> {ALL_CAMPAIGN_COLUMN_IDS.map(id => <SkeletonColumn key={id} />)}
                        </div>
                    ) : (
                        <DragDropContext onDragEnd={onEmailDragEnd}>
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${ALL_CAMPAIGN_COLUMN_IDS.length + 1} gap-4`}>
                                {/* Pool Column */}
                                <Droppable droppableId="pool">
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className={`border rounded-lg p-4 flex flex-col ${snapshot.isDraggingOver ? POOL_COLUMN_METADATA.pool.bgColor : 'bg-white'} border-gray-200`} style={{ minHeight: '300px' }}>
                                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200"> <h3 className="font-semibold text-gray-700"> {POOL_COLUMN_METADATA.pool.name} ({poolCount}/{allEmailsRaw.length}) </h3> <button onClick={() => { setShowPoolEmails(!showPoolEmails); if (showPoolEmails) setPoolCurrentPage(1); }} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled={allEmailsRaw.length === 0 || isSaving}> {showPoolEmails ? 'Hide' : 'Show'} </button> </div>
                                          <div className="flex-grow overflow-y-auto space-y-1 pr-1" style={{ maxHeight: '400px' }}>
                                            {showPoolEmails && paginatedPoolEmails.map((email, index) => (
                                                <Draggable key={email} draggableId={email} index={index}>
                                                    {(dragProvided, dragSnapshot) => ( <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} className={`p-2 border rounded text-sm cursor-grab ${ dragSnapshot.isDragging ? 'bg-blue-100 shadow-md ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100' }`} style={{...dragProvided.draggableProps.style}}> {email} <SuggestionBadge suggestion={getSuggestionForEmail(email)} /> </div> )}
                                                </Draggable>
                                            ))}
                                            {!showPoolEmails && poolCount > 0 && ( <p className="text-center text-gray-500 text-xs mt-4 p-4 bg-gray-50 rounded">Click 'Show' to view/drag.</p> )}
                                            {!showPoolEmails && poolCount === 0 && allEmailsRaw.length > 0 && (<p className="text-center text-gray-500 text-xs mt-4">All customers assigned.</p>)}
                                            {showPoolEmails && poolEmails.length === 0 && allEmailsRaw.length > 0 && (<p className="text-center text-gray-500 text-xs mt-4">All customers assigned.</p>)}
                                            {allEmailsRaw.length === 0 && !isSectionLoading && (<p className="text-center text-gray-500 text-xs mt-4">No customers found.</p>)}
                                            {provided.placeholder}
                                          </div>
                                          {showPoolEmails && poolTotalPages > 1 && ( <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200 text-xs"> <button onClick={() => setPoolCurrentPage(p => Math.max(p - 1, 1))} disabled={poolCurrentPage === 1 || isSaving} className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"> Prev </button> <span> Page {poolCurrentPage} of {poolTotalPages} </span> <button onClick={() => setPoolCurrentPage(p => Math.min(p + 1, poolTotalPages))} disabled={poolCurrentPage === poolTotalPages || isSaving} className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"> Next </button> </div> )}
                                        </div>
                                    )}
                                </Droppable>
                                {/* Campaign Columns */}
                                {ALL_CAMPAIGN_COLUMN_IDS.map((colId) => {
                                    const metadata = CAMPAIGN_COLUMNS_METADATA[colId]; const emailsInColumn = campaignEmails[colId]; const columnEmailCount = emailsInColumn.length; const paginatedEmails = getPaginatedCampaignEmails(colId); const totalPages = getCampaignColumnTotalPages(colId); const currentPage = campaignPagination[colId]; const canBulkMove = metadata.supportsPagination && paginatedEmails.length > 0;
                                    return (
                                        <Droppable key={colId} droppableId={colId}>
                                          {(provided, snapshot) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className={`border rounded-lg p-4 flex flex-col ${snapshot.isDraggingOver ? metadata.bgColor : 'bg-white'} border-gray-200`} style={{ minHeight: '300px' }}>
                                              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200"> <h3 className="font-semibold text-gray-700"> {metadata.name} ({columnEmailCount}) </h3> </div>
                                              {/* ** FIXED ** Bulk Move Draggable */}
                                              {canBulkMove && (
                                                  <Draggable draggableId={`${BULK_MOVE_DRAGGABLE_PREFIX}${colId}`} index={0}>
                                                      {(dragProvided, dragSnapshot) => ( // Pass args
                                                          <div
                                                              ref={dragProvided.innerRef}
                                                              {...dragProvided.draggableProps}
                                                              {...dragProvided.dragHandleProps}
                                                              title={`Drag to move these ${paginatedEmails.length} emails`}
                                                              className={`mb-2 p-1.5 border rounded text-center text-xs cursor-grab ${dragSnapshot.isDragging ? 'bg-indigo-100 shadow-md ring-1 ring-indigo-300' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
                                                              style={{...dragProvided.draggableProps.style}}
                                                          >
                                                              Move All Visible ({paginatedEmails.length})
                                                          </div>
                                                      )}
                                                  </Draggable>
                                              )}
                                              {/* List */}
                                              <div className="flex-grow overflow-y-auto space-y-1 pr-1" style={{ maxHeight: '400px' }}>
                                                {paginatedEmails.map((email, index) => (
                                                    // Offset index by 1 if bulk move button is present
                                                    <Draggable key={email} draggableId={email} index={index + (canBulkMove ? 1 : 0)}>
                                                        {(dragProvided, dragSnapshot) => ( // Pass args
                                                            <div
                                                                ref={dragProvided.innerRef}
                                                                {...dragProvided.draggableProps}
                                                                {...dragProvided.dragHandleProps}
                                                                className={`p-2 border rounded text-sm cursor-grab ${ dragSnapshot.isDragging ? `${metadata.bgColor.replace('bg-','bg-')}-100 shadow-md ring-1 ${metadata.borderColor.replace('border-','ring-')}` : 'bg-gray-50 border-gray-200 hover:bg-gray-100' }`}
                                                                style={{...dragProvided.draggableProps.style}}
                                                            >
                                                                <div className="flex justify-between items-center flex-wrap gap-1">
                                                                    <span className="truncate" title={email}>{email}</span>
                                                                    <div className="flex items-center flex-shrink-0">
                                                                        {metadata.supportsDesignAssignment && assignments[email] && ( <span className="mr-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium"> {assignments[email]?.name} </span> )}
                                                                        <SuggestionBadge suggestion={getSuggestionForEmail(email)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {columnEmailCount === 0 && (<p className="text-center text-gray-500 text-xs mt-4">Drag emails here.</p>)}
                                                {provided.placeholder}
                                              </div>
                                              {/* Pagination */}
                                              {metadata.supportsPagination && totalPages > 1 && (
                                                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200 text-xs">
                                                      <button onClick={() => setCampaignPagination(p => ({ ...p, [colId]: Math.max(p[colId] - 1, 1) }))} disabled={currentPage === 1 || isSaving} className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"> Prev </button>
                                                      <span> Page {currentPage} of {totalPages} </span>
                                                      <button onClick={() => setCampaignPagination(p => ({ ...p, [colId]: Math.min(p[colId] + 1, totalPages) }))} disabled={currentPage === totalPages || isSaving} className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"> Next </button>
                                                  </div>
                                              )}
                                            </div>
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
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Assign Designs</h2>
                    <p className="text-sm text-gray-600 mb-3">Drag a design and drop it onto an email in the 'Send Now' column.</p>
                    <DragDropContext onDragEnd={onAssignDragEnd}>
                        <Droppable droppableId="designs" direction="horizontal">
                            {(provided, snapshot) => (
                               <div ref={provided.innerRef} {...provided.droppableProps} className={`flex gap-2 overflow-x-auto p-3 border rounded-lg bg-gray-100 border-gray-200 min-h-[60px] ${snapshot.isDraggingOver ? 'bg-gray-200' : '' }`}>
                                 {designs.length > 0 ? designs.map((design, index) => (
                                     <Draggable key={design.id} draggableId={`design-${design.id}`} index={index}>
                                         {(dragProvided, dragSnapshot) => ( // Pass args
                                             <div
                                                 ref={dragProvided.innerRef}
                                                 {...dragProvided.draggableProps}
                                                 {...dragProvided.dragHandleProps}
                                                 className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm cursor-grab flex-shrink-0 ${ dragSnapshot.isDragging ? 'bg-indigo-200 text-indigo-800 ring-2 ring-indigo-400' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' }`}
                                                 style={{...dragProvided.draggableProps.style}}
                                             >
                                                 {design.name}
                                             </div>
                                         )}
                                    </Draggable>
                                 )) : ( <p className="text-gray-500 text-sm">No designs available.</p> )}
                                 {provided.placeholder}
                               </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </section>

                {/* === Save Action === */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-right">
                    <button onClick={saveCampaign} disabled={isSectionLoading || isSaving || !selectedShop} className="px-6 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]">
                        {isSaving ? ( <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> ) : null}
                        {isSaving ? 'Saving...' : 'Save Campaign'}
                    </button>
                </div>
            </>
        )}
    </div>
  );
}


// --- Main Page Component (Wrapper) ---

export default function CampaignManagerPage() {
    // State for the Fast Settings Panel
    const [autoSendEnabled, setAutoSendEnabled] = useState(false);
    const [autoCouponEnabled, setAutoCouponEnabled] = useState(false);

    return (
        <main className="p-4 md:p-6 lg:p-8 space-y-6 font-sans bg-gray-50 min-h-screen relative">
            {/* Main Title */}
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-3 mb-6">
                Advanced Campaign Manager
            </h1>

            {/* Info Panels Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Badge Legend Panel */}
                <div className="lg:col-span-2 p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Badge Legend</h3>
                    <div className="space-y-2">
                        {Object.values(SUGGESTION_METADATA)
                            .filter(meta => meta.type !== 'none') // Exclude 'none' type
                            .map(meta => (
                                <div key={meta.type} className="flex items-start text-sm">
                                    <SuggestionBadge suggestion={meta} />
                                    <span className="ml-2 text-gray-600">- {meta.description}</span>
                                </div>
                         ))}
                    </div>
                </div>

                {/* Fast Settings Panel */}
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Fast Settings</h3>
                    <div className="space-y-4">
                        <ToggleSwitch
                            label="Auto-send based on triggers"
                            enabled={autoSendEnabled}
                            onChange={setAutoSendEnabled}
                            disabled={true} // Disabled for now as backend logic is needed
                        />
                        <ToggleSwitch
                            label="Auto-generate coupons"
                            enabled={autoCouponEnabled}
                            onChange={setAutoCouponEnabled}
                            disabled={true} // Disabled for now as backend logic is needed
                        />
                         <p className="text-xs text-gray-500 italic mt-2">(Note: Automation requires backend setup)</p>
                    </div>
                </div>
            </section>

            {/* Render the Core Campaign Editor */}
            <CampaignEditor />

        </main>
    );
}
