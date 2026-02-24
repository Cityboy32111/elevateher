import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, BookOpen, Users, MessageSquare, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  booking: Users,
  content: FileText,
  community: MessageSquare,
  system: Settings,
  coaching: Users,
};

const sampleNotifications: NotificationItem[] = [
  { id: "1", type: "content", title: "New content: Navigating Your First Week Back", body: "New article available in your Content Feed", link: "/content-feed", read: false, createdAt: "2026-02-24T10:00:00Z" },
  { id: "2", type: "coaching", title: "Coaching session reminder", body: "Your session with Dr. Emily Foster is in 24 hours", link: "/coaching", read: false, createdAt: "2026-02-23T09:00:00Z" },
  { id: "3", type: "community", title: "New reply to your post", body: 'Someone replied to "First week back went better than expected!"', link: "/community", read: true, createdAt: "2026-02-22T15:30:00Z" },
  { id: "4", type: "system", title: "Welcome to elevateHer!", body: "Start by completing your daily mood check-in on the dashboard.", link: "/dashboard", read: true, createdAt: "2026-02-20T08:00:00Z" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const navigate = useNavigate();

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    navigate(notification.link);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              <Check className="mr-2 h-4 w-4" /> Mark All as Read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? "border-primary/30 bg-primary/5" : ""
                }`}
                onClick={() => handleClick(notification)}
              >
                <CardContent className="pt-4 flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    !notification.read ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Icon className={`h-5 w-5 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium text-sm ${!notification.read ? "" : "text-muted-foreground"}`}>
                        {notification.title}
                      </p>
                      {!notification.read && <Badge className="shrink-0">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
