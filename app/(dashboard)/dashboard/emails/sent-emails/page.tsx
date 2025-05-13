'use client'

import React, { useEffect, useState, useMemo } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Chip,
    Skeleton,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Tooltip,
} from '@heroui/react';
import { Icon } from '@iconify/react';

// --- Suggestion Types and Metadata (as provided) ---
type SuggestionType = 'coupon' | 'loyalty' | 'abandoned' | 'welcome' | 'none' | 'gift'; // Added 'gift' as it was in dummy data

type EmailSuggestion = {
    text: string;
    type: SuggestionType;
    badgeColor: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    description: string;
    icon: string;
};

const SUGGESTION_METADATA: Record<SuggestionType, EmailSuggestion> = {
    coupon:     { text: 'Coupon',    type: 'coupon',    badgeColor: 'warning', description: 'Customer might respond well to a discount offer.', icon: '🏷️' },
    loyalty:    { text: 'Loyalty',  type: 'loyalty',   badgeColor: 'secondary', description: 'Recognize a returning or high-value customer.', icon: '⭐' },
    abandoned: { text: 'Abandoned Cart', type: 'abandoned', badgeColor: 'danger', description: 'Customer added items to cart but did not complete purchase.', icon: '🛒' },
    welcome:   { text: 'Welcome',  type: 'welcome',   badgeColor: 'primary',     description: 'New customer or recent signup.', icon: '👋' },
    gift:      { text: 'Gift', type: 'gift', badgeColor: 'success', description: 'Special gift or offer.', icon: '🎁'},
    none:       { text: '',               type: 'none',      badgeColor: 'default',     description: '', icon: '' },
};


// --- Type Definitions ---
type SentEmailItem = {
    id: string;
    name: string;
    subject: string;
    suggestionType?: SuggestionType;
    designName?: string; // Added designName
    createdDate: string;
    sentCount: number;
    viewedCount: number; // Made non-optional, will ensure it in dummy data
    status?: 'Sent' | 'Draft' | 'Scheduled';
};

