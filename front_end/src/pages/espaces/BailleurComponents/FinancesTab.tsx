import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './FinancesTab.css'; // Assurez-vous d'avoir ce fichier CSS pour les styles

interface FinanceDetail {
    immobilierId: number;
    amount: number;
    reservationId?: number;
    interventionId?: number;
}

interface FinanceData {
  total: number;
  details: FinanceDetail[];
}

const FinancesTab: React.FC = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<FinanceData | null>(null);
  const [expenseData, setExpenseData] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFinanceData();
    }
  }, [user]);

  const fetchFinanceData = async () => {
    try {
      const [revenueResponse, expenseResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/finances/revenue', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        axios.get('http://localhost:3000/api/finances/expenses', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
      ]);

      setRevenueData({
        total: revenueResponse.data.revenue.totalRevenue,
        details: revenueResponse.data.revenue.details || []
      });

      setExpenseData({
        total: expenseResponse.data.expenses.totalExpenses,
        details: expenseResponse.data.expenses.details || []
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des données financières:', error);
      setError('Erreur lors de la récupération des données financières.');
    }
  };

  return (
    <div className="finances-container">
      <h2>Gestion des Finances</h2>
  
      {error && <p className="error-message">{error}</p>}
  
      <div className="finance-card-container">
        <div className="finance-card">
          <h3>Revenus</h3>
          {revenueData ? (
            <div>
              <p>Total des revenus: {revenueData.total} €</p>
              {revenueData.details.length > 0 ? (
                <ul>
                  {revenueData.details.map((detail) => (
                    <li key={detail.reservationId || detail.immobilierId}>
                      Immobilier ID: {detail.immobilierId}, 
                      {detail.reservationId ? (
                        <>
                          Réservation ID: {detail.reservationId}
                        </>
                      ) : (
                        <>
                          Intervention ID: {detail.interventionId}
                        </>
                      )}
                      , Montant: {detail.amount} €
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucun détail disponible pour les revenus.</p>
              )}
            </div>
          ) : (
            <p>Chargement des revenus...</p>
          )}
        </div>

        <div className="finance-card">
          <h3>Dépenses</h3>
          {expenseData ? (
            <div>
              <p>Total des dépenses: {expenseData.total} €</p>
              {expenseData.details.length > 0 ? (
                <ul>
                  {expenseData.details.map((detail) => (
                    <li key={detail.interventionId || detail.immobilierId}>
                      Immobilier ID: {detail.immobilierId}, 
                      {detail.interventionId ? (
                        <>
                          Intervention ID: {detail.interventionId}
                        </>
                      ) : (
                        <>
                          Réservation ID: {detail.reservationId}
                        </>
                      )}
                      , Montant: {detail.amount} €
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucun détail disponible pour les dépenses.</p>
              )}
            </div>
          ) : (
            <p>Chargement des dépenses...</p>
          )}
        </div>
      </div>
    </div>
  );
};  

export default FinancesTab;
