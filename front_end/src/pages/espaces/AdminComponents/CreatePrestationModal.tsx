import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface CreatePrestationModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CreatePrestationModal: React.FC<CreatePrestationModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<number | string>('');
  const [date, setDate] = useState<string>('');
  const [exploratorOnly, setExploratorOnly] = useState<boolean>(false);
  const [interventionId, setInterventionId] = useState<number | null>(null);
  const [prestataireId, setPrestataireId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // État pour gérer le message d'erreur

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch available users for prestataire selection
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

  const [isSaving, setIsSaving] = useState(false);

const handleSave = () => {
  if (isSaving) return; // Empêche d'envoyer la requête si on est déjà en train de sauvegarder

  setIsSaving(true); // Désactive le bouton pour éviter un double clic

  const token = localStorage.getItem('token');

  if (!token) {
    console.error('No token found');
    return;
  }

  const newPrestationData: any = {
    type,
    description,
    cost: parseFloat(cost as string),
    date,
    exploratorOnly,
    prestataireId,
  };

  if (interventionId !== null) {
    newPrestationData.interventionId = interventionId;
  }

  axios.post('http://localhost:3000/api/prestations/create', newPrestationData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(() => {
      setIsSaving(false); // Réactive le bouton après la sauvegarde
      setErrorMessage(null);
      onSave();
      onClose();
    })
    .catch(error => {
      setIsSaving(false); // Réactive le bouton en cas d'erreur
      console.error('Error creating prestation: ', error);
      setErrorMessage(error.response?.data?.details || 'An error occurred while creating the prestation');
    });
};


  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Prestation</h2>
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
        <label>Intervention ID (Optional):</label>
        <input
          type="number"
          value={interventionId || ''}
          onChange={(e) => setInterventionId(Number(e.target.value))}
          placeholder="Leave blank if not applicable"
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Affiche le message d'erreur si présent */}
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePrestationModal;
