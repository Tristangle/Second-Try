import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import './EditInspectionModal.css'

interface EditInspectionModalProps {
  inspectionId: number;
  immobilierId: number;
  onClose: () => void;
  onSave: () => void;
}

interface User {
  id: number;
  username: string;
}

const EditInspectionModal: React.FC<EditInspectionModalProps> = ({ inspectionId, immobilierId, onClose, onSave }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [details, setDetails] = useState('');
  const [inspectorId, setInspectorId] = useState<number | null>(null);
  const [renterId, setRenterId] = useState<number | null>(null);
  const [validation, setValidation] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch inspection data by ID
    axios.get(`http://localhost:3000/api/inspections/${inspectionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const inspectionData = response.data;
        setName(inspectionData.name);
        setDateDebut(inspectionData.dateDebut.split('T')[0]); // Only keep the date part
        setDateFin(inspectionData.dateFin.split('T')[0]); // Only keep the date part
        setDetails(inspectionData.details);
        setInspectorId(inspectionData.inspectorId || null);
        setRenterId(inspectionData.renterId || null);
        setValidation(inspectionData.validation);
      })
      .catch(error => {
        console.error('Error fetching inspection data:', error);
      });

    // Fetch users for inspector and renter selection
    axios.get('http://localhost:3000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const fetchedUsers = response.data.user;

        if (Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers);
        } else {
          console.error('Unexpected response format for users:', fetchedUsers);
          setUsers([]);
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setUsers([]);
      });
  }, [inspectionId]);

  const handleSave = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    const updatedData = {
      name,
      dateDebut,
      dateFin,
      immobilierId,
      inspectorId,
      renterId,
      validation,
      details,
    };

    axios.put(`http://localhost:3000/api/inspections/${inspectionId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        onSave();
        onClose();
      })
      .catch(error => {
        console.error('Error updating inspection:', error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Inspection</h2>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Date Début:</label>
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />
        <label>Date Fin:</label>
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
        />
        <label>Details:</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <label>Inspecteur:</label>
        <select value={inspectorId || ''} onChange={(e) => setInspectorId(Number(e.target.value))}>
          <option value="">Select Inspector</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label>Locataire:</label>
        <select value={renterId || ''} onChange={(e) => setRenterId(Number(e.target.value))}>
          <option value="">Select Renter</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label>Validation:</label>
        <select value={validation ? 'true' : 'false'} onChange={(e) => setValidation(e.target.value === 'true')}>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditInspectionModal;
