import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface CreateBannissementModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateBannissementModal: React.FC<CreateBannissementModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [userId, setUserId] = useState<number | null>(null); // For the user to be banned
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isPermanent, setIsPermanent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]); // For storing the list of users

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch all users for selection in the ban modal
    axios.get('http://localhost:3000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const fetchedUsers = response.data.user; // Assuming response contains a user array
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
    if (!userId) {
      setErrorMessage('Please select a user to ban.');
      return;
    }

    const newBannissementData = {
      userId,
      reason,
      startDate,
      endDate: isPermanent ? undefined : endDate, // If permanent, don't send endDate
      isPermanent,
      initiatedById: user?.id, // Use the userId from the token for initiatedById
    };

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    axios.post('http://localhost:3000/api/bannissements/create', newBannissementData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setErrorMessage(null); // Reset error message on success
        onSave();
        onClose();
      })
      .catch(error => {
        console.error('Error creating bannissement: ', error);
        setErrorMessage(error.response?.data?.details || 'An error occurred while creating the bannissement');
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Bannissement</h2>
        <label>User to Ban:</label>
        <select value={userId || ''} onChange={(e) => setUserId(Number(e.target.value))}>
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username} (ID: {user.id})
            </option>
          ))}
        </select>
        <label>Reason:</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
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
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message if present */}
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateBannissementModal;
