import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Basit kullanıcı tipi
export interface User {
  email: string;
  password: string; // gerçek uygulamada hashlenmiş olmalı
  isAdmin: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  register: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const USERS_KEY = '@users';
  const SESSION_KEY = '@currentUser';

  // yükleme
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      if (stored) setUsers(JSON.parse(stored));
      const sess = await AsyncStorage.getItem(SESSION_KEY);
      if (sess) setCurrentUser(JSON.parse(sess));
    })();
  }, []);

  const saveUsers = async (list: User[]) => {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(list));
  };

  const register = async (email: string, password: string) => {
    if (users.find(u => u.email === email)) {
      return false; // zaten var
    }
    const newUser: User = { email, password, isAdmin: false };
    const updated = [...users, newUser];
    setUsers(updated);
    await saveUsers(updated);
    return true;
  };

  const login = async (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    AsyncStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      isAdmin: currentUser?.isAdmin ?? false,
      register,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
