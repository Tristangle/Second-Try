import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ImmobilierTab.css';

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

const ImmobilierTab: React.FC = () => {
  const { user } = useAuth();
  const [immobiliers, setImmobiliers] = useState<Immobilier[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImmobiliers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) return;
  
        const response = await axios.get(`http://localhost:3000/api/immobiliers/owner/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log('API Response:', response.data);
  
        if (Array.isArray(response.data)) {
          setImmobiliers(response.data);
        } else {
          console.error('Unexpected response structure:', response.data);
        }
      } catch (error) {
        console.error('Error fetching immobiliers:', error);
      }
    };
  
    fetchImmobiliers();
  }, [user]);

  const handleCardClick = (id: number) => {
    navigate(`/immobiliers/${id}`);
  };

  return (
    <div>
      <h2>Gestion des Immobiliers</h2>
      <div className="immobilier-cards-container">
        {immobiliers.length > 0 ? (
          immobiliers.map((immobilier) => (
            <div key={immobilier.id} className="immobilier-card" onClick={() => handleCardClick(immobilier.id)}>
              <h3>{immobilier.name}</h3>
              <p>{immobilier.content.description}</p>
              <p>Adresse: {immobilier.content.adresse}</p>
              <p>Coût journalier: {immobilier.dailyCost} €</p>
              <p>Status: {immobilier.status}</p>
            </div>
          ))
        ) : (
          <p>Aucun immobilier trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default ImmobilierTab;
