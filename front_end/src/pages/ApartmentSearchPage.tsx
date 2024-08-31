import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/common/Navbar'; // Import de la Navbar
import './ApartmentSearchPage.css';
import { Link } from 'react-router-dom';

interface Immobilier {
  id: number;
  name: string;
  dailyCost: number; // Ajout du prix journalier
  content: {
    adresse: string;
    description: string;
  };
}

const ApartmentSearchPage: React.FC = () => {
  const [immobiliers, setImmobiliers] = useState<Immobilier[]>([]);
  const [filteredImmobiliers, setFilteredImmobiliers] = useState<Immobilier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch the list of apartments when the component mounts
    axios.get('http://localhost:3000/api/immobiliers')
      .then(response => {
        setImmobiliers(response.data.immobilier);
        setFilteredImmobiliers(response.data.immobilier);
      })
      .catch(error => {
        console.error('Error fetching immobiliers:', error);
      });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const filtered = immobiliers.filter(immobilier => {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = immobilier.name.toLowerCase().includes(searchLower);
      const matchesAddress = immobilier.content.adresse.toLowerCase().includes(searchLower);
      return matchesName || matchesAddress;
    });

    setFilteredImmobiliers(filtered);
  }, [searchTerm, immobiliers]);

  return (
    <div>
      <Navbar />
      <div className="apartment-search-page">
        <h1>Rechercher un Appartement</h1>

        <input
          type="text"
          placeholder="Chercher un appartement par nom ou par ville"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-bar"
        />

        <div className="apartment-list">
          {filteredImmobiliers.map(immobilier => (
            <div key={immobilier.id} className="apartment-card">
              <h2>{immobilier.name}</h2>
              <p>Adresse: {immobilier.content.adresse}</p>
              <p>Description: {immobilier.content.description}</p>
              <p>Prix journalier: {immobilier.dailyCost}€</p> {/* Affichage du prix journalier */}
              <Link to={`/reservation/${immobilier.id}`} className="reservation-button">
                Réserver
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApartmentSearchPage;
