import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Trade, EntryModel } from '../types';
import * as DB from '../services/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  trades: Trade[];
  entryModels: EntryModel[];
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addTrade: (tradeData: Omit<Trade, 'id' | 'userId'>) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (tradeId: string) => void;
  addEntryModel: (modelData: Omit<EntryModel, 'id' | 'userId'>) => void;
  updateEntryModel: (modelData: EntryModel) => void;
  deleteEntryModel: (modelId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [entryModels, setEntryModels] = useState<EntryModel[]>([]);


  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    const loggedInUser = DB.checkSession();
    if (loggedInUser) {
      setUser(loggedInUser);
      loadUserData(loggedInUser.id);
    }
  }, []);

  const loadUserData = (userId: string) => {
    const userTrades = DB.getTrades(userId);
    setTrades(userTrades);
    const userModels = DB.getEntryModels(userId);
    setEntryModels(userModels);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const loggedInUser = await DB.login(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      loadUserData(loggedInUser.id);
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string): Promise<boolean> => {
    const newUser = await DB.signup(username, password);
    if (newUser) {
      setUser(newUser);
      loadUserData(newUser.id); // Load data (will be empty)
      return true;
    }
    return false;
  };

  const logout = () => {
    DB.logout();
    setUser(null);
    setTrades([]);
    setEntryModels([]);
  };

  const addTrade = (tradeData: Omit<Trade, 'id' | 'userId'>) => {
    if (user) {
      DB.addTrade({ ...tradeData, userId: user.id });
      loadUserData(user.id); // Reload data to update the UI
    }
  };

  const updateTrade = (trade: Trade) => {
    if (user && trade.userId === user.id) {
      DB.updateTrade(trade);
      loadUserData(user.id);
    }
  };

  const deleteTrade = (tradeId: string) => {
    if (user) {
      DB.deleteTrade(tradeId, user.id);
      setTrades(prevTrades => prevTrades.filter(trade => trade.id !== tradeId));
    }
  };
  
  const addEntryModel = (modelData: Omit<EntryModel, 'id' | 'userId'>) => {
    if (user) {
      const newModel = DB.addEntryModel({ ...modelData, userId: user.id });
      setEntryModels(prev => [...prev, newModel]);
    }
  };

  const updateEntryModel = (modelData: EntryModel) => {
    if (user && modelData.userId === user.id) {
        const updatedModel = DB.updateEntryModel(modelData);
        if (updatedModel) {
            setEntryModels(prev => prev.map(m => m.id === updatedModel.id ? updatedModel : m));
        }
    }
  };

  const deleteEntryModel = (modelId: string) => {
    if (user) {
        DB.deleteEntryModel(modelId, user.id);
        setEntryModels(prev => prev.filter(m => m.id !== modelId));
    }
  };


  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        trades, 
        entryModels,
        login, 
        signup, 
        logout, 
        addTrade,
        updateTrade,
        deleteTrade,
        addEntryModel,
        updateEntryModel,
        deleteEntryModel
    }}>
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