// Notification Service for Shloka Reminders
// Handles scheduling and managing shloka notifications

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeOfDay, timeSlots } from '../data/timeBasedShlokas';

// Storage keys
const STORAGE_KEYS = {
  TIME_NOTIFICATIONS: 'shloka_time_notifications',
  FESTIVAL_NOTIFICATIONS: 'shloka_festival_notifications',
  NOTIFICATION_PREFERENCES: 'shloka_notification_preferences',
};

export interface TimeNotificationSettings {
  brahma_muhurta: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  [key: string]: boolean; // Allow indexing by string
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  timeNotifications: TimeNotificationSettings;
  festivalNotifications: boolean;
  festivalReminderDays: number; // Days before festival to remind
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  sound: true,
  vibration: true,
  timeNotifications: {
    brahma_muhurta: false,
    morning: true,
    afternoon: false,
    evening: true,
    night: false,
  },
  festivalNotifications: true,
  festivalReminderDays: 1,
};

// Get notification preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
    return defaultPreferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return defaultPreferences;
  }
};

// Save notification preferences
export const saveNotificationPreferences = async (
  preferences: NotificationPreferences
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_PREFERENCES,
      JSON.stringify(preferences)
    );
    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
};

// Update single time slot notification
export const updateTimeNotification = async (
  timeSlot: TimeOfDay,
  enabled: boolean
): Promise<boolean> => {
  try {
    const preferences = await getNotificationPreferences();
    preferences.timeNotifications[timeSlot] = enabled;
    await saveNotificationPreferences(preferences);
    
    if (enabled) {
      await scheduleTimeNotification(timeSlot);
    } else {
      await cancelTimeNotification(timeSlot);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating time notification:', error);
    return false;
  }
};

// Toggle festival notifications
export const updateFestivalNotification = async (enabled: boolean): Promise<boolean> => {
  try {
    const preferences = await getNotificationPreferences();
    preferences.festivalNotifications = enabled;
    await saveNotificationPreferences(preferences);
    return true;
  } catch (error) {
    console.error('Error updating festival notification:', error);
    return false;
  }
};

// Schedule notification for a time slot
export const scheduleTimeNotification = async (timeSlot: TimeOfDay): Promise<void> => {
  const slot = timeSlots.find(t => t.id === timeSlot);
  if (!slot) return;

  // In a real app, you would use expo-notifications here
  // This is a placeholder for the notification scheduling logic
  console.log(`Scheduled notification for ${slot.label} at ${slot.notificationTime.hour}:${slot.notificationTime.minute}`);
  
  // Store scheduled notification info
  const scheduled = await getScheduledNotifications();
  scheduled[timeSlot] = {
    enabled: true,
    hour: slot.notificationTime.hour,
    minute: slot.notificationTime.minute,
    label: slot.label,
  };
  await AsyncStorage.setItem(STORAGE_KEYS.TIME_NOTIFICATIONS, JSON.stringify(scheduled));
};

// Cancel notification for a time slot
export const cancelTimeNotification = async (timeSlot: TimeOfDay): Promise<void> => {
  console.log(`Cancelled notification for ${timeSlot}`);
  
  const scheduled = await getScheduledNotifications();
  if (scheduled[timeSlot]) {
    scheduled[timeSlot].enabled = false;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.TIME_NOTIFICATIONS, JSON.stringify(scheduled));
};

// Get scheduled notifications
export const getScheduledNotifications = async (): Promise<Record<string, any>> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TIME_NOTIFICATIONS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return {};
  }
};

// Initialize all notifications based on preferences
export const initializeNotifications = async (): Promise<void> => {
  const preferences = await getNotificationPreferences();
  
  if (!preferences.enabled) {
    console.log('Notifications are disabled');
    return;
  }

  // Schedule time-based notifications
  for (const [slot, enabled] of Object.entries(preferences.timeNotifications)) {
    if (enabled) {
      await scheduleTimeNotification(slot as TimeOfDay);
    }
  }

  console.log('Notifications initialized');
};

// Format time for display
export const formatNotificationTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
};

// Get notification message for a time slot
export const getNotificationMessage = (timeSlot: TimeOfDay): { title: string; body: string } => {
  const messages: Record<TimeOfDay, { title: string; body: string }> = {
    morning: {
      title: '🌅 Brahma Muhurta - Morning Shlokas',
      body: 'Begin your day with sacred verses. Tap to start your morning practice.',
    },
    afternoon: {
      title: '☀️ Madhyahna - Midday Prayers',
      body: 'Time for midday contemplation. Recite shlokas for energy and focus.',
    },
    evening: {
      title: '🌆 Sandhya - Evening Prayers',
      body: 'The twilight hour is sacred. Join in evening prayers for peace.',
    },
    night: {
      title: '🌙 Ratri - Night Shlokas',
      body: 'End your day with gratitude. Peaceful verses for restful sleep.',
    },
  };
  
  return messages[timeSlot];
};

// Check if notifications are supported
export const checkNotificationSupport = async (): Promise<boolean> => {
  // In a real app, check for expo-notifications availability
  return true;
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  // In a real app, use expo-notifications to request permissions
  // For now, simulate permission granted
  console.log('Notification permissions requested');
  return true;
};
