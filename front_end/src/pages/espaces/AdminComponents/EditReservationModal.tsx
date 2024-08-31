import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface EditReservationModalProps {
  reservationId: number;
  onClose: () => void;
  onSave: () => void;
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({ reservationId, onClose, onSave }) => {
  const { user } = useAuth();
  const [reserveurId, setReserveurId] = useState<number | null>(null);
  const [immobilierId, setImmobilierId] = useState<number | null>(null);
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch reservation data by ID
    axios.get(`http://localhost:3000/api/reservations/${reservationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const reservationData = response.data;
        setReserveurId(reservationData.reserveurId);
        setImmobilierId(reservationData.immobilierId);
        setDateDebut(reservationData.dateDebut);
        setDateFin(reservationData.dateFin);
      })
      .catch(error => {
        console.error('Error fetching reservation data:', error);
      });

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
  }, [reservationId]);

  const handleSave = () => {
    if (!reserveurId || !immobilierId) {
      setErrorMessage('Please select both a reserveur and an immobilier.');
      return;
    }

    const updatedReservationData = {
      reserveurId,
      immobilierId,
      dateDebut,
      dateFin,
    };

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    axios.put(`http://localhost:3000/api/reservations/${reservationId}`, updatedReservationData, {
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
        console.error('Error updating reservation: ', error);
        setErrorMessage(error.response?.data?.details || 'An error occurred while updating the reservation');
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Reservation</h2>
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
          type="number"
          value={immobilierId || ''}
          onChange={(e) => setImmobilierId(Number(e.target.value))}
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

export default EditReservationModal;
