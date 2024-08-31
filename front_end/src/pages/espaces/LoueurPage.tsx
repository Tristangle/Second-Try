import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './LoueurPage.css';
import Navbar from '../../components/common/Navbar';
import PrestationsTab from './PrestationsTab';

interface Immobilier {
  id: number;
  name: string;
  content: {
    description: string;
    adresse: string;
  };
  ownerId: number;
  renterId?: number;
  dailyCost: number;
  status: string;
}

interface Facture {
  id: number;
  name: string;
  date: string;
  emetteur: {
    username: string;
    email: string;
  } | null;
  receveur: {
    username: string;
    email: string;
  } | null;
  immobilier: {
    id: number;
    name: string;
    content: {
      adresse: string;
      description: string;
    };
  } | null;
  intervention: {
    id: number;
    name: string;
    dateDebut: string;
    dateFin: string;
    price: string;
    paye: boolean;
  } | null;
}

interface Devis {
  id: number;
  name: string;
  date: string;
  immobilier: {
    id: number;
    name: string;
    content: {
      adresse: string;
      description: string;
    };
  } | null;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
  content: {
    startDate: string;
    endDate: string;
    price: number;
    cautions?: number;
    abonnement: string;
    reduction?: number;
  };
}

const LoueurPage: React.FC = () => {
  const { user } = useAuth();
  const [immobilier, setImmobilier] = useState<Immobilier | null>(null);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'immobilier' | 'prestations'>('immobilier');

  useEffect(() => {
    if (user) {
      fetchImmobilierLoué();
      fetchFactures();
      fetchDevis();
    }
  }, [user]);

  const fetchImmobilierLoué = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/immobiliers/renter/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setImmobilier(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'immobilier:', error);
      setError('Erreur lors de la récupération de l\'immobilier.');
    }
  };

  const fetchFactures = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/factures/user/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFactures(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      setError('Erreur lors de la récupération des factures.');
    }
  };

  const fetchDevis = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/devis/user/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDevis(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      setError('Erreur lors de la récupération des devis.');
    }
  };

  const handleDownloadFacture = async (factureId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/factures/${factureId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob', // Important pour recevoir le fichier en tant que Blob
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture_${factureId}.pdf`); // Nom du fichier de téléchargement
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
      setError('Erreur lors du téléchargement de la facture.');
    }
  };

  const renderImmobilierTab = () => (
    <div>
      <h2>Immobilier Loué</h2>
      {immobilier ? (
        <div className="immobilier-card">
          <h3>{immobilier.name}</h3>
          <p>{immobilier.content.description}</p>
          <p>Adresse: {immobilier.content.adresse}</p>
          <p>Coût journalier: {immobilier.dailyCost} €</p>
          <p>Status: {immobilier.status}</p>
        </div>
      ) : (
        <p>Vous n'êtes pas actuellement en train de louer un immobilier.</p>
      )}

      <h2>Documents</h2>
      <div className="documents-container">
        <h3>Factures</h3>
        {factures.map((facture) => (
          <div className="document-card" key={facture.id}>
            <h3>{facture.name}</h3>
            <p>Date: {new Date(facture.date).toLocaleDateString()}</p>
            <p>Émetteur: {facture.emetteur?.username || 'N/A'} ({facture.emetteur?.email})</p>
            <p>Receveur: {facture.receveur?.username || 'N/A'}</p>
            {facture.immobilier && (
              <p>Immobilier: {facture.immobilier.name} - {facture.immobilier.content.adresse}</p>
            )}
            {facture.intervention && (
              <p>Intervention: {facture.intervention.name} - {facture.intervention.price} €</p>
            )}
            <button onClick={() => handleDownloadFacture(facture.id)}>
              Télécharger
            </button>
          </div>
        ))}

        <h3>Devis</h3>
        {devis.map((devis) => (
          <div className="document-card" key={devis.id}>
            <h3>{devis.name}</h3>
            <p>Date: {new Date(devis.date).toLocaleDateString()}</p>
            <p>User: {devis.user?.username || 'N/A'} ({devis.user?.email})</p>
            {devis.immobilier && (
              <p>Immobilier: {devis.immobilier.name} - {devis.immobilier.content.adresse}</p>
            )}
            <p>Prix: {devis.content.price} €</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrestationsTab = () => (
    <PrestationsTab user={user} />
  );

  return (
    <div>
      <Navbar />
      <div className="loueur-tab-container">
        {error && <p className="error-message">{error}</p>}
  
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'immobilier' ? 'active' : ''}`}
            onClick={() => setActiveTab('immobilier')}
          >
            Immobilier Loué
          </button>
          <button
            className={`tab-button ${activeTab === 'prestations' ? 'active' : ''}`}
            onClick={() => setActiveTab('prestations')}
          >
            Prestations
          </button>
        </div>
  
        <div className="tab-content">
          {activeTab === 'immobilier' && renderImmobilierTab()}
          {activeTab === 'prestations' && renderPrestationsTab()}
        </div>
      </div>
    </div>
  );
};  

export default LoueurPage;
