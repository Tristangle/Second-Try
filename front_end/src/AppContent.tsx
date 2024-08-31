import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import Vault from './components/vault/Vault';
import UserManager from './components/UserManager';
import './App.css';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'vault' | 'usermanager' | null>(null);
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/logout', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      localStorage.removeItem('token');
      window.location.href = '/login';  
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        {(auth.user?.role === 2) && (
          <>
            <button onClick={() => setCurrentView('vault')}>Coffre-fort</button>
            {auth.user?.role === 2 && (
              <button onClick={() => setCurrentView('usermanager')}>Gestion des utilisateurs</button>
            )}
          </>
        )}
        <button onClick={handleLogout}>Déconnexion</button>
      </div>

      <div className="main-content">
        {currentView === 'vault' && <Vault />}
        {currentView === 'usermanager' && <UserManager />}
      </div>
    </div>
  );
};

export default AppContent;
