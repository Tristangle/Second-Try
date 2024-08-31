import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface EditBannissementModalProps {
  bannissementId: number;
  onClose: () => void;
  onSave: () => void;
}

const EditBannissementModal: React.FC<EditBannissementModalProps> = ({ bannissementId, onClose, onSave }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [endDate, setEndDate] = useState<string>('');
  const [isPermanent, setIsPermanent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    axios.get(`http://localhost:3000/api/bannissements/${bannissementId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const bannissementData = response.data;
        setReason(bannissementData.reason);
        setEndDate(bannissementData.endDate ? new Date(bannissementData.endDate).toISOString().split('T')[0] : '');
        setIsPermanent(bannissementData.isPermanent);
      })
      .catch(error => {
        console.error('Error fetching bannissement data:', error);
        setErrorMessage('Could not fetch bannissement data');
      });
  }, [bannissementId]);

  const handleSave = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    const updatedBannissementData = {
      reason,
      endDate: isPermanent ? undefined : endDate,
      isPermanent,
    };

    axios.put(`http://localhost:3000/api/bannissements/${bannissementId}`, updatedBannissementData, {
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
        console.error('Error updating bannissement: ', error);
        setErrorMessage(error.response?.data?.details || 'An error occurred while updating the bannissement');
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Bannissement</h2>
        <label>Reason:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={isPermanent}
        />
        <label>Permanent:</label>
        <select value={isPermanent ? 'true' : 'false'} onChange={(e) => setIsPermanent(e.target.value === 'true')}>
          <option value="false">Non</option>
          <option value="true">Oui</option>
        </select>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditBannissementModal;
