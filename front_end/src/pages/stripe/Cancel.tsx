import React from 'react';
import { Link } from 'react-router-dom';

const CancelPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Paiement Annulé</h1>
      <p>Votre paiement a été annulé. Vous pouvez réessayer de réserver ou revenir à la page d'accueil.</p>
      <Link to="/home" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', borderRadius: '5px' }}>Retour à l'accueil</Link>
    </div>
  );
};

export default CancelPage;
