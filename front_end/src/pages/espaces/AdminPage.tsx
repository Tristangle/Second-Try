import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import UsersTab from './AdminComponents/UsersTab';
import ImmobiliersTab from './AdminComponents/ImmobiliersTab';
import PrestationsTab from './AdminComponents/PrestationsTab';
import BannissementsTab
 from './AdminComponents/BannissementsTab';
import ReservationsTab from './AdminComponents/ReservationsTab';
const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('users'); // Initialisation de l'état

  useEffect(() => {
    console.log("User role:", user?.role);

    if (!isAuthenticated || user?.role !== 1) {
      navigate('/home');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="admin-page">
      <Navbar /> {/* Ajouter la barre de navigation */}
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('users')} 
          className={activeTab === 'users' ? 'active' : ''}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('immobiliers')} 
          className={activeTab === 'immobiliers' ? 'active' : ''}
        >
          Immobiliers
        </button>
        <button 
          onClick={() => setActiveTab('prestations')} 
          className={activeTab === 'prestations' ? 'active' : ''}
        >
          Prestations
        </button>
        <button 
          onClick={() => setActiveTab('bannissements')} 
          className={activeTab === 'bannissements' ? 'active' : ''}
        >
          Bannissement
        </button>
        <button 
          onClick={() => setActiveTab('reservations')} 
          className={activeTab === 'reservations' ? 'active' : ''}
        >
          Réservations
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'immobiliers' && <ImmobiliersTab />}
        {activeTab === 'prestations' && <PrestationsTab />}
        {activeTab === 'bannissements' && <BannissementsTab />} {/* Ajouter le composant BannissementsTab */}
        {activeTab === 'reservations' && <ReservationsTab />} {/* Ajouter le composant ReservationsTab */}
      </div>
    </div>
  );
};

export default AdminPage;
