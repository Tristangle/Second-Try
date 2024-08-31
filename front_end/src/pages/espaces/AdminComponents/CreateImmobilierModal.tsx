import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface CreateImmobilierModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateImmobilierModal: React.FC<CreateImmobilierModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [dailyCost, setDailyCost] = useState<number | string>('');
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [renterId, setRenterId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch available users for owner and renter selection
    axios.get('http://localhost:3000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const fetchedUsers = response.data.user; // Récupère le tableau d'utilisateurs sous la clé 'user'

        if (Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers); // Met à jour les utilisateurs uniquement si c'est un tableau
        } else {
          console.error('Unexpected response format for users:', fetchedUsers);
          setUsers([]); // Définir un tableau vide si le format de réponse est inattendu
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setUsers([]); // Définir un tableau vide si l'appel API échoue
      });
  }, []);

  const handleSave = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Créez un nouvel objet sans inclure renterId s'il est null
    const newImmobilierData: any = {
      name,
      content: {
        description,
        adresse,
      },
      dailyCost: parseFloat(dailyCost as string), // Assurez-vous que dailyCost est un nombre
      ownerId,
    };

    // Ajoutez renterId seulement s'il n'est pas null
    if (renterId !== null) {
      newImmobilierData.renterId = renterId;
    }

    // Créer un nouvel immobilier
    axios.post('http://localhost:3000/api/immobiliers/create', newImmobilierData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        onSave();
        onClose();
      })
      .catch(error => {
        console.error('Error creating immobilier: ', error);
      });
};


  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Immobilier</h2>
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
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateImmobilierModal;