// --- Dummy Data Updated ---
const dummySentEmails: SentEmailItem[] = [
    { id: 'email-1', name: 'Pay 2, Get 3 Offer', subject: 'Pay 2, Get 3 Product PROMOTION!', suggestionType: 'coupon', designName: 'Summer Sale Template', createdDate: '2023-09-09', sentCount: 4688, viewedCount: 1200, status: 'Sent' },
    { id: 'email-2', name: 'Spring Planting 2025', subject: 'What will you plant this spring? Order our quality products in time!', suggestionType: 'none', designName: 'Green Thumb Seasonal', createdDate: '2025-01-28', sentCount: 19022, viewedCount: 5670, status: 'Sent' },
    { id: 'email-3', name: 'Welcome New Subscriber!', subject: 'Welcome to the Family! Here is your 10% Off Coupon!', suggestionType: 'welcome', designName: 'New Subscriber Welcome', createdDate: '2025-01-30', sentCount: 19015, viewedCount: 4500, status: 'Sent' },
    { id: 'email-4', name: 'Free Potting Soil', subject: 'Free Potting Soil with Every Order! Only for 3 days!', suggestionType: 'coupon', designName: 'Weekend Promo Special', createdDate: '2025-01-27', sentCount: 18294, viewedCount: 7800, status: 'Sent' },
    { id: 'email-5', name: 'Did you forget something?', subject: 'Your cart is waiting for you! Complete your purchase.', suggestionType: 'abandoned', designName: 'Cart Reminder v1', createdDate: '2025-01-27', sentCount: 18213, viewedCount: 6500, status: 'Sent' },
    { id: 'email-6', name: 'Loyalty Member Exclusive', subject: 'A Special Thank You For Our Loyal Customers!', suggestionType: 'loyalty', designName: 'VIP Customer Template', createdDate: '2025-01-28', sentCount: 18053, viewedCount: 9050, status: 'Sent' },
    { id: 'email-7', name: 'Free Desert Rose Seeds', subject: 'Free DESERT ROSE seeds with every order! Only for 3 days!', suggestionType: 'gift', designName: 'Limited Time Gift Offer', createdDate: '2025-01-28', sentCount: 17917, viewedCount: 9870, status: 'Sent' },
    { id: 'email-8', name: 'Magnolia or Tulip Tree?', subject: 'Magnolia and Tulip Tree. Which one would you plant?', suggestionType: 'none', designName: 'Informative Newsletter', createdDate: '2025-01-28', sentCount: 0, viewedCount: 0, status: 'Draft' },
    { id: 'email-9', name: '$35 Gift Product (Loyalty)', subject: '$35 GIFT product for the 5 fastest customers - Loyalty Special', suggestionType: 'loyalty', designName: 'Contest Winner Announce', createdDate: '2025-03-22', sentCount: 17361, viewedCount: 10200, status: 'Sent' },
    { id: 'email-10', name: 'Choose a Coupon', subject: 'Choose a coupon and use it for a free product!', suggestionType: 'coupon', designName: 'Interactive Coupon Email', createdDate: '2025-03-28', sentCount: 17918, viewedCount: 8800, status: 'Sent' },
    { id: 'email-11', name: 'Berry Bushes Sale', subject: 'Blueberry, Kiwi, Fig - Already fruit-bearing saplings!', suggestionType: 'none', designName: 'Product Spotlight: Berries', createdDate: '2023-02-21', sentCount: 4331, viewedCount: 2100, status: 'Sent' },
    { id: 'email-12', name: 'Your First Welcome Gift!', subject: 'A Special Welcome Gift Just For You!', suggestionType: 'welcome', designName: 'Welcome Series - Email 1', createdDate: '2023-07-25', sentCount: 4404, viewedCount: 1500, status: 'Sent' },
    { id: 'email-13', name: 'Still Thinking It Over?', subject: 'Your items are selling out fast! Don\'t miss out.', suggestionType: 'abandoned', designName: 'Cart Reminder v2 - Urgency', createdDate: '2023-03-18', sentCount: 4555, viewedCount: 3000, status: 'Sent' },
    { id: 'email-14', name: 'Gift Magnolia 2', subject: 'Only 1 week left to get a FREE Magnolia!!!', suggestionType: 'coupon', designName: 'Flash Sale Reminder', createdDate: '2023-03-25', sentCount: 4628, viewedCount: 2300, status: 'Sent' },
    { id: 'email-15', name: 'Gift Magnolia 3', subject: 'BIG SALE incoming! Missed out? Here is a New Opportunity!', suggestionType: 'coupon', designName: 'Last Chance Offer', createdDate: '2023-03-25', sentCount: 4512, viewedCount: 1800, status: 'Sent' },
    { id: 'email-16', name: 'Weekend Flash Sale', subject: 'Weekend Flash Sale - Up to 50% OFF!', suggestionType: 'coupon', designName: 'Weekend Deal Blast', createdDate: '2025-05-09', sentCount: 22050, viewedCount: 11500, status: 'Sent' },
    { id: 'email-17', name: 'New Arrivals Teaser', subject: 'Sneak Peek: Exciting New Products Coming Soon!', suggestionType: 'welcome', designName: 'Coming Soon Teaser', createdDate: '2025-05-10', sentCount: 0, viewedCount: 0, status: 'Scheduled' },
];

const ITEMS_PER_PAGE = 10;

// --- Helper Component for Suggestion Badges ---
const SuggestionBadge: React.FC<{ suggestionType?: SuggestionType }> = ({ suggestionType }) => {
    if (!suggestionType || suggestionType === 'none' || !SUGGESTION_METADATA[suggestionType]) {
      // Handle cases where suggestionType might be 'gift' but not in SUGGESTION_METADATA or is 'none'
      if (suggestionType === 'gift' && SUGGESTION_METADATA['gift']) {
        // Fallback for 'gift' if it was intended but not fully defined elsewhere
         const suggestion = SUGGESTION_METADATA['gift'];
         return (
            <Chip
                size="sm"
                variant="flat"
                color={suggestion.badgeColor}
                className="whitespace-nowrap"
                title={suggestion.description}
                startContent={<span className="mr-1 text-xs">{suggestion.icon}</span>}
            >
                <span className="text-xs">{suggestion.text}</span>
            </Chip>
        );
      }
      return null;
    }
    const suggestion = SUGGESTION_METADATA[suggestionType];
    if (!suggestion.text) return null; // Don't render if text is empty (like for 'none')

    return (
        <Chip
            size="sm"
            variant="flat"
            color={suggestion.badgeColor}
            className="whitespace-nowrap"
            title={suggestion.description}
            startContent={<span className="mr-1 text-xs">{suggestion.icon}</span>}
        >
            <span className="text-xs">{suggestion.text}</span>
        </Chip>
    );
};


