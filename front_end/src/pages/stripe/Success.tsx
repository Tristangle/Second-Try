import React from 'react';
import { Link } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Paiement Réussi</h1>
      <p>Merci pour votre réservation! Votre paiement a été effectué avec succès.</p>
      <p>Vous recevrez un email de confirmation avec les détails de votre réservation.</p>
      <Link to="/home" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px' }}>Retour à l'accueil</Link>
    </div>
  );
};

export default SuccessPage;
