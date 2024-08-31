import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar, { CalendarProps } from 'react-calendar'; 
import Navbar from '../components/common/Navbar';
import { decodeToken } from '../pages/auth/jwtDecode';
import './ReservationPage.css';
import 'react-calendar/dist/Calendar.css';
import { loadStripe } from '@stripe/stripe-js';

// Charger la clé publique Stripe
const stripePromise = loadStripe('pk_test_51Ps6lXAcGMX7m0cePCGfrMDcUsXP19crdWYZ5oSx4cet8rVVxglK5v7Q9foNROVgLowG2Y4pf4lDHsqmMhr6oYYI00RVXZ1ITA');

const ReservationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [immobilier, setImmobilier] = useState<any | null>(null);
  const [reservations, setReservations] = useState<any[]>([]); 
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectingEndDate, setSelectingEndDate] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/immobiliers/${id}`)
      .then(response => {
        setImmobilier(response.data);
      })
      .catch(error => {
        console.error('Error fetching immobilier:', error);
      });

    axios.get(`http://localhost:3000/api/reservations/${id}`)
      .then(response => {
        const fetchedReservations = response.data.reservations;
        if (Array.isArray(fetchedReservations)) {
          setReservations(fetchedReservations);
        } else {
          setReservations([]);
        }
      })
      .catch(error => {
        console.error('Error fetching reservations:', error);
      });
  }, [id]);

  const handleReservation = async () => {
    setError(null);
    setSuccess(null);
  
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Vous devez être connecté pour faire une réservation.");
      return;
    }
    const decodedToken = decodeToken(token);
    const reserveurId = decodedToken.userId;
  
    const newStartDate = new Date(dateDebut + 'T00:00:00Z');
    const newEndDate = new Date(dateFin + 'T00:00:00Z');
    const currentDate = new Date();
  
    if (newStartDate < currentDate) {
      setError('Vous ne pouvez pas faire une réservation pour une date passée.');
      return;
    }
  
    const isOverlapping = reservations.some(reservation => {
      const existingStartDate = new Date(reservation.dateDebut);
      const existingEndDate = new Date(reservation.dateFin);
  
      return (newStartDate <= existingEndDate && newEndDate >= existingStartDate);
    });
  
    if (isOverlapping) {
      setError('Les dates sélectionnées chevauchent une réservation existante.');
      return;
    }
  
    try {
      // Créer la réservation et obtenir l'URL de la session de paiement Stripe
      const response = await axios.post('http://localhost:3000/api/reservations/create', {
        dateDebut: newStartDate,
        dateFin: newEndDate,
        reserveurId: reserveurId,
        immobilierId: parseInt(id!),
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
      console.error('Error creating reservation:', error);
      setError('Une erreur est survenue lors de la création de la réservation.');
    }
  };

  const isDateReserved = (date: Date) => {
    return reservations.some(reservation => {
      const startDate = new Date(reservation.dateDebut);
      const endDate = new Date(reservation.dateFin);
      return date >= startDate && date <= endDate;
    });
  };

  const isDateInRange = (date: Date) => {
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    return date >= startDate && date <= endDate;
  };

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value === null) {
      setDateDebut('');
      setDateFin('');
      setSelectingEndDate(false);
    } else if (value instanceof Date) {
      const utcDate = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
      if (!selectingEndDate) {
        setDateDebut(utcDate.toISOString().split('T')[0]);
        setDateFin(''); 
        setSelectingEndDate(true);
      } else {
        if (utcDate < new Date(dateDebut)) {
          setError('La date de fin ne peut pas être antérieure à la date de début.');
          return;
        }
        setDateFin(utcDate.toISOString().split('T')[0]);
        setSelectingEndDate(false);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="reservation-page">
        <h1>Réserver: {immobilier?.name}</h1>
        <p>Adresse: {immobilier?.content?.adresse}</p>
        <p>Description: {immobilier?.content?.description}</p>

        <h2>Calendrier des réservations</h2>
        <Calendar
          tileClassName={({ date, view }) => {
            if (view === 'month' && isDateReserved(date)) {
              return 'reserved-tile';
            }
            if (view === 'month' && isDateInRange(date)) {
              return 'react-calendar__tile--inRange';
            }
            return '';
          }}
          onChange={handleDateChange}
        />

        <h2>Effectuer une nouvelle réservation</h2>
        <div>
          <label>Date de début:</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>
        <div>
          <label>Date de fin:</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button onClick={handleReservation} className="confirm-reservation-button">
          Confirmer la Réservation
        </button>
      </div>
    </div>
  );
};

export default ReservationPage;