// --- Skeleton Component Updated ---
const SentEmailsTableSkeleton: React.FC = () => {
    return (
        <div className="space-y-px">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <div key={i} className="flex items-center p-3 h-[68px] bg-gray-100 dark:bg-neutral-800 rounded-md animate-pulse"> {/* Adjusted height for potentially taller rows */}
                    <div className="w-1/5 h-4 bg-gray-200 dark:bg-neutral-700 rounded mr-3"></div> {/* Name */}
                    <div className="w-1/4 h-4 bg-gray-200 dark:bg-neutral-700 rounded mr-3"></div> {/* Subject */}
                    <div className="w-1/6 h-4 bg-gray-200 dark:bg-neutral-700 rounded mr-3 hidden md:block"></div> {/* Category */}
                    <div className="w-1/6 h-4 bg-gray-200 dark:bg-neutral-700 rounded mr-3 hidden lg:block"></div> {/* Design */}
                    <div className="w-1/6 h-4 bg-gray-200 dark:bg-neutral-700 rounded mr-3 hidden xl:block"></div> {/* Created */}
                    <div className="w-1/5 h-8 bg-gray-200 dark:bg-neutral-700 rounded mr-3"></div> {/* Stats (taller for two lines) */}
                    <div className="w-1/12 h-6 bg-gray-200 dark:bg-neutral-700 rounded"></div> {/* Actions */}
                </div>
            ))}
        </div>
    );
};


