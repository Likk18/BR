export interface User {
  id: string;
  username: string;
  passwordHash: string; // In a real app, never store plain text passwords
}

export interface Trade {
  id: string;
  userId: string;
  date: Date;
  time: string;
  symbol: string;
  pnl: number;
  notes: string;
  screenshot?: string;
  entryModelId?: string;
  entryModelData?: Record<string, { value: string; timeframe: string; }>;
  direction?: 'long' | 'short';
  positionSize?: number;
  positionUnit?: 'lots' | 'contracts';
}

export interface DailySummary {
  date: Date;
  pnl: number;
  tradeCount: number;
}

export interface WeeklySummary {
  week: number;
  pnl: number;
  tradeCount: number;
}

export interface EntryModel {
  id: string;
  userId: string;
  name: string;
  fields: string[];
}
// Fix: Add a centralized Page type to be used across the application.
export type Page = 'dashboard' | 'journal' | 'analytics' | 'day-journal' | 'trade-detail' | 'edit-journal';