import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EditPrestationModal from './EditPrestationModal';
import CreatePrestationModal from './CreatePrestationModal'; // Importation du composant CreatePrestationModal
import './PrestationsTab.css';

interface Prestation {
  id: number;
  type: string;
  description: string;
  cost: number;
  date: string;
  exploratorOnly: boolean;
}

const PrestationsTab: React.FC = () => {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPrestationId, setSelectedPrestationId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false); // Ajout de l'état pour la modal de création

  useEffect(() => {
    fetchPrestations();
  }, []);

  const fetchPrestations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/prestations');
      setPrestations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prestations:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/prestations/${id}`);
      setPrestations(prestations.filter((prestation) => prestation.id !== id));
    } catch (error) {
      console.error('Error deleting prestation:', error);
    }
  };

  const handleEdit = (id: number) => {
    setSelectedPrestationId(id);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    fetchPrestations(); // Rafraîchir la liste des prestations après l'édition ou la création
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true); // Ouvre la modal de création
  };

  return (
    <div className="prestations-tab">
      <div className="header">
        <h2>Gestion des Prestations</h2>
        <FaPlus className="icon add-icon" onClick={handleCreate} />
      </div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="prestations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Coût</th>
              <th>Date</th>
              <th>Explorator Only</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prestations.map((prestation) => (
              <tr key={prestation.id}>
                <td>{prestation.id}</td>
                <td>{prestation.type}</td>
                <td>{prestation.description}</td>
                <td>{prestation.cost} €</td>
                <td>{new Date(prestation.date).toLocaleDateString()}</td>
                <td>{prestation.exploratorOnly ? 'Oui' : 'Non'}</td>
                <td className="actions">
                  <FaEdit className="icon edit-icon" onClick={() => handleEdit(prestation.id)} />
                  <FaTrash className="icon delete-icon" onClick={() => handleDelete(prestation.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isEditModalOpen && selectedPrestationId !== null && (
        <EditPrestationModal
          prestationId={selectedPrestationId}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {isCreateModalOpen && (
        <CreatePrestationModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default PrestationsTab;
