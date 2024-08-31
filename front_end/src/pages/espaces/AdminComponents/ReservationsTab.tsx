import React, { useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EditReservationModal from './EditReservationModal';
import CreateReservationModal from './CreateReservationModal';
import './ReservationsTab.css';

interface Reservation {
  id: number;
  dateDebut: string;
  dateFin: string;
  reserveurId: number;
  immobilierId: number;
  totalCost: number;
  paymentSessionId: string;
}

const ReservationsTab: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [immobilierId, setImmobilierId] = useState<string>('');  // This holds the search input value
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (isNaN(Number(immobilierId))) {
      setErrorMessage('Invalid Immobilier ID');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/reservations/${immobilierId}`);
      if (response.data && response.data.reservations) {
        console.log("Fetched reservations:", response.data.reservations);  // Debugging output
        setReservations(response.data.reservations);
      } else {
        setErrorMessage('No reservations found for this Immobilier ID.');
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setErrorMessage('Error fetching reservations. Please check the Immobilier ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/reservations/${id}`);
      setReservations((prev) => prev.filter((reservation) => reservation.id !== id));
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const handleEdit = (id: number) => {
    setSelectedReservationId(id);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    handleSearch(); // Re-fetch reservations after editing or creating
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="reservations-tab">
      <div className="header">
        <h2>Gestion des Réservations</h2>
        <div className="search-bar">
          <input
            type="text"
            value={immobilierId}
            onChange={(e) => setImmobilierId(e.target.value)}
            placeholder="Enter Immobilier ID"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <FaPlus className="icon add-icon" onClick={handleCreate} />
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {loading ? (
        <p>Chargement...</p>
      ) : reservations.length > 0 ? (
        <table className="reservations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date Début</th>
              <th>Date Fin</th>
              <th>Réserveur ID</th>
              <th>Immobilier ID</th>
              <th>Coût Total</th>
              <th>Session Paiement ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.id}</td>
                <td>{new Date(reservation.dateDebut).toLocaleDateString()}</td>
                <td>{new Date(reservation.dateFin).toLocaleDateString()}</td>
                <td>{reservation.reserveurId}</td>
                <td>{reservation.immobilierId}</td>
                <td>{reservation.totalCost} €</td>
                <td>{reservation.paymentSessionId || 'N/A'}</td>
                <td className="actions">
                  <FaEdit className="icon edit-icon" onClick={() => handleEdit(reservation.id)} />
                  <FaTrash className="icon delete-icon" onClick={() => handleDelete(reservation.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reservations found for this Immobilier ID.</p>
      )}
      {isEditModalOpen && selectedReservationId !== null && (
        <EditReservationModal
          reservationId={selectedReservationId}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {isCreateModalOpen && (
        <CreateReservationModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ReservationsTab;