// --- Main Page Component ---
export default function SentEmailsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [sentEmails, setSentEmails] = useState<SentEmailItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const processedEmails = dummySentEmails.map(email => ({
                ...email,
                // Ensure viewedCount is a number, defaulting if necessary
                viewedCount: typeof email.viewedCount === 'number' ? email.viewedCount : Math.floor(email.sentCount * (Math.random() * 0.4 + 0.05)), // e.g., 5% to 45% of sent
            }));
            setSentEmails(processedEmails);
            setIsLoading(false);
        }, 1500);
    }, []);

    const filteredEmails = useMemo(() => {
        return sentEmails.filter(email =>
            email.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (email.designName && email.designName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (email.suggestionType && SUGGESTION_METADATA[email.suggestionType]?.text.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [sentEmails, searchTerm]);

    const paginatedEmails = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredEmails.slice(start, end);
    }, [filteredEmails, currentPage]);

    const totalPages = Math.ceil(filteredEmails.length / ITEMS_PER_PAGE);

    const handlePreview = (emailId: string) => {
        console.log(`Preview email: ${emailId}`);
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding: 1rem;';
        modal.innerHTML = `
            <div style="background:white; padding:25px; border-radius:8px; text-align:center; color:black; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 15px;">Preview Email</h3>
                <p style="margin-bottom: 8px;">Previewing email ID: <strong>${emailId}</strong></p>
                <p style="font-size: 0.875rem; color: #555; margin-bottom: 20px;">(Full email preview functionality is not implemented in this demonstration.)</p>
                <button id="closePreviewModal" style="margin-top:10px; padding:10px 20px; background-color:#007bff; color:white; border:none; border-radius:5px; cursor:pointer; font-size: 0.9rem; transition: background-color 0.2s;">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closePreviewModal')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    };
    
    const handleCreateNewEmail = () => {
        console.log("Create new email clicked");
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding: 1rem;';
        modal.innerHTML = `
            <div style="background:white; padding:25px; border-radius:8px; text-align:center; color:black; max-width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 15px;">Create New Email</h3>
                <p style="margin-bottom: 8px;">This action would typically navigate to the email creation page or open a dedicated creation modal.</p>
                <p style="font-size: 0.875rem; color: #555; margin-bottom: 20px;">(Not implemented in this view.)</p>
                <button id="closeCreateModal" style="margin-top:10px; padding:10px 20px; background-color:#007bff; color:white; border:none; border-radius:5px; cursor:pointer; font-size: 0.9rem; transition: background-color 0.2s;">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeCreateModal')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    };


    return (
        <main className="p-4 md:p-6 lg:p-8 space-y-6 font-sans bg-gray-50 text-black min-h-screen dark:bg-neutral-900 dark:text-neutral-100">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 dark:border-neutral-700 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-neutral-50 flex items-center">
                        <Icon icon="mdi:email-check-outline" className="mr-3 text-primary-600 dark:text-primary-400 text-4xl"/>
                        Sent Emails
                    </h1>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        View and manage your previously sent email campaigns.
                    </p>
                </div>
                <Button 
                    color="primary" 
                    className="mt-4 sm:mt-0 rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all"
                    startContent={<Icon icon="mdi:plus-circle-outline" className="text-xl" />}
                    onPress={handleCreateNewEmail}
                    size="lg"
                >
                    Create New Email
                </Button>
            </header>

            <Card className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden"> {/* Enhanced shadow and rounded corners */}
                <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-3 p-5 border-b dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50">
                    <Input
                        isClearable
                        fullWidth
                        placeholder="Search emails by name, subject, design, or category..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        startContent={<Icon icon="mdi:magnify" className="text-neutral-500 dark:text-neutral-400 text-xl"/>}
                        className="max-w-full sm:max-w-xl rounded-lg" // Slightly wider search
                        classNames={{
                            inputWrapper: "bg-white dark:bg-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-600/80 border-gray-300 dark:border-neutral-600 shadow-sm focus-within:ring-2 focus-within:ring-primary-500",
                            input: "text-sm text-black dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400",
                        }}
                    />
                </CardHeader>
                <CardBody className="p-0 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-4">
                           <SentEmailsTableSkeleton />
                        </div>
                    ) : paginatedEmails.length === 0 ? (
                        <div className="text-center py-20">
                            <Icon icon="mdi:email-search-outline" className="text-7xl text-neutral-400 dark:text-neutral-500 mb-5" />
                            <p className="text-xl text-neutral-600 dark:text-neutral-300 font-semibold">
                                {searchTerm ? "No Emails Found" : "No Sent Emails Yet"}
                            </p>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                                {searchTerm ? "Try adjusting your search terms or clear the search." : "Once you send emails, they will appear here."}
                            </p>
                            {searchTerm && <Button variant="flat" color="primary" onPress={() => setSearchTerm('')} className="mt-6 rounded-md">Clear Search</Button>}
                        </div>
                    ) : (
                        <Table aria-label="Sent Emails Table" removeWrapper className="min-w-[800px]"> 
                            <TableHeader>
                                <TableColumn className="text-left bg-gray-100 dark:bg-neutral-700/60 text-black dark:text-neutral-200 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider">Name</TableColumn>
                                <TableColumn className="text-left bg-gray-100 dark:bg-neutral-700/60 text-black dark:text-neutral-200 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider">Subject</TableColumn>
                                <TableColumn className="text-left bg-gray-100 dark:bg-neutral-700/60 text-black dark:text-neutral-200 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider hidden md:table-cell">Category</TableColumn>
                                <TableColumn className="text-left bg-gray-100 dark:bg-neutral-700/60 text-black dark:text-neutral-200 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider hidden lg:table-cell">Design</TableColumn>
                                <TableColumn className="text-left bg-gray-100 dark:bg-neutral-700/60 text-black dark:text-neutral-200 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider hidden xl:table-cell">Created</TableColumn> 
                                <TableColumn className="text-left bg-gray-100 dark:bg-neutral-700/60 text-black dark:text-neutral-200 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider">Stats</TableColumn>
                                <TableColumn className="text-center bg-gray-100 dark:bg-neutral-700/60 text-black dark:text-neutral-200 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider">Actions</TableColumn>
                            </TableHeader>
                            <TableBody items={paginatedEmails}
                                emptyContent={ /* This will show if filteredEmails is empty but sentEmails is not */
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:email-off-outline" className="text-5xl text-neutral-400 dark:text-neutral-500 mb-3" />
                                        <p className="text-neutral-600 dark:text-neutral-400">No items to display for the current page or filter.</p>
                                    </div>
                                }
                            >
                                {(item) => (
                                    <TableRow key={item.id} className="border-b dark:border-neutral-700/50 hover:bg-gray-50 dark:hover:bg-neutral-700/20 transition-colors group">
                                        <TableCell className="px-4 py-3.5 text-sm text-black dark:text-neutral-100 font-medium align-top">{item.name}</TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-300 max-w-xs truncate align-top" title={item.subject}>{item.subject}</TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm hidden md:table-cell align-top">
                                            <SuggestionBadge suggestionType={item.suggestionType} />
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-neutral-500 dark:text-neutral-400 hidden lg:table-cell align-top truncate" title={item.designName}>
                                            {item.designName || "N/A"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-neutral-500 dark:text-neutral-400 hidden xl:table-cell align-top">{item.createdDate}</TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 align-top">
                                            <div className="flex flex-col space-y-1.5">
                                                <div className="flex items-center group/stat" title="Sent Count">
                                                    <Icon icon="mdi:send-check-outline" className="mr-2 text-lg text-sky-500 dark:text-sky-400 group-hover/stat:text-sky-600 dark:group-hover/stat:text-sky-300 transition-colors"/>
                                                    <span className="font-semibold text-sm text-black dark:text-neutral-100">{item.sentCount.toLocaleString()}</span>
                                                    <span className="ml-1.5 text-neutral-500 dark:text-neutral-400 text-xs">Sent</span>
                                                </div>
                                                <div className="flex items-center group/stat" title="Viewed Count">
                                                    <Icon icon="mdi:eye-check-outline" className="mr-2 text-lg text-emerald-500 dark:text-emerald-400 group-hover/stat:text-emerald-600 dark:group-hover/stat:text-emerald-300 transition-colors"/>
                                                    <span className="font-semibold text-sm text-black dark:text-neutral-100">{item.viewedCount.toLocaleString()}</span>
                                                    <span className="ml-1.5 text-neutral-500 dark:text-neutral-400 text-xs">Viewed</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-center align-top">
                                            <Tooltip content="Preview Email" placement="top" className="bg-black text-white dark:bg-neutral-600 dark:text-neutral-100 rounded-md shadow-lg text-xs">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="flat"
                                                    color="default"
                                                    onPress={() => handlePreview(item.id)}
                                                    className="rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-600/70 focus:ring-1 focus:ring-primary-400"
                                                >
                                                    <Icon icon="mdi:eye-outline" className="text-xl"/>
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
                {!isLoading && totalPages > 1 && (
                    <CardFooter className="flex justify-center p-4 border-t dark:border-neutral-700/50 bg-gray-50 dark:bg-neutral-800/60 rounded-b-xl">
                        <Pagination
                            showControls
                            total={totalPages}
                            initialPage={1}
                            page={currentPage}
                            onChange={setCurrentPage}
                            color="primary"
                            variant="flat"
                            classNames={{
                                cursor: "bg-primary-600 text-white dark:bg-primary-500 dark:text-black shadow-lg rounded-md",
                                item: "bg-white dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-700/20 text-black dark:text-neutral-200 rounded-md",
                                prev: "bg-white dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-700/20 text-black dark:text-neutral-200 rounded-md",
                                next: "bg-white dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-700/20 text-black dark:text-neutral-200 rounded-md",
                            }}
                        />
                    </CardFooter>
                )}
            </Card>
        </main>
    );
}

