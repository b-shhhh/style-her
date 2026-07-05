import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem('styleher-user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const register = (email, password, name) => {
    const newUser = { id: Date.now(), email, name, password, createdAt: new Date().toISOString() };
    window.localStorage.setItem('styleher-user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const login = (email, password) => {
    const stored = window.localStorage.getItem('styleher-user');
    if (stored) {
      const userData = JSON.parse(stored);
      if (userData.email === email && userData.password === password) {
        setUser(userData);
        return userData;
      }
    }
    return null;
  };

  const logout = () => {
    window.localStorage.removeItem('styleher-user');
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    window.localStorage.setItem('styleher-user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
