import { Link } from "react-router-dom";
import { BellRing, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  unreadCount: number;
}

export function NotificationList({ notifications, onMarkAllAsRead, onMarkAsRead, unreadCount }: NotificationListProps) {
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card className="w-[380px] border-0 shadow-none">
      <CardHeader className="p-4">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have {unreadCount} unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "grid grid-cols-[25px_1fr] items-start p-4 gap-4",
                  !notification.is_read && "bg-secondary"
                )}
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="grid gap-1">
                  <Link
                    to={notification.link || "#"}
                    className="hover:underline"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="text-sm font-medium leading-none">
                      {notification.message}
                    </p>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-semibold">No new notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </CardContent>
      {unreadCount > 0 && (
        <CardFooter className="p-2 border-t">
          <Button onClick={onMarkAllAsRead} variant="ghost" className="w-full">
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}