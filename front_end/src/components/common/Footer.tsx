import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/cgu">Conditions Générales d'Utilisation</Link>
          <Link to="/cgv">Conditions Générales de Vente</Link>
          <Link to="/privacy-policy">Politique de Confidentialité</Link>
        </div>
        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} Paris Janitor. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
