export interface User {
  id: string;
  email: string;
  passwordHash: string; // In a real app, never store plain text passwords
}

export interface Trade {
  id: string;
  userId: string;
  date: Date;
  symbol: string;
  pnl: number;
  notes: string;
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