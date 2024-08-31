import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EditImmobilierModal from './EditImmobilierModal';
import CreateImmobilierModal from './CreateImmobilierModal'; // Import du nouveau modal
import { useAuth } from '../../../context/AuthContext';
import './ImmobiliersTab.css';

const ImmobilierTab: React.FC = () => {
  const { user } = useAuth(); // Obtenir le contexte utilisateur, à garder si nécessaire
  const [immobiliers, setImmobiliers] = useState<any[]>([]);
  const [selectedImmobilierId, setSelectedImmobilierId] = useState<number | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false); // Nouveau state pour gérer le modal de création

  useEffect(() => {
    fetchImmobiliers();
  }, []);

  const fetchImmobiliers = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    axios.get('http://localhost:3000/api/immobiliers/admin', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const data = response.data;

        if (data && Array.isArray(data.immobilier)) {
          setImmobiliers(data.immobilier);
        } else if (Array.isArray(data)) {
          setImmobiliers(data);
        } else {
          console.error('Unexpected response format:', data);
          setImmobiliers([]);
        }
      })
      .catch(error => {
        console.error('Error fetching immobiliers:', error);
        setImmobiliers([]);
      });
  };

  const handleEdit = (immobilierId: number) => {
    setSelectedImmobilierId(immobilierId);
    setEditModalOpen(true);
  };

  const handleDelete = (immobilierId: number) => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    axios.delete(`http://localhost:3000/api/immobiliers/${immobilierId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setImmobiliers(immobiliers.filter(immobilier => immobilier.id !== immobilierId));
      })
      .catch(error => {
        console.error('Error deleting immobilier:', error);
      });
  };

  const handleSave = () => {
    setEditModalOpen(false);
    setCreateModalOpen(false); // Fermer le modal de création après sauvegarde
    fetchImmobiliers(); // Rafraîchir la liste des immobiliers après la sauvegarde des modifications
  };

  const handleCreate = () => {
    setCreateModalOpen(true); // Ouvrir le modal de création
  };

  return (
    <div className="immobiliers-tab">
      <div className="header">
        <h2>Gestion des Immobiliers</h2>
        <FaPlus className="icon add-icon" onClick={handleCreate} /> {/* Harmonisation du bouton avec PrestationsTab */}
      </div>

      <table className="immobiliers-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Adresse</th>
            <th>Daily Cost</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {immobiliers.map(immobilier => (
            <tr key={immobilier.id}>
              <td>{immobilier.id}</td>
              <td>{immobilier.name}</td>
              <td>{immobilier.content.description}</td>
              <td>{immobilier.content.adresse}</td>
              <td>{immobilier.dailyCost}</td>
              <td>{immobilier.status}</td>
              <td>
                <FaEdit className="icon edit-icon" onClick={() => handleEdit(immobilier.id)} />
                <FaTrash className="icon delete-icon" onClick={() => handleDelete(immobilier.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditModalOpen && selectedImmobilierId !== null && (
        <EditImmobilierModal
          immobilierId={selectedImmobilierId}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {isCreateModalOpen && (
        <CreateImmobilierModal
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ImmobilierTab;
