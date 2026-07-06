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

  const register = async (email, password, name, image) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, image }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Registration failed');
      }
      const userData = await response.json();
      const user = { id: userData._id || userData.id, email: userData.email, name: userData.name, image: userData.image };
      window.localStorage.setItem('styleher-user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Login failed');
      }
      const userData = await response.json();
      const user = { id: userData._id || userData.id, email: userData.email, name: userData.name, image: userData.image, phone: userData.phone, address: userData.address };
      window.localStorage.setItem('styleher-user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      return null;
    }
  };

  const logout = () => {
    window.localStorage.removeItem('styleher-user');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    if (!user) return null;
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...updatedData }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Profile update failed');
      }
      const updated = await response.json();
      const user = { id: updated._id || updated.id, email: updated.email, name: updated.name, phone: updated.phone, address: updated.address, image: updated.image };
      window.localStorage.setItem('styleher-user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const deleteProfile = async () => {
    if (!user) return null;
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Profile deletion failed');
      }
      window.localStorage.removeItem('styleher-user');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, updateProfile, deleteProfile }}>
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
