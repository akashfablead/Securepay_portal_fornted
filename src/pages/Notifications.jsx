import {
  CheckCircle,
  AlertCircle,
  Info,
  Bell,
  Trash2,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import {
  listMyNotifications,
  markAllAsRead,
  markAsRead,
} from "../services/notificationService";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await listMyNotifications({ page: 1, limit: 50 });
      const mapped = (data?.items || []).map((n) => ({
        id: n._id,
        type: n.type || "info",
        title: n.title,
        message: n.message,
        date: new Date(n.createdAt).toLocaleString(),
        read: Array.isArray(n.readBy) && n.readBy.length > 0, // UI-level read indicator
        icon:
          n.type === "success"
            ? CheckCircle
            : n.type === "warning"
            ? AlertCircle
            : Info,
      }));
      setItems(mapped);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const getTypeConfig = (type) => {
    const configs = {
      success: { color: "success", bgClass: "bg-success/10 border-success/20" },
      info: { color: "default", bgClass: "bg-primary/10 border-primary/20" },
      warning: { color: "warning", bgClass: "bg-warning/10 border-warning/20" },
      error: {
        color: "destructive",
        bgClass: "bg-destructive/10 border-destructive/20",
      },
    };
    return configs[type] || configs.info;
  };

  const handleMarkOneRead = async (id) => {
    try {
      await markAsRead(id);
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, read: true } : it))
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to mark as read"
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setItems((prev) => prev.map((it) => ({ ...it, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to mark all as read"
      );
    }
  };

  const notifications = items;
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground text-lg">
            Stay updated with your account activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="warning" className="px-3 py-1">
            {unreadCount} New
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Left Column - Notifications List */}
        <div className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-xl">All Notifications</CardTitle>
                    <CardDescription>Recent alerts and updates</CardDescription>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const typeConfig = getTypeConfig(notification.type);
                  const Icon = notification.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`flex gap-4 p-4 rounded-lg border transition-all ${
                        notification.read
                          ? "bg-card hover:bg-secondary/30"
                          : "bg-secondary/50 hover:bg-secondary/70"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${typeConfig.bgClass} flex-shrink-0`}
                      >
                        <Icon className={`h-5 w-5 text-${typeConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </h3>
                          {!notification.read ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkOneRead(notification.id)}
                              className="h-8 w-8 p-0 flex-shrink-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Read
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {notifications.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">
                  We'll notify you about important updates here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
