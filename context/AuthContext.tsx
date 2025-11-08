import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Trade } from '../types';
import * as DB from '../services/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  trades: Trade[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addTrade: (tradeData: Omit<Trade, 'id' | 'userId'>) => void;
  deleteTrade: (tradeId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    const loggedInUser = DB.checkSession();
    if (loggedInUser) {
      setUser(loggedInUser);
      loadTrades(loggedInUser.id);
    }
  }, []);

  const loadTrades = (userId: string) => {
    const userTrades = DB.getTrades(userId);
    setTrades(userTrades);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const loggedInUser = await DB.login(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      loadTrades(loggedInUser.id);
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    const newUser = await DB.signup(email, password);
    if (newUser) {
      setUser(newUser);
      loadTrades(newUser.id); // Load trades (will be empty)
      return true;
    }
    return false;
  };

  const logout = () => {
    DB.logout();
    setUser(null);
    setTrades([]);
  };

  const addTrade = (tradeData: Omit<Trade, 'id' | 'userId'>) => {
    if (user) {
      DB.addTrade({ ...tradeData, userId: user.id });
      loadTrades(user.id); // Reload trades to update the UI
    }
  };

  const deleteTrade = (tradeId: string) => {
    if (user) {
      DB.deleteTrade(tradeId, user.id);
      // Directly update the state to ensure a reactive UI update
      setTrades(prevTrades => prevTrades.filter(trade => trade.id !== tradeId));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, trades, login, signup, logout, addTrade, deleteTrade }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};