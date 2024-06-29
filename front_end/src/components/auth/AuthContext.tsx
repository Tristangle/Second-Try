import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { decodeToken } from './jwtDecode';

interface AuthContextType {
  user: { name: string; role: string } | null;
  checkUserRole: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded) {
        setUser(null);
        return;
      }
      const userId = decoded.userId;

      const response = await axios.get('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      if (response.status === 200 && response.data && response.data.user) {
        const users = response.data.user;
        const currentUser = users.find((user: any) => user.id === userId);
        if (currentUser) {
          setUser({ name: currentUser.username, role: currentUser.roles.name });
        } else {
          setUser(null);
        }
      }
    } catch (error) { 
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/logout', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
    }
  };

  return (
    <AuthContext.Provider value={{ user, checkUserRole, logout }}>
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
