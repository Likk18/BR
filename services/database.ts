import { User, Trade } from '../types';

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
};

initializeDB();

// --- USER FUNCTIONS ---
export const signup = async (email: string, password: string): Promise<User | null> => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    return null; // User already exists
  }
  
  if (password.length < 6) {
      return null; // Basic validation
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    passwordHash: pseudoHash(password),
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  sessionStorage.setItem('loggedInUser', JSON.stringify(newUser));
  return newUser;
};

export const login = async (email: string, password: string): Promise<User | null> => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email);

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
  const allTrades: Trade[] = JSON.parse(localStorage.getItem('trades') || '[]');
  // Dates are stored as strings, so we need to convert them back to Date objects
  return allTrades
    .filter(trade => trade.userId === userId)
    .map(trade => ({...trade, date: new Date(trade.date)}));
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

export const deleteTrade = (tradeId: string, userId: string): void => {
  const allTrades: Trade[] = JSON.parse(localStorage.getItem('trades') || '[]');
  const updatedTrades = allTrades.filter(trade => !(trade.id === tradeId && trade.userId === userId));
  localStorage.setItem('trades', JSON.stringify(updatedTrades));
};