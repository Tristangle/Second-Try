import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaLink } from 'react-icons/fa';
import './InterventionPage.css';
import { loadStripe } from '@stripe/stripe-js';

interface Prestation {
  id: number;
  type: string;
  description: string;
}

interface InterventionPrestation {
  id: number;
  prestationId: number;
  prestation: Prestation;
}

interface Intervention {
  id: number;
  name: string;
  dateDebut: string;
  dateFin: string;
  price: number;
  prestations: InterventionPrestation[];
  paye: boolean;
}

const InterventionPage: React.FC<{ immobilierId: number }> = ({ immobilierId }) => {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [newIntervention, setNewIntervention] = useState<Partial<Intervention>>({
    name: '',
    dateDebut: '',
    dateFin: '',
    price: 0,
  });
  const [selectedInterventionId, setSelectedInterventionId] = useState<number | null>(null);
  const [selectedPrestationId, setSelectedPrestationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterventions();
    fetchPrestations();
  }, [immobilierId, user]);

  const fetchInterventions = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const response = await axios.get(`http://localhost:3000/api/interventions/${immobilierId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data && Array.isArray(response.data.intervention)) {
            const interventionsWithPrestations = await Promise.all(response.data.intervention.map(async (intervention: any) => {
                const prestationResponse = await axios.get(`http://localhost:3000/api/interventions-prestations/${intervention.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return {
                    ...intervention,
                    prestations: prestationResponse.data || [],
                };
            }));

            setInterventions(interventionsWithPrestations);
        } else {
            console.error('Unexpected response format:', response.data);
            setInterventions([]);
        }
    } catch (error) {
        console.error('Error fetching interventions:', error);
        setInterventions([]);
    }
};


  const fetchPrestations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`http://localhost:3000/api/prestations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setPrestations(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setPrestations([]);
      }
    } catch (error) {
      console.error('Error fetching prestations:', error);
      setPrestations([]);
    }
  };

  const handleAddIntervention = async () => {
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vous devez être connecté pour ajouter une intervention.");
      return;
    }

    if (!newIntervention.name || !newIntervention.dateDebut || !newIntervention.dateFin) {
      setError('Tous les champs sont requis pour ajouter une intervention.');
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/interventions/create`, {
        ...newIntervention,
        immobilierId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchInterventions(); // Rafraîchir les données après ajout
    } catch (error) {
      console.error('Error adding intervention:', error);
      setError('Une erreur est survenue lors de l\'ajout de l\'intervention.');
    }
  };

  const handleDeleteIntervention = async (interventionId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`http://localhost:3000/api/interventions/${interventionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchInterventions(); // Rafraîchir les données après suppression
    } catch (error) {
      console.error('Error deleting intervention:', error);
    }
  };

  const handleAddPrestationToIntervention = async () => {
    if (!selectedInterventionId || !selectedPrestationId) {
      setError("Vous devez sélectionner une intervention et une prestation.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(`http://localhost:3000/api/interventions-prestations/create`, {
        interventionId: selectedInterventionId,
        prestationId: selectedPrestationId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchInterventions(); // Rafraîchir les données après ajout
    } catch (error) {
      console.error('Error adding prestation to intervention:', error);
      setError('Une erreur est survenue lors de l\'ajout de la prestation.');
    }
  };

  const handleDeletePrestationFromIntervention = async (interventionId: string | number, prestationId: string | number) => {
    // Convertir les IDs en nombres
    const interventionIdNum = Number(interventionId);
    const prestationIdNum = Number(prestationId);
    console.log(prestationIdNum, interventionIdNum)
    // Vérifiez que les IDs sont des nombres valides après conversion
    if (isNaN(interventionIdNum) || isNaN(prestationIdNum)) {
        setError("L'ID de l'intervention ou de la prestation est invalide.");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;
    console.log(interventionIdNum, prestationIdNum)
    try {
        await axios.delete(`http://localhost:3000/api/interventions-prestations/${interventionIdNum}/${prestationIdNum}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchInterventions(); // Rafraîchir les données après suppression
    } catch (error) {
        console.error('Error deleting prestation from intervention:', error);
        setError("Une erreur est survenue lors de la suppression de la prestation.");
    }
};
const handlePayment = async (interventionId: number) => {
    setError(null);
    const token = localStorage.getItem('token');
    
    if (!token) {
        setError("Vous devez être connecté pour effectuer un paiement.");
        return;
    }

    if (!user || !user.id) {
        setError("Les informations utilisateur sont manquantes.");
        return;
    }
    if (interventionId === undefined) {
        setError("L'ID de l'intervention est invalide pas de déf.");
        return;
    }

    try {
        const response = await axios.post(
            `http://localhost:3000/api/interventions/${interventionId}/payment`, 
            { userId: user.id }, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { paymentSessionId } = response.data;

        if (!paymentSessionId) {
            setError("Session de paiement non trouvée.");
            return;
        }

        // Redirige vers la page de paiement Stripe
        const stripe = await loadStripe('pk_test_51Ps6lXAcGMX7m0cePCGfrMDcUsXP19crdWYZ5oSx4cet8rVVxglK5v7Q9foNROVgLowG2Y4pf4lDHsqmMhr6oYYI00RVXZ1ITA');
        
        if (stripe) {
            await stripe.redirectToCheckout({ sessionId: paymentSessionId });
        } else {
            setError('Erreur lors de la redirection vers Stripe.');
        }
    } catch (error) {
        console.error('Erreur lors du paiement:', error);
        setError('Une erreur est survenue lors du traitement du paiement.');
    }
};




return (
    <div className="interventions-page">
      <h2>Gestion des Interventions</h2>

      <div className="new-intervention-form">
        <h3>Ajouter une Intervention</h3>
        <input
          type="text"
          placeholder="Nom de l'intervention"
          value={newIntervention.name || ''}
          onChange={(e) => setNewIntervention({ ...newIntervention, name: e.target.value })}
        />
        <input
          type="date"
          placeholder="Date de début"
          value={newIntervention.dateDebut || ''}
          onChange={(e) => setNewIntervention({ ...newIntervention, dateDebut: e.target.value })}
        />
        <input
          type="date"
          placeholder="Date de fin"
          value={newIntervention.dateFin || ''}
          onChange={(e) => setNewIntervention({ ...newIntervention, dateFin: e.target.value })}
        />
        <input
          type="number"
          placeholder="Prix"
          value={newIntervention.price || ''}
          onChange={(e) => setNewIntervention({ ...newIntervention, price: parseFloat(e.target.value) })}
        />
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleAddIntervention}>
          <FaPlus /> Ajouter Intervention
        </button>
      </div>

      <div className="interventions-list">
        <h3>Liste des Interventions</h3>
        {interventions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Prix</th>
                <th>Prestations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((intervention) => (
                <tr key={intervention.id}>
                  <td>{intervention.id}</td>
                  <td>{intervention.name}</td>
                  <td>{new Date(intervention.dateDebut).toLocaleDateString()}</td>
                  <td>{new Date(intervention.dateFin).toLocaleDateString()}</td>
                  <td>{intervention.price} €</td>
                  <td>
                    {intervention.prestations && intervention.prestations.length > 0 ? (
                      intervention.prestations.map((interventionPrestation) => (
                        <div key={interventionPrestation.id}>
                          <p>
                            {interventionPrestation.prestation.type}: {interventionPrestation.prestation.description}
                          </p>
                          <FaTrash
                                className="icon delete-icon"
                                onClick={() => {
                                    const interventionIdNum = Number(intervention.id);
                                    const prestationIdNum = Number(interventionPrestation.prestation?.id || interventionPrestation.prestationId);
                                    if (interventionIdNum && prestationIdNum) {
                                        handleDeletePrestationFromIntervention(interventionIdNum, prestationIdNum);
                                    } else {
                                        setError("Les IDs sélectionnés sont invalides.");
                                    }
                                }}
                            />
                        </div>
                      ))
                    ) : (
                      <p>Aucune prestation associée</p>
                    )}
                  </td>
                  <td>
                    <FaTrash
                      className="icon delete-icon"
                      onClick={() => handleDeleteIntervention(intervention.id)}
                    />
                    {!intervention.paye && (
                      <button className="pay-button" onClick={() => handlePayment(intervention.id)}>
                        Payer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune intervention trouvée.</p>
        )}
      </div>

      <div className="add-prestation-to-intervention">
        <h3>Ajouter une Prestation à une Intervention</h3>
        <select
          value={selectedInterventionId || ''}
          onChange={(e) => setSelectedInterventionId(parseInt(e.target.value, 10))}
        >
          <option value="">Sélectionnez une intervention</option>
          {interventions.map((intervention) => (
            <option key={intervention.id} value={intervention.id}>
              {intervention.name}
            </option>
          ))}
        </select>
        <select
          value={selectedPrestationId || ''}
          onChange={(e) => setSelectedPrestationId(parseInt(e.target.value, 10))}
        >
          <option value="">Sélectionnez une prestation</option>
          {prestations.map((prestation) => (
            <option key={prestation.id} value={prestation.id}>
              {prestation.type} - {prestation.description}
            </option>
          ))}
        </select>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleAddPrestationToIntervention}>
          <FaLink /> Ajouter Prestation
        </button>
      </div>
    </div>
  );
};
export default InterventionPage;
