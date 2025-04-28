import { Card, CardContent, CardHeader, CardTitle } from '@/components/stripe/card';
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
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
};

function getRelativeTime(date: Date): string { // Added return type string
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  // Consider adding a default year if the date is very old, or adjust formatting
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAction(action: ActivityType | null): string { // Allow null action
  if (!action) return 'Unknown action occurred'; // Handle null case

  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new team';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a team member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a team member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';
    default:
       // Handle potential unknown enum values gracefully
       const exhaustiveCheck: never = action;
       console.warn(`Unhandled activity type: ${exhaustiveCheck}`);
       return 'An unrecognized action occurred';
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6"> {/* Added dark mode text color */}
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                // Handle potential null action safely
                const activityAction = log.action as ActivityType | null;
                const Icon = activityAction ? (iconMap[activityAction] ?? Settings) : Settings; // Default icon if action is null or unknown
                const formattedAction = formatAction(activityAction);

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-2"> {/* Added dark mode bg color */}
                      <Icon className="w-5 h-5 text-orange-600 dark:text-orange-300" /> {/* Added dark mode text color */}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100"> {/* Added dark mode text color */}
                        {formattedAction}
                        {/* Safely access ipAddress */}
                        {log.ipAddress ? ` from IP ${log.ipAddress}` : ''}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400"> {/* Added dark mode text color */}
                        {/* FIX: Check if log.timestamp exists before using it */}
                        {log.timestamp ? getRelativeTime(log.timestamp) : 'Unknown time'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"> {/* Added dark mode text color */}
                No activity yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm"> {/* Added dark mode text color */}
                When you perform actions like signing in or updating your
                account, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}