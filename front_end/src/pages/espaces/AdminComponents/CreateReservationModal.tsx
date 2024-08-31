import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface CreateReservationModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateReservationModal: React.FC<CreateReservationModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [reserveurId, setReserveurId] = useState<number | null>(null);
  const [immobilierId, setImmobilierId] = useState<number | string>(''); // Permet la saisie manuelle de l'ID immobilier
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch available users for selection
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
  }, []);

  const handleSave = () => {
    if (!reserveurId || !immobilierId) {
      setErrorMessage('Please select a reserveur and enter a valid immobilier ID.');
      return;
    }

    const newReservationData = {
      dateDebut,
      dateFin,
      reserveurId,
      immobilierId: parseInt(immobilierId as string), // Convertir l'ID immobilier en nombre
    };

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    axios.post('http://localhost:3000/api/reservations/admin/create', newReservationData, { // Utilisation de la nouvelle route
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setErrorMessage(null);
        onSave();
        onClose();
      })
      .catch(error => {
        console.error('Error creating reservation: ', error);
        setErrorMessage(error.response?.data?.details || 'An error occurred while creating the reservation');
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Reservation</h2>
        <label>Reserveur:</label>
        <select value={reserveurId || ''} onChange={(e) => setReserveurId(Number(e.target.value))}>
          <option value="">Select Reserveur</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label>Immobilier ID:</label>
        <input
          type="text"
          value={immobilierId}
          onChange={(e) => setImmobilierId(e.target.value)}
          placeholder="Enter Immobilier ID"
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateReservationModal;
