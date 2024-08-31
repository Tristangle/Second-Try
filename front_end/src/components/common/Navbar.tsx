import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import bannerImage from '../../assets/images/banner.jpg';

const Navbar: React.FC = () => {
  const { logout } = useAuth(); // Récupérer la fonction logout depuis le contexte

  const handleLogout = () => {
    logout(); // Appeler la fonction logout depuis le contexte
    window.location.href = '/login'; // Rediriger vers la page de login après la déconnexion
  };

  return (
    <>
      <nav className="navbar">
        <ul className="navbar-links">
          <li><Link to="/home">Accueil</Link></li>
          <li><Link to="/appartements">Appartements</Link></li>
          <li><Link to="/boutique">Boutique</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li className="dropdown">
            <Link to="#">Espaces</Link>
            <div className="dropdown-content">
              <Link to="/admin">Admin</Link>
              <Link to="/bailleur">Bailleur</Link>
              <Link to="/loueur">Loueur</Link>
            </div>
          </li>
          <li className="dropdown">
            <Link to="#">Profil</Link>
            <div className="dropdown-content">
              <Link to="/profil">Voir Profil</Link>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </li>
        </ul>
      </nav>

      {/* Deuxième bandeau avec le logo et le bouton de profil */}
      <div className="banner-container">
        <img src={bannerImage} alt="Paris-Janitor Banner" className="banner-image" />
      </div>
    </>
  );
};

export default Navbar;
