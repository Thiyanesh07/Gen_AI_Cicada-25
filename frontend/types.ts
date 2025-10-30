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

export type PanelType = 'chat' | 'image' | 'reminders' | 'audio' | 'settings';

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
