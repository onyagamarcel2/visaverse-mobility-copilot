export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("[v0] Notifications not supported")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) {
    console.log("[v0] Notifications not supported")
    return
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/visaverse-app-icon.jpg",
      badge: "/notification-badge.jpg",
      ...options,
    })
  }
}

export function scheduleNotification(title: string, body: string, delay: number) {
  setTimeout(() => {
    showNotification(title, { body })
  }, delay)
}

export interface DeadlineReminder {
  id: string
  title: string
  date: string
  notified: boolean
}

export function checkDeadlineReminders(reminders: DeadlineReminder[]) {
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  reminders.forEach((reminder) => {
    const reminderDate = new Date(reminder.date)

    // Notify 3 days before
    if (!reminder.notified && reminderDate <= threeDaysFromNow && reminderDate > now) {
      const daysUntil = Math.ceil((reminderDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      showNotification("Deadline Approaching", {
        body: `${reminder.title} is due in ${daysUntil} day(s)`,
        tag: reminder.id,
        requireInteraction: true,
      })
      reminder.notified = true
    }
  })
}
