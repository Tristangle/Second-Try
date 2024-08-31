import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface EditImmobilierModalProps {
  immobilierId: number;
  onClose: () => void;
  onSave: () => void;
}

const EditImmobilierModal: React.FC<EditImmobilierModalProps> = ({ immobilierId, onClose, onSave }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [dailyCost, setDailyCost] = useState<number | string>('');
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [renterId, setRenterId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Pending');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch immobilier data by ID
    axios.get(`http://localhost:3000/api/immobiliers/${immobilierId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const immobilierData = response.data;
        setName(immobilierData.name);
        setDescription(immobilierData.content.description);
        setAdresse(immobilierData.content.adresse);
        setDailyCost(immobilierData.dailyCost);
        setOwnerId(immobilierData.owner?.id || null);
        setRenterId(immobilierData.renter?.id || null);
        setStatus(immobilierData.status || 'Pending');
      })
      .catch(error => {
        console.error('Error fetching immobilier data:', error);
      });

    // Fetch users for owner and renter selection
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
  }, [immobilierId]);

  const handleSave = () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.error('No token found');
      return;
    }
  
    const updatedData: any = {
      name,
      content: {
        description,
        adresse,
      },
      dailyCost: parseFloat(dailyCost as string),
      ownerId,
    };
  
    // Ajoutez renterId seulement s'il n'est pas null et différent de la valeur d'origine
    if (renterId !== null) {
      updatedData.renterId = renterId;
    }
  
    axios.put(`http://localhost:3000/api/immobiliers/${immobilierId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        // Then, handle the status update separately
        let statusRoute = '';
  
        if (status === 'Approved') {
          statusRoute = `/approve`;
        } else if (status === 'Rejected') {
          statusRoute = `/reject`;
        }
  
        if (statusRoute) {
          axios.put(`http://localhost:3000/api/immobiliers/${immobilierId}${statusRoute}`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(() => {
              onSave();
              onClose();
            })
            .catch(error => {
              console.error(`Error updating immobilier status to ${status}:`, error);
            });
        } else {
          onSave();
          onClose();
        }
      })
      .catch(error => {
        console.error('Error updating immobilier:', error);
      });
  };
  

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Immobilier</h2>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>Adresse:</label>
        <input
          type="text"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
        />
        <label>Daily Cost:</label>
        <input
          type="number"
          value={dailyCost}
          onChange={(e) => setDailyCost(e.target.value)}
        />
        <label>Owner:</label>
        <select value={ownerId || ''} onChange={(e) => setOwnerId(Number(e.target.value))}>
          <option value="">Select Owner</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label>Renter:</label>
        <select value={renterId || ''} onChange={(e) => setRenterId(Number(e.target.value))}>
          <option value="">Select Renter</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditImmobilierModal;
