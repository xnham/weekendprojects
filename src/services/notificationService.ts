import { writable, get } from 'svelte/store';

export interface Notification {
  id: string;
  message: string;
  icon?: string[];
  timer?: ReturnType<typeof setTimeout>;
}

type NotificationsState = Record<string, Notification>;

// Create store for notifications
const notificationsStore = writable<NotificationsState>({});

// Show a notification
export function showNotification(id: string, message: string, options: {
  duration?: number,
  icon?: string[]
} = {}): void {
  const { duration = 2500, icon } = options;
  
  // Clear existing timer if notification is already showing
  const currentState = get(notificationsStore);
  if (currentState[id]?.timer) {
    clearTimeout(currentState[id].timer);
  }
  
  // Create auto-dismiss timer if duration is provided
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (duration > 0) {
    timer = setTimeout(() => {
      dismissNotification(id);
    }, duration);
  }
  
  // Update the store with the new notification
  notificationsStore.update(state => ({
    ...state,
    [id]: {
      id,
      message,
      icon,
      timer,
    }
  }));
}

// Dismiss a notification
export function dismissNotification(id: string): void {
  notificationsStore.update(state => {
    // Clear the timer if one exists
    if (state[id]?.timer) {
      clearTimeout(state[id].timer);
    }
    
    // Create a new state object without this notification
    const newState = { ...state };
    delete newState[id];
    return newState;
  });
}

// Subscribe to notifications
export function subscribeToNotifications(callback: (notifs: NotificationsState) => void) {
  return notificationsStore.subscribe(callback);
}

// Get all current notifications
export function getNotifications(): NotificationsState {
  return get(notificationsStore);
}

// Clear all notifications
export function clearAllNotifications(): void {
  const currentState = get(notificationsStore);
  
  // Clear all timers
  Object.values(currentState).forEach(notification => {
    if (notification.timer) {
      clearTimeout(notification.timer);
    }
  });
  
  // Reset the store
  notificationsStore.set({});
} 