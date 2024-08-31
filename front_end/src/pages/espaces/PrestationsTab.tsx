import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PrestationsTab.css';

interface User {
  id: number;
  name: string;
  role: number;
}

interface Prestation {
  id: number;
  type: string;
  description: string;
  cost: number;
  date: string;
  prestataireId: number;
  exploratorOnly: boolean;
}

interface Notation {
  id: number;
  score: number;
  commentaire: string;
  userId: number;
  prestationId: number;
}

interface PrestationsTabProps {
  user: User | null;
}

interface PrestationWithNotations extends Prestation {
  moyenne: number;
  notations: Notation[];
}

const PrestationsTab: React.FC<PrestationsTabProps> = ({ user }) => {
  const [prestations, setPrestations] = useState<PrestationWithNotations[]>([]);
  const [pendingNotations, setPendingNotations] = useState<{ [key: number]: { score: number; commentaire: string } }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPrestationsWithNotations();
    }
  }, [user]);

  const fetchPrestationsWithNotations = async () => {
    try {
      let prestationResponse;
      if (user?.role === 3) {
        prestationResponse = await axios.get('http://localhost:3000/api/prestations', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        prestationResponse = await axios.get('http://localhost:3000/api/prestations/non-explorator', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      const prestationsData: Prestation[] = prestationResponse.data;
      const prestationsWithNotations = await Promise.all(
        prestationsData.map(async (prestation) => {
          const notationsResponse = await axios.get(`http://localhost:3000/api/notations/prestation/${prestation.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const { notations, moyenne } = notationsResponse.data;
          return {
            ...prestation,
            moyenne,
            notations,
          };
        })
      );

      setPrestations(prestationsWithNotations);
    } catch (error) {
      console.error('Erreur lors de la récupération des prestations avec notations:', error);
      setError('Erreur lors de la récupération des prestations avec notations.');
    }
  };

  const handleNotationChange = (prestationId: number, score: number, commentaire: string) => {
    setPendingNotations((prev) => ({
      ...prev,
      [prestationId]: { score, commentaire },
    }));
  };

  const handleSubmit = async (prestationId: number) => {
    const { score, commentaire } = pendingNotations[prestationId] || {};

    if (score === undefined) return;

    try {
      const prestation = prestations.find(p => p.id === prestationId);
      const existingNotation = prestation?.notations.find(notation => notation.prestationId === prestationId && notation.userId === user?.id);

      if (existingNotation) {
        // Mettre à jour la notation existante
        await axios.put(`http://localhost:3000/api/notations/${existingNotation.id}`, {
          score,
          commentaire
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        // Créer une nouvelle notation
        await axios.post('http://localhost:3000/api/notations/create', {
          score,
          commentaire,
          prestationId: Number(prestationId),  // Convertir l'ID en nombre
          userId: Number(user?.id)  // Convertir l'ID en nombre
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      // Rafraîchir les notations après la création ou mise à jour
      fetchPrestationsWithNotations();
      setPendingNotations((prev) => {
        const { [prestationId]: _, ...rest } = prev; // Supprimer la notation soumise de pendingNotations
        return rest;
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la notation:', error);
      setError('Erreur lors de la modification de la notation.');
    }
  };

  return (
    <div className="prestations-tab-container">
      {error && <p className="error-message">{error}</p>}

      <h2>Prestations</h2>
      <div className="prestations-list">
        {prestations.map((prestation) => (
          <div key={prestation.id} className="prestation-card">
            <h3>{prestation.type}</h3>
            <p>Description: {prestation.description}</p>
            <p>Coût: {prestation.cost} €</p>
            <p>Date: {new Date(prestation.date).toLocaleDateString()}</p>
            <p>Moyenne des notes: {prestation.moyenne.toFixed(2)}</p>

            <h4>Commentaires:</h4>
            <ul>
              {prestation.notations.map((notation) => (
                <li key={notation.id}>
                  <strong>{notation.score}/5:</strong> {notation.commentaire}
                </li>
              ))}
            </ul>

            <div className="notation-section">
              <h4>Notez cette prestation</h4>
              <input
                type="number"
                max="5"
                min="0"
                placeholder="Score (0-5)"
                defaultValue={prestation.notations.find(n => n.userId === user?.id)?.score || ''}
                onChange={(e) => handleNotationChange(prestation.id, parseInt(e.target.value), pendingNotations[prestation.id]?.commentaire || '')}
              />
              <textarea
                placeholder="Ajouter un commentaire"
                defaultValue={prestation.notations.find(n => n.userId === user?.id)?.commentaire || ''}
                onChange={(e) => handleNotationChange(prestation.id, pendingNotations[prestation.id]?.score || 0, e.target.value)}
              />
              <button onClick={() => handleSubmit(prestation.id)}>
                Valider
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrestationsTab;
