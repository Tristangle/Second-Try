import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar, { CalendarProps } from 'react-calendar';
import { useAuth } from '../../../../../context/AuthContext';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EditInspectionModal from './EditInspectionModal'; // Import de la modal
import 'react-calendar/dist/Calendar.css';
import './InspectionsPage.css';

interface User {
  id: number;
  username: string;
}

interface Inspection {
  id: number;
  name: string;
  dateDebut: string;
  dateFin: string;
  validation: boolean;
  details: string;
  inspectorId: number;
  renterId: number;
}

const InspectionsPage: React.FC<{ immobilierId: number }> = ({ immobilierId }) => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [newInspection, setNewInspection] = useState<Partial<Inspection>>({
    name: '',
    dateDebut: '',
    dateFin: '',
    details: '',
    inspectorId: user?.id || 0,
    renterId: 0,
    validation: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // État pour gérer la modal
  const [currentInspectionId, setCurrentInspectionId] = useState<number | null>(null); // Inspection à éditer

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const response = await axios.get(`http://localhost:3000/api/inspections/${immobilierId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setInspections(response.data.inspection);
      } catch (error) {
        console.error('Error fetching inspections:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:3000/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data.user);  // Assuming response.data.user is the array of users
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchInspections();
    fetchUsers();
  }, [immobilierId, user]);

  const handleAddInspection = async () => {
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vous devez être connecté pour ajouter une inspection.");
      return;
    }

    if (!newInspection.dateDebut || !newInspection.dateFin || !newInspection.details) {
      setError('Tous les champs sont requis pour ajouter une inspection.');
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/inspections/create`, {
        ...newInspection,
        immobilierId,
        validation: true,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNewInspection({
        name: '',
        dateDebut: '',
        dateFin: '',
        details: '',
        inspectorId: user?.id || 0,
        renterId: 0,
        validation: true,
      });

      const response = await axios.get(`http://localhost:3000/api/inspections/${immobilierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInspections(response.data.inspection); // Rafraîchir les données après ajout

    } catch (error) {
      console.error('Error adding inspection:', error);
      setError('Une erreur est survenue lors de l\'ajout de l\'inspection.');
    }
  };

  const handleDeleteInspection = async (inspectionId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`http://localhost:3000/api/inspections/${inspectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await axios.get(`http://localhost:3000/api/inspections/${immobilierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInspections(response.data.inspection); // Rafraîchir les données après suppression

    } catch (error) {
      console.error('Error deleting inspection:', error);
    }
  };

  const handleEditInspection = (inspectionId: number) => {
    setCurrentInspectionId(inspectionId);
    setIsEditModalOpen(true);
  };

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      const formattedDate = value.toISOString().split('T')[0];
      if (!newInspection.dateDebut) {
        setNewInspection({ ...newInspection, dateDebut: formattedDate });
      } else if (!newInspection.dateFin) {
        setNewInspection({ ...newInspection, dateFin: formattedDate });
      }
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    // Ajoute une classe uniquement pour les vues "month"
    if (view === 'month') {
      if (inspections.some(inspection => {
        const startDate = new Date(inspection.dateDebut);
        const endDate = new Date(inspection.dateFin);
        return date >= startDate && date <= endDate;
      })) {
        return 'inspection-day';  // Classe CSS spécifique pour les jours avec inspections
      }
    }
    return '';
  };
  
  return (
    <div className="inspections-page">
      <h2>Gestion des Inspections</h2>

      <div className="calendar-section">
        <h3>Ajouter une Inspection (Rapport)</h3>
        <Calendar
          onChange={handleDateChange}
          tileClassName={tileClassName}
        />
        <div className="new-inspection-form">
          <label>Nom de l'inspection :</label>
          <input
            type="text"
            value={newInspection.name || ''}
            onChange={(e) => setNewInspection({ ...newInspection, name: e.target.value })}
          />
          <label>Détails :</label>
          <textarea
            value={newInspection.details || ''}
            onChange={(e) => setNewInspection({ ...newInspection, details: e.target.value })}
          />
          <label>Date de début :</label>
          <input
            type="date"
            value={newInspection.dateDebut || ''}
            onChange={(e) => setNewInspection({ ...newInspection, dateDebut: e.target.value })}
          />
          <label>Date de fin :</label>
          <input
            type="date"
            value={newInspection.dateFin || ''}
            onChange={(e) => setNewInspection({ ...newInspection, dateFin: e.target.value })}
          />
          <label>Inspecteur :</label>
          <select
            value={newInspection.inspectorId || ''}
            onChange={(e) => setNewInspection({ ...newInspection, inspectorId: parseInt(e.target.value, 10) })}
          >
            <option value="">Sélectionnez un inspecteur</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          <label>Locataire :</label>
          <select
            value={newInspection.renterId || ''}
            onChange={(e) => setNewInspection({ ...newInspection, renterId: parseInt(e.target.value, 10) })}
          >
            <option value="">Sélectionnez un locataire</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          <label>Validation :</label>
          <select
            value={newInspection.validation ? 'true' : 'false'}
            onChange={(e) => setNewInspection({ ...newInspection, validation: e.target.value === 'true' })}
          >
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
          {error && <p className="error-message">{error}</p>}
          <button onClick={handleAddInspection}>
            <FaPlus /> Ajouter Inspection
          </button>
        </div>
      </div>

      <div className="inspections-list">
        <h3>Liste des Inspections</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Date Début</th>
              <th>Date Fin</th>
              <th>Détails</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((inspection) => (
              <tr key={inspection.id}>
                <td>{inspection.id}</td>
                <td>{inspection.name}</td>
                <td>{new Date(inspection.dateDebut).toLocaleDateString()}</td>
                <td>{new Date(inspection.dateFin).toLocaleDateString()}</td>
                <td>{inspection.details}</td>
                <td>
                  <FaEdit className="icon edit-icon" onClick={() => handleEditInspection(inspection.id)} />
                  <FaTrash className="icon delete-icon" onClick={() => handleDeleteInspection(inspection.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && currentInspectionId && (
        <EditInspectionModal
          inspectionId={currentInspectionId}
          immobilierId={immobilierId}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            setIsEditModalOpen(false);
            // Refresh the list of inspections after saving
            axios.get(`http://localhost:3000/api/inspections/${immobilierId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            })
              .then(response => {
                setInspections(response.data.inspection);
              })
              .catch(error => {
                console.error('Error fetching inspections:', error);
              });
          }}
        />
      )}
    </div>
  );
};

export default InspectionsPage;
