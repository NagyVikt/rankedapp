'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/stripe/card'; // Assuming this path is correct
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  KeyRound, // Added for SET_PIN, or use Pin / LockKeyhole etc.
  type LucideIcon,
  // LucideProps, // LucideProps might not be needed if LucideIcon is sufficient
} from 'lucide-react';
import {
  ActivityType,
  activityLogs as activityLogsSchema,
} from '@/lib/db/schema'; // Assuming ActivityType enum and schema are defined here

// Using the function you provided.
// Ensure this function is correctly defined and exported from your queries file.
import { getActivityLogsByTeamId } from '@/lib/db/queries';
// import { RefAttributes, ForwardRefExoticComponent } from 'react'; // Might not be needed

// Define the expected structure of an activity log entry, aligning with your function's return type.
// This should match the structure of objects in the ActivityLog[] array returned by getActivityLogsByTeamId.
// It's often good practice to infer this type from your Drizzle schema if possible,
// or define it based on the select query.
type ActivityLog = typeof activityLogsSchema.$inferSelect; // Infer type from Drizzle schema

// If you cannot infer, define manually:
// interface ActivityLog {
//   id: string; // Or number, depending on your schema (e.g., activityLogsSchema.id.dataType)
//   action: ActivityType | null;
//   ipAddress?: string | null;
//   timestamp?: Date | null; // Assuming it's a Date object
//   teamId?: number | null; // If your logs have teamId
//   userId?: string | null; // If your logs have userId
//   // Add any other properties that your log objects might have
// }

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus, // Consider a different icon like UsersRound if available
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  [ActivityType.SET_PIN]: KeyRound, // Added entry for SET_PIN
  // CRITICAL: Add entries for ALL other ActivityType enum members to satisfy the Record type.
  // This will prevent the "Property '[ActivityType.XYZ]' is missing" error.
  // Example:
  // [ActivityType.SOME_OTHER_ACTION]: SomeOtherIcon,
};

function getRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'Unknown time';
  const d = typeof date === 'string' ? new Date(date) : date; // Ensure 'd' is a Date object
  if (isNaN(d.getTime())) return 'Invalid date'; // Check if date is valid

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 5) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`; // Approx 30 days
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`; // Approx 12 months

  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function formatAction(action: ActivityType | null | undefined): string {
  if (action === null || action === undefined) return 'Unknown action occurred';

  switch (action) {
    case ActivityType.SIGN_UP:
      return 'User signed up'; // Changed from "You signed up" for general log
    case ActivityType.SIGN_IN:
      return 'User signed in';
    case ActivityType.SIGN_OUT:
      return 'User signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'User changed password';
    case ActivityType.DELETE_ACCOUNT:
      return 'User deleted account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'User updated account';
    case ActivityType.CREATE_TEAM:
      return 'Team created';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'Team member removed';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'Team member invited';
    case ActivityType.ACCEPT_INVITATION:
      return 'Invitation accepted';
    case ActivityType.SET_PIN:
      return 'User set up PIN';
    // CRITICAL: Add cases for ALL other ActivityType enum members.
    // case ActivityType.SOME_OTHER_ACTION:
    //   return 'Some other action performed';
    default:
      const exhaustiveCheck: never = action;
      console.warn(`Unhandled activity type: ${exhaustiveCheck}`);
      return `An unrecognized action occurred: ${action}`;
  }
}

export default async function ActivityPage() {
  // IMPORTANT: You need to provide a teamId here.
  // This could come from page props, URL params, user session, context, etc.
  const teamId: number = 1; // Replace 1 with the actual teamId

  let logs: ActivityLog[] = [];
  try {
    // Using the imported function with the required teamId
    logs = await getActivityLogsByTeamId(teamId); // Default limit is 20 from your function
    // If you want a different limit: await getActivityLogsByTeamId(teamId, 50);
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    // You might want to display an error message in the UI here
  }

  return (
    <section className="flex-1 p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Activity Log (Team ID: {teamId}){' '}
        {/* Indicate which team's logs are shown */}
      </h1>
      <Card className="shadow-lg dark:bg-gray-800 border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-gray-200">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log: ActivityLog) => {
                // Ensure log.action is a valid key for iconMap
                const currentAction =
                  log.action &&
                  Object.values(ActivityType).includes(
                    log.action as ActivityType,
                  )
                    ? (log.action as ActivityType)
                    : null;
                const IconComponent =
                  currentAction && iconMap[currentAction]
                    ? iconMap[currentAction]
                    : Settings;
                const formattedAction = formatAction(currentAction);

                return (
                  <li
                    key={log.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <div className="bg-orange-100 dark:bg-orange-800 rounded-full p-2 flex-shrink-0 mt-1">
                      <IconComponent className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {formattedAction}
                        {/* You might want to display user info if available, e.g., log.user?.name */}
                        {log.ipAddress ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            (IP: {log.ipAddress})
                          </span>
                        ) : (
                          ''
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {getRelativeTime(log.timestamp)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                No activity yet for this team
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                When actions related to this team occur, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
