import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface EditPrestationModalProps {
  prestationId: number;
  onClose: () => void;
  onSave: () => void;
}

const EditPrestationModal: React.FC<EditPrestationModalProps> = ({ prestationId, onClose, onSave }) => {
  const { user } = useAuth();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<number | string>('');
  const [date, setDate] = useState<string>('');
  const [exploratorOnly, setExploratorOnly] = useState<boolean>(false);
  const [interventionId, setInterventionId] = useState<number | null>(null);
  const [prestataireId, setPrestataireId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch prestation data by ID
    axios.get(`http://localhost:3000/api/prestations/${prestationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const prestationData = response.data;
        setType(prestationData.type);
        setDescription(prestationData.description);
        setCost(prestationData.cost);
        setDate(prestationData.date);
        setExploratorOnly(prestationData.exploratorOnly);
        setInterventionId(prestationData.interventionId || null);
        setPrestataireId(prestationData.prestataireId || null);
      })
      .catch(error => {
        console.error('Error fetching prestation data:', error);
      });

    // Fetch users for prestataire selection
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
  }, [prestationId]);

  const handleSave = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Préparez les données à mettre à jour sans inclure les champs facultatifs s'ils sont null
    const updatedData: any = {
      type,
      description,
      cost: parseFloat(cost as string),
      date,
      exploratorOnly,
    };

    if (interventionId !== null) {
      updatedData.interventionId = interventionId;
    }

    if (prestataireId !== null) {
      updatedData.prestataireId = prestataireId;
    }

    // Update prestation information
    axios.put(`http://localhost:3000/api/prestations/${prestationId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        onSave();
        onClose();
      })
      .catch(error => {
        console.error('Error updating prestation:', error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Prestation</h2>
        <label>Type:</label>
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>Coût:</label>
        <input
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <label>Explorator Only:</label>
        <select value={exploratorOnly ? 'true' : 'false'} onChange={(e) => setExploratorOnly(e.target.value === 'true')}>
          <option value="false">Non</option>
          <option value="true">Oui</option>
        </select>
        <label>Prestataire:</label>
        <select value={prestataireId || ''} onChange={(e) => setPrestataireId(Number(e.target.value))}>
          <option value="">Select Prestataire</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditPrestationModal;
