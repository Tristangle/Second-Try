import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BoutiquePage.css';
import Navbar from '../components/common/Navbar';
import { decodeToken } from '../pages/auth/jwtDecode';
import { loadStripe } from '@stripe/stripe-js';

// Charger la clé publique Stripe
const stripePromise = loadStripe('pk_test_51Ps6lXAcGMX7m0cePCGfrMDcUsXP19crdWYZ5oSx4cet8rVVxglK5v7Q9foNROVgLowG2Y4pf4lDHsqmMhr6oYYI00RVXZ1ITA');

interface Benefit {
  type: string;
  description: string;
  value?: number;
}

interface Abonnement {
  id: number;
  name: string;
  description: string;
  price: number;
  yearPrice: number;
  benefits: Benefit[];
}

const BoutiquePage: React.FC = () => {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [currentAbonnementId, setCurrentAbonnementId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/abonnements')
      .then(response => {
        setAbonnements(response.data.abonnement);
      })
      .catch(error => {
        console.error('Error fetching abonnements:', error);
      });

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      axios.get(`http://localhost:3000/api/user-abonnements/user/${decoded.userId}`)
        .then(response => {
          setCurrentAbonnementId(response.data.abonnement.id);
        })
        .catch(error => {
          console.error('Error fetching current abonnement:', error);
        });
    }
  }, []);

  const calculateEndDate = (isAnnual: boolean): string => {
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    return endDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  const handleSubscribe = async (abonnementId: number, isAnnual: boolean) => {
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vous devez être connecté pour vous abonner.");
      return;
    }

    const decoded = decodeToken(token);

    try {
      const endDate = calculateEndDate(isAnnual);
      const response = await axios.put(`http://localhost:3000/api/user-abonnements/${decoded.userId}`, {
        abonnementId: abonnementId,
        isAnnual: isAnnual,
        endDate: endDate,
      });

      if (response.data.paymentSessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({
            sessionId: response.data.paymentSessionId,
          });
        } else {
          setError('Erreur lors du chargement de Stripe.');
        }
      } else {
        setError('Erreur lors de la création de la session de paiement.');
      }
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
      setError('Une erreur est survenue lors de la souscription.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="boutique-page">
        <h1>Nos Abonnements</h1>
        <div className="abonnement-container">
          {abonnements.map(abonnement => (
            <div key={abonnement.id} className={`abonnement-card ${currentAbonnementId === abonnement.id ? 'current-abonnement' : ''}`}>
              <h2>{abonnement.name}</h2>
              {currentAbonnementId === abonnement.id && (
                <span className="current-abonnement-indicator">Votre abonnement actuel</span>
              )}
              <p>{abonnement.description}</p>
              <div className="abonnement-pricing">
                <p><strong>Prix Mensuel: </strong>{abonnement.price === 0 ? 'Gratuit' : `${abonnement.price} €`}</p>
                {abonnement.yearPrice > 0 && (
                  <p><strong>Prix Annuel: </strong>{abonnement.yearPrice} €</p>
                )}
              </div>
              <div className="abonnement-benefits">
                <h3>Avantages:</h3>
                <ul>
                  {abonnement.benefits.map((benefit, index) => (
                    <li key={index}>
                      <strong>{benefit.type}: </strong>{benefit.description}
                      {benefit.value && ` (Valeur: ${benefit.value})`}
                    </li>
                  ))}
                </ul>
              </div>
              {abonnement.price > 0 && (
                <div className="abonnement-buttons">
                  <button 
                    className="subscribe-button" 
                    onClick={() => handleSubscribe(abonnement.id, false)}
                  >
                    S'abonner mensuellement
                  </button>
                  <button 
                    className="subscribe-button" 
                    onClick={() => handleSubscribe(abonnement.id, true)}
                  >
                    S'abonner annuellement
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default BoutiquePage;
