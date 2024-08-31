import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EditBannissementModal from './EditBannissementModal'; // Importation du composant EditBannissementModal
import CreateBannissementModal from './CreateBannissementModal'; // Importation du composant CreateBannissementModal
import './BannissementsTab.css';

interface Bannissement {
  id: number;
  user: {
    id: number;
    username: string;
  };
  reason: string;
  startDate: string;
  endDate?: string;
  isPermanent: boolean;
  initiatedBy: {
    id: number;
    username: string;
  };
}

const BannissementsTab: React.FC = () => {
  const [bannissements, setBannissements] = useState<Bannissement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBannissementId, setSelectedBannissementId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchBannissements();
  }, []);

  const fetchBannissements = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/bannissements');
      setBannissements(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bannissements:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/bannissements/${id}`);
      setBannissements(bannissements.filter((bannissement) => bannissement.id !== id));
    } catch (error) {
      console.error('Error deleting bannissement:', error);
    }
  };

  const handleEdit = (id: number) => {
    setSelectedBannissementId(id);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    fetchBannissements(); // Rafraîchir la liste des bannissements après l'édition ou la création
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true); // Ouvre la modal de création
  };

  return (
    <div className="bannissements-tab">
      <div className="header">
        <h2>Gestion des Bannissements</h2>
        <FaPlus className="icon add-icon" onClick={handleCreate} />
      </div>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="bannissements-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Reason</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Permanent</th>
              <th>Initiated By ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bannissements.map((bannissement) => (
              <tr key={bannissement.id}>
                <td>{bannissement.id}</td>
                <td>{bannissement.user.username} (ID: {bannissement.user.id})</td>
                <td>{bannissement.reason}</td>
                <td>{new Date(bannissement.startDate).toLocaleDateString()}</td>
                <td>{bannissement.endDate ? new Date(bannissement.endDate).toLocaleDateString() : 'N/A'}</td>
                <td>{bannissement.isPermanent ? 'Oui' : 'Non'}</td>
                <td>{bannissement.initiatedBy.username} (ID: {bannissement.initiatedBy.id})</td>
                <td className="actions">
                  <FaEdit className="icon edit-icon" onClick={() => handleEdit(bannissement.id)} />
                  <FaTrash className="icon delete-icon" onClick={() => handleDelete(bannissement.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isEditModalOpen && selectedBannissementId !== null && (
        <EditBannissementModal
          bannissementId={selectedBannissementId}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {isCreateModalOpen && (
        <CreateBannissementModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BannissementsTab;
