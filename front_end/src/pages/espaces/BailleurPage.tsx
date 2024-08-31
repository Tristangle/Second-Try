import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import ImmobilierTab from './BailleurComponents/ImmobilierTab';
import FinancesTab from './BailleurComponents/FinancesTab';
import DocumentsTab from './BailleurComponents/DocumentsTab';
import DevisTab from './BailleurComponents/DevisTab';
import './BailleurPage.css';

const BailleurPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('immobilier');

  useEffect(() => {
    console.log("User role:", user?.role);

    if (!isAuthenticated || !(user?.role === 1 || user?.role === 3)) {
        navigate('/home');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <>
      <Navbar /> 
      <div className="bailleur-page">
        <div className="tabs">
          <button 
            onClick={() => setActiveTab('immobilier')} 
            className={activeTab === 'immobilier' ? 'active' : ''}
          >
            Immobilier
          </button>
          <button 
            onClick={() => setActiveTab('finances')} 
            className={activeTab === 'finances' ? 'active' : ''}
          >
            Finances
          </button>
          <button 
            onClick={() => setActiveTab('documents')} 
            className={activeTab === 'documents' ? 'active' : ''}
          >
            Documents
          </button>
          <button 
            onClick={() => setActiveTab('devis')} 
            className={activeTab === 'devis' ? 'active' : ''}
          >
            Devis
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'immobilier' && <ImmobilierTab />}
          {activeTab === 'finances' && <FinancesTab />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'devis' && <DevisTab />}
        </div>
      </div>
    </>
  );
};

export default BailleurPage;
