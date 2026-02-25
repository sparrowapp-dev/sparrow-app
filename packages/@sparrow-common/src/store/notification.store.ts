import { writable, derived } from "svelte/store";

export interface Notification {
  _id: string;
  type: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  data: any;
}

export const notifications = writable<Notification[]>([]);
export const loadingNotifications = writable(false);

/**
 * unread count
 */
export const unreadCount = derived(
  notifications,
  ($notifications) =>
    $notifications.filter((n) => !n.isRead && !n.isArchived).length,
);

/**
 * replace full list
 */
export function setNotifications(list: Notification[]) {
  notifications.set(list);
}

/**
 * mark read locally
 */
export function markNotificationReadLocal(id: string) {
  notifications.update((list) =>
    list.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
  );
}

/**
 * archive locally
 */
export function archiveNotificationLocal(id: string) {
  notifications.update((list) => list.filter((n) => n._id !== id));
}
