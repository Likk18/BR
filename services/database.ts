import { User, Trade, EntryModel } from '../types';

// Simple in-memory password hashing simulation (DO NOT USE IN PRODUCTION)
const pseudoHash = (password: string): string => {
  return `hashed_${password}_salted`;
};

// --- DB INITIALIZATION ---
const initializeDB = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
  if (!localStorage.getItem('trades')) {
    localStorage.setItem('trades', JSON.stringify([]));
  }
  if (!localStorage.getItem('entryModels')) {
    localStorage.setItem('entryModels', JSON.stringify([]));
  }
};

initializeDB();

// --- USER FUNCTIONS ---
export const signup = async (username: string, password: string): Promise<User | null> => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    return null; // User already exists
  }
  
  if (password.length < 6) {
      return null; // Basic validation
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    passwordHash: pseudoHash(password),
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  sessionStorage.setItem('loggedInUser', JSON.stringify(newUser));
  return newUser;
};

export const login = async (username: string, password: string): Promise<User | null> => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.username === username);

  if (user && user.passwordHash === pseudoHash(password)) {
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    return user;
  }

  return null;
};

export const logout = (): void => {
  sessionStorage.removeItem('loggedInUser');
};

export const checkSession = (): User | null => {
    const userJson = sessionStorage.getItem('loggedInUser');
    return userJson ? JSON.parse(userJson) : null;
}

// --- TRADE FUNCTIONS ---
export const getTrades = (userId: string): Trade[] => {
  const allTrades: any[] = JSON.parse(localStorage.getItem('trades') || '[]');
  
  return allTrades
    .filter(trade => trade.userId === userId)
    .map(trade => {
        const migratedTrade = { ...trade, date: new Date(trade.date) };

        // Migration logic for entryModelData to support timeframes
        if (migratedTrade.entryModelData) {
            const newModelData: Record<string, { value: string; timeframe: string; }> = {};
            for (const [key, value] of Object.entries(migratedTrade.entryModelData)) {
                if (typeof value === 'string') {
                    // Old format: migrate it
                    newModelData[key] = { value: value, timeframe: '' };
                } else {
                    // Already in new format or something else, just keep it
                    newModelData[key] = value as { value: string; timeframe: string; };
                }
            }
            migratedTrade.entryModelData = newModelData;
        }

        return migratedTrade as Trade;
    });
};

export const addTrade = (tradeData: Omit<Trade, 'id'>): Trade => {
  const allTrades: Trade[] = JSON.parse(localStorage.getItem('trades') || '[]');
  const newTrade: Trade = {
    ...tradeData,
    id: `trade-${Date.now()}`,
  };
  allTrades.push(newTrade);
  localStorage.setItem('trades', JSON.stringify(allTrades));
  return newTrade;
};

export const updateTrade = (updatedTrade: Trade): Trade | null => {
    if (!updatedTrade.id) return null;
    let allTrades: Trade[] = JSON.parse(localStorage.getItem('trades') || '[]');
    const tradeIndex = allTrades.findIndex(t => t.id === updatedTrade.id && t.userId === updatedTrade.userId);

    if (tradeIndex > -1) {
        allTrades[tradeIndex] = updatedTrade;
        localStorage.setItem('trades', JSON.stringify(allTrades));
        return updatedTrade;
    }
    return null;
};

export const deleteTrade = (tradeId: string, userId: string): void => {
  const allTrades: Trade[] = JSON.parse(localStorage.getItem('trades') || '[]');
  const updatedTrades = allTrades.filter(trade => !(trade.id === tradeId && trade.userId === userId));
  localStorage.setItem('trades', JSON.stringify(updatedTrades));
};

// --- ENTRY MODEL FUNCTIONS ---
export const getEntryModels = (userId: string): EntryModel[] => {
    const allModels: EntryModel[] = JSON.parse(localStorage.getItem('entryModels') || '[]');
    return allModels.filter(model => model.userId === userId);
};

export const addEntryModel = (modelData: Omit<EntryModel, 'id'>): EntryModel => {
    const allModels: EntryModel[] = JSON.parse(localStorage.getItem('entryModels') || '[]');
    const newModel: EntryModel = {
        ...modelData,
        id: `model-${Date.now()}`,
    };
    allModels.push(newModel);
    localStorage.setItem('entryModels', JSON.stringify(allModels));
    return newModel;
};

export const updateEntryModel = (updatedModel: EntryModel): EntryModel | null => {
    if (!updatedModel.id) return null;
    let allModels: EntryModel[] = JSON.parse(localStorage.getItem('entryModels') || '[]');
    const modelIndex = allModels.findIndex(m => m.id === updatedModel.id && m.userId === updatedModel.userId);

    if (modelIndex > -1) {
        allModels[modelIndex] = updatedModel;
        localStorage.setItem('entryModels', JSON.stringify(allModels));
        return updatedModel;
    }
    return null;
};


export const deleteEntryModel = (modelId: string, userId: string): void => {
    const allModels: EntryModel[] = JSON.parse(localStorage.getItem('entryModels') || '[]');
    const updatedModels = allModels.filter(model => !(model.id === modelId && model.userId === userId));
    localStorage.setItem('entryModels', JSON.stringify(updatedModels));
};