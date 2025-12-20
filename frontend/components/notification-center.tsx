"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, X, Check, Clock } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { requestNotificationPermission } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: "info" | "warning" | "success"
}

const defaultNotificationTimestamp = new Date("2024-01-01T00:00:00Z")
const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome to VisaVerse",
    message: "Your personalized visa plan is ready to review",
    timestamp: defaultNotificationTimestamp,
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Deadline Approaching",
    message: "Document submission deadline in 3 days",
    timestamp: new Date(defaultNotificationTimestamp.getTime() - 60000),
    read: false,
    type: "warning",
  },
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications)
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted",
  )
  const { toast } = useToast()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    setNotificationsEnabled(granted)

    if (granted) {
      toast({
        title: "Notifications enabled",
        description: "You will receive important deadline reminders",
      })
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "text-warning"
      case "success":
        return "text-success"
      default:
        return "text-primary"
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-warning text-foreground"
      case "success":
        return "bg-success text-white"
      default:
        return "bg-primary text-white"
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!notificationsEnabled && (
            <Card className="p-4 border-warning bg-warning/10">
              <div className="flex items-start gap-3">
                <BellOff className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-2">Enable notifications</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Stay updated with important deadlines and reminders
                  </p>
                  <Button size="sm" onClick={handleEnableNotifications} className="w-full">
                    Enable Notifications
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {notifications.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-2">
                  <Check className="w-4 h-4" />
                  Mark all as read
                </Button>
              )}
            </div>
          )}

          <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={`p-4 border-border ${!notification.read ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getTypeColor(notification.type)}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-foreground">{notification.title}</h4>
                        {!notification.read && (
                          <Badge className={`${getTypeBadge(notification.type)} text-xs`}>New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
