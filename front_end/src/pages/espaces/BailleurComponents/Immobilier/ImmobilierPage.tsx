import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import EditImmobilierModal from '../../AdminComponents/EditImmobilierModal';
import './ImmobilierPage.css'; 

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

const ImmobilierPage: React.FC<{ immobilierId: number }> = ({ immobilierId }) => {
  const { user } = useAuth();
  const [immobilier, setImmobilier] = useState<Immobilier | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchImmobilier = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const response = await axios.get(`http://localhost:3000/api/immobiliers/${immobilierId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setImmobilier(response.data);
      } catch (error) {
        console.error('Error fetching immobilier:', error);
      }
    };

    fetchImmobilier();
  }, [immobilierId, user]);

  const handleDelete = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/immobiliers/${immobilierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      window.location.href = '/bailleur'; // Rediriger après suppression
    } catch (error) {
      console.error('Error deleting immobilier:', error);
    }
  };

  const handleEditSave = () => {
    setEditModalOpen(false);
    const fetchImmobilier = async () => {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await axios.get(`http://localhost:3000/api/immobiliers/${immobilierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setImmobilier(response.data);
    };

    fetchImmobilier();
  };

  if (!immobilier) return <p>Loading...</p>;

  return (
    <div className="immobilier-page">
      <h2>{immobilier.name}</h2>
      <div className="immobilier-actions">
        <button onClick={() => setEditModalOpen(true)}>Modifier</button>
        <button onClick={handleDelete} className="delete-button">Supprimer</button>
      </div>
      
      <div className="details-section">
        <p>Description: {immobilier.content.description}</p>
        <p>Adresse: {immobilier.content.adresse}</p>
        <p>Coût journalier: {immobilier.dailyCost} €</p>
        <p>Status: {immobilier.status}</p>
      </div>

      {isEditModalOpen && (
        <EditImmobilierModal
          immobilierId={immobilier.id}
          onClose={() => setEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default ImmobilierPage;
