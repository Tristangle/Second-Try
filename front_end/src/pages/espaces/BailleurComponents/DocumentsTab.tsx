import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './DocumentsTab.css';

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

const DocumentsTab: React.FC = () => {
  const { user } = useAuth();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFactures();
      fetchDevis();
    }
  }, [user]);

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

  const handleDownloadDevis = async (devisId: number) => {
    try {
      // À implémenter: Ajouter la logique de téléchargement du devis (similaire à celle des factures)
    } catch (error) {
      console.error('Erreur lors du téléchargement du devis:', error);
      setError('Erreur lors du téléchargement du devis.');
    }
  };

  return (
    <div className="documents-container">
      {error && <p className="error-message">{error}</p>}

      <h2>Factures</h2>
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

      <h2>Devis</h2>
      {devis.map((devis) => (
        <div className="document-card" key={devis.id}>
          <h3>{devis.name}</h3>
          <p>Date: {new Date(devis.date).toLocaleDateString()}</p>
          <p>User: {devis.user?.username || 'N/A'} ({devis.user?.email})</p>
          {devis.immobilier && (
            <p>Immobilier: {devis.immobilier.name} - {devis.immobilier.content.adresse}</p>
          )}
          <p>Prix: {devis.content.price} €</p>
          <button onClick={() => handleDownloadDevis(devis.id)}>
            Télécharger
          </button>
        </div>
      ))}
    </div>
  );
};

export default DocumentsTab;
