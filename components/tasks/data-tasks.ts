import React from "react";

// --- AI Job Definitions ---

// Interface defining the structure of an AI Job/Agent
export interface AIJob {
    id: string;
    title: string;
    description: string;
    icon: string; // Icon identifier (e.g., from solar icons)
    isEnabled: boolean;
    status: 'Idle' | 'Running' | 'Completed' | string; // Allow for other potential statuses
    lastRun?: string; // Optional: Format 'YYYY-MM-DD HH:mm'
    badge?: 'HOT' | 'NEW' | 'COMING SOON' | string; // Optional badge text
    configAction?: { // Optional configuration action details
        label: string;
        onPress: (id: string) => void;
        icon: string;
    };
}

// The provided list of AI Jobs
export const initialAIJobs: AIJob[] = [
    { id: 'abandoned-cart', title: 'Abandoned Cart Recovery Agent', description: 'Sends personalized recovery emails/SMS for abandoned checkouts.', icon: 'solar:cart-large-minimalistic-broken', isEnabled: true, status: 'Idle', lastRun: '2025-05-03 10:00', badge: 'HOT', configAction: { label: 'Configure Sequence', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'welcome-email', title: 'Personalized Welcome Agent', description: 'Drafts & sends personalized welcome emails to new customers/subscribers.', icon: 'solar:letter-opened-broken', isEnabled: true, status: 'Completed', lastRun: '2025-05-04 09:15', configAction: { label: 'Edit Template', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'product-desc-gen', title: 'Product Description Writer', description: 'Writes compelling, SEO-friendly descriptions for new or existing products.', icon: 'solar:document-add-broken', isEnabled: true, status: 'Idle', badge: 'NEW', configAction: { label: 'Configure Tone & Keywords', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'ad-copy-gen', title: 'Ad Generator Agent', description: 'Creates variations of ad copy (Google, Facebook etc.) based on product details.', icon: 'solar:pen-new-square-linear', isEnabled: false, status: 'Idle', badge: 'NEW', configAction: { label: 'Set Audience & Goals', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'seo-optimizer', title: 'SEO Content Optimizer Agent', description: 'Analyzes content & suggests SEO keyword improvements. Generates meta descriptions.', icon: 'solar:magnifer-zoom-in-linear', isEnabled: false, status: 'Idle', configAction: { label: 'Analyze Page / Set Keywords', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'product-tagger', title: 'Automated Product Tagger Agent', description: 'Suggests relevant tags & categories for products based on title/description/image.', icon: 'solar:tag-linear', isEnabled: false, status: 'Idle' },
    { id: 'image-background-remover', title: 'AI Image Tool', description: 'Automatically removes or replaces backgrounds from product photos.', icon: 'solar:gallery-edit-broken', isEnabled: false, status: 'Idle' },
    { id: 'inventory-forecaster', title: 'Inventory Forecaster Agent', description: 'Predicts future stock needs based on sales data, seasonality, and trends.', icon: 'solar:chart-line-broken', isEnabled: false, status: 'Idle', configAction: { label: 'Connect Data / View Forecast', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'churn-predictor', title: 'Customer Churn Predictor AI', description: 'Identifies customers at high risk of churning based on behavior patterns.', icon: 'solar:user-minus-broken', isEnabled: false, status: 'Idle', configAction: { label: 'View At-Risk Customers', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'influencer-ai', title: 'Influencer Discovery Agent', description: 'Identifies potential social media influencers based on custom criteria.', icon: 'solar:users-group-two-rounded-broken', isEnabled: true, status: 'Running', configAction: { label: 'Configure Criteria', onPress: (id) => console.log(`Configure ${id}`), icon: 'solar:settings-linear' } },
    { id: 'dynamic-pricing-ai', title: 'Dynamic Pricing Assistant AI', description: 'Suggests optimal price adjustments based on demand, competition, and inventory.', icon: 'solar:graph-up-linear', isEnabled: false, status: 'Idle', badge: 'COMING SOON' }
];

// --- Task Definitions (Used by the Table Component) ---

// Status options expected by the TaskStatus component and filters
export type TaskStatusOptions = "running" | "paused" | "canceled" | "error" | "completed";

// Structure of a Task object used by the AiTaskPanel table
export interface Task {
  id: string; // Unique task identifier (from AIJob id)
  name: string; // Name of the task (from AIJob title)
  status: TaskStatusOptions; // Mapped status
  startTime: string; // ISO Date string or timestamp number
  endTime?: string | null; // ISO Date string, timestamp number, or null
  details?: string; // Optional description (from AIJob description)
  errorMessage?: string; // Message if status is 'error' (not directly from AIJob)
  // Add originalJobStatus if needed for debugging or specific logic
  // originalJobStatus?: string;
}

// --- Mapping Logic ---

/**
 * Maps an AIJob status to a TaskStatusOptions.
 * @param jobStatus - The status string from the AIJob object.
 * @returns The corresponding TaskStatusOptions.
 */
function mapJobStatusToTaskStatus(jobStatus: AIJob['status']): TaskStatusOptions {
    switch (jobStatus?.toLowerCase()) {
        case 'running':
            return 'running';
        case 'completed':
            return 'completed';
        case 'idle': // Map 'Idle' from AIJob to 'paused' for Task display
            return 'paused';
        // Add mappings for other potential job statuses if they exist
        // case 'failed':
        // case 'error':
        //     return 'error';
        // case 'cancelled':
        // case 'canceled':
        //     return 'canceled';
        default:
            // Fallback for unknown statuses - could be 'paused' or a specific 'unknown' status
            return 'paused';
    }
}

/**
 * Generates plausible start and end times for a Task based on its status.
 * @param status - The TaskStatusOptions for the task.
 * @returns An object containing startTime (string) and endTime (string | null).
 */
function generateTaskTimes(status: TaskStatusOptions): { startTime: string; endTime: string | null } {
    const now = Date.now();
    let startTime: number;
    let endTime: number | null = null;

    switch (status) {
        case 'running':
            // Started recently (e.g., 5-30 minutes ago)
            startTime = now - (Math.random() * 25 + 5) * 60 * 1000;
            endTime = null;
            break;
        case 'completed':
            // Finished some time ago (e.g., 1-48 hours ago)
            endTime = now - (Math.random() * 47 + 1) * 60 * 60 * 1000;
            // Started shortly before ending (e.g., 15-60 minutes before)
            startTime = endTime - (Math.random() * 45 + 15) * 60 * 1000;
            break;
        case 'paused': // Includes 'Idle' jobs mapped to 'paused'
            // Started some time ago (e.g., 1-7 days ago) and hasn't ended
            startTime = now - (Math.random() * 6 + 1) * 24 * 60 * 60 * 1000;
            endTime = null;
            break;
        case 'error':
            // Similar to completed, but ended in error
            endTime = now - (Math.random() * 24 + 1) * 60 * 60 * 1000; // 1-24 hours ago
            startTime = endTime - (Math.random() * 10 + 1) * 60 * 1000; // Ran for 1-10 mins before error
            break;
        case 'canceled':
             // Similar to error/completed, ended some time ago
            endTime = now - (Math.random() * 24 + 1) * 60 * 60 * 1000; // 1-24 hours ago
            startTime = endTime - (Math.random() * 30 + 5) * 60 * 1000; // Ran for 5-30 mins before cancel
            break;
        default:
             // Default case: Treat as paused/idle
            startTime = now - (Math.random() * 6 + 1) * 24 * 60 * 60 * 1000;
            endTime = null;
            break;
    }

    return {
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : null,
    };
}


/**
 * Maps an AIJob object to a Task object suitable for the AiTaskPanel table.
 * @param job - The AIJob object.
 * @returns The corresponding Task object.
 */
function mapJobToTask(job: AIJob): Task {
    const taskStatus = mapJobStatusToTaskStatus(job.status);
    const { startTime, endTime } = generateTaskTimes(taskStatus);

    // Basic error message generation if the original status hints at an error
    // This is just an example; real error messages would come from the backend
    const errorMessage = (job.status?.toLowerCase().includes('error') || job.status?.toLowerCase().includes('fail'))
        ? `Task failed during execution. Check logs for job ID: ${job.id}`
        : undefined;

    return {
        id: job.id,
        name: job.title,
        status: taskStatus,
        startTime: startTime,
        endTime: endTime,
        details: job.description, // Use AIJob description as Task details
        errorMessage: errorMessage,
        // originalJobStatus: job.status // Optional: keep original status for reference
    };
}

// Generate the tasks array by mapping each AIJob
export const tasks: Task[] = initialAIJobs.map(mapJobToTask);


// --- Table Column Definitions (Used by AiTaskPanel) ---

// Define Columns for the table based on the Task interface
export interface Column {
    uid: string; // Corresponds to a key in the Task interface
    name: string; // Display name for the column header
    sortable?: boolean; // Whether the column can be sorted
    info?: string; // Optional tooltip info for the header
}

// Column configuration for the AiTaskPanel table
export const columns: Column[] = [
  { uid: "name", name: "Task Name", sortable: true },
  { uid: "status", name: "Status", sortable: true },
  { uid: "startTime", name: "Start Time", sortable: true },
  { uid: "endTime", name: "End Time", sortable: true },
  { uid: "details", name: "Details" }, // Not typically sortable
  { uid: "actions", name: "Actions" }, // Not sortable
  // Add 'errorMessage' column if you want to display it directly
  // { uid: "errorMessage", name: "Error", sortable: false },
];

// Define initially visible columns in the table
export const INITIAL_VISIBLE_COLUMNS = ["name", "status", "startTime", "endTime", "actions"];

// Define keys type based on columns for type safety
export type ColumnsKey = (typeof columns)[number]["uid"];
