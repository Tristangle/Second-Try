import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { decodeToken } from '../pages/auth/jwtDecode';
import { AxiosError } from 'axios'; 
interface AuthContextType {
  user: { id: number, name: string; role: number } | null;
  checkUserRole: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: number,name: string; role: number } | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        checkUserRole();
      } else {
        setUser(null); // Invalide le token s'il est incorrect
      }
    } else {
      setUser(null); // Redirige l'utilisateur vers la page de login s'il n'y a pas de token
    }
  }, []);
  
  const checkUserRole = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("Pas de token trouvé.");
            setUser(null);
            return;
        }

        const decoded = decodeToken(token);
        if (!decoded) {
            console.log("Token invalide.");
            setUser(null);
            return;
        }

        const userId = decoded.userId;
        console.log(`User ID décodé : ${userId}`);

        const response = await axios.get(`http://localhost:3000/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.status === 200 && response.data) {
            const currentUser = response.data;
            console.log("Utilisateur récupéré :", currentUser);
            if (currentUser) {
                setUser({ id: userId, name: currentUser.username, role: Number(currentUser.role.id) });
                console.log("Mise à jour du user :", { id: userId, name: currentUser.username, role: Number(currentUser.role.id) });
            } else {
                console.log("Utilisateur non trouvé dans la base de données.");
                setUser(null);
            }
        } else {
            setUser(null);
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du rôle de l'utilisateur :", error);

        if (axios.isAxiosError(error)) { // Vérifiez que l'erreur est bien de type AxiosError
            if (error.response && error.response.status === 403) {
                console.log("Utilisateur banni.");
                setUser(null);
                localStorage.removeItem('token');
                alert('Vous êtes banni et ne pouvez pas accéder à cette application.');
                window.location.href = '/login';
            }
        } else {
            setUser(null);
        }
    }
  }
  
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/api/logout', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      setUser(null);
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirige après déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, checkUserRole, logout }}>
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
