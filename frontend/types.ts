// Fix: Import `ReactElement` to resolve the "Cannot find namespace 'JSX'" error.
import type { ReactElement } from 'react';

export enum ChatRole {
  USER = "user",
  GEMINI = "gemini",
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
  image?: string; // For image preview in UI
}

export type PanelType = 'chat' | 'image' | 'reminders' | 'notifications' | 'settings' | 'crops';

export interface NavItem {
  id: PanelType;
  labelKey: string;
  icon: ReactElement;
}

export interface Reminder {
  id: string;
  task: string;
  notes: string;
  startDate: string;
  frequencyDays: number;
}

// Crop Management Types
export interface CropLog {
  id: number;
  user_email: string;
  crop_name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  date_planted: string;
  growth_stage: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CropLogCreate {
  crop_name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  date_planted: string;
  growth_stage?: string;
  notes?: string | null;
}

export interface CropLogUpdate {
  crop_name?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  date_planted?: string;
  growth_stage?: string;
  notes?: string | null;
}

// Notification Types
export enum NotificationType {
  INFO = "info",
  WARNING = "warning",
  ALERT = "alert"
}

export interface Notification {
  id: number;
  crop_id: number;
  user_email: string;
  crop_name: string;
  message: string;
  notification_type: NotificationType;
  weather_condition?: string | null;
  temperature?: number | null;
  humidity?: number | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: {
    info: number;
    warning: number;
    alert: number;
  };
}

