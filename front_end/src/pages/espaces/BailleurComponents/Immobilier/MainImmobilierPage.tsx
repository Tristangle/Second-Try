import React, { useState } from 'react';
import Navbar from '../../../../components/common/Navbar';
import ImmobilierPage from './ImmobilierPage';
import InspectionsPage from './Inspections/InspectionsPage';
import InterventionsPage from './interventions/InterventionsPage';

const MainImmobilierPage: React.FC<{ immobilierId: number }> = ({ immobilierId }) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <div>
        <Navbar/>
    <div className="main-immobilier-page">
      <div className="tabs">
        <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? 'active' : ''}>
          Détails
        </button>
        <button onClick={() => setActiveTab('inspections')} className={activeTab === 'inspections' ? 'active' : ''}>
          Inspections
        </button>
        <button onClick={() => setActiveTab('interventions')} className={activeTab === 'interventions' ? 'active' : ''}>
          Interventions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'details' && <ImmobilierPage immobilierId={immobilierId} />}
        {activeTab === 'inspections' && <InspectionsPage immobilierId={immobilierId} />}
        {activeTab === 'interventions' && <InterventionsPage immobilierId={immobilierId} />}
      </div>
    </div>
    </div>
  );
};

export default MainImmobilierPage;
