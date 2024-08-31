import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppContent from './AppContent';
import Login from './pages/auth/LoginPage';
import Signup from './pages/auth/SignupPage'; 
import ProfilePage from './pages/ProfilePage'; 
import HomePage from './pages/HomePage';
import ApartmentSearchPage from './pages/ApartmentSearchPage'; 
import ReservationPage from './pages/ReservationPage';
import './App.css';
import SuccessPage from './pages/stripe/Success';
import CancelPage from './pages/stripe/Cancel';
import BoutiquePage from './pages/BoutiquePage';
import AdminPage from './pages/espaces/AdminPage';
import BailleurPage from './pages/espaces/BailleurPage';
import ImmobilierPage from './pages/espaces/BailleurComponents/Immobilier/ImmobilierPage';
import MainImmobilierPage from './pages/espaces/BailleurComponents/Immobilier/MainImmobilierPage';
import LoueurPage from './pages/espaces/LoueurPage';
import ContactPage from './pages/contact/contactPage';

// Wrapper component to pass the immobilierId prop
const MainImmobilierPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return <MainImmobilierPage immobilierId={parseInt(id!, 10)} />;
};


const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  console.log("Current auth context:", isAuthenticated);
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/home" element={<HomePage />} />
          <Route path="/app" element={<PrivateRoute element={<AppContent />} />} />
          <Route path="/profil" element={<PrivateRoute element={<ProfilePage />} />} /> 
          <Route path="/boutique" element={<BoutiquePage/>}/>
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/bailleur" element={<PrivateRoute element={<BailleurPage />} />} />
          <Route path="/loueur" element={<PrivateRoute element={<LoueurPage />} />} /> 
          <Route path="/immobiliers/:id/*" element={<PrivateRoute element={<MainImmobilierPageWrapper />} />} />
          <Route path="/appartements" element={<PrivateRoute element={<ApartmentSearchPage />} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reservation/:id" element={<PrivateRoute element={<ReservationPage />} />} /> {/* Route pour la page de réservation */}
          <Route path="*" element={<Navigate to="/home" />} /> 
        </Routes>
      </Router>
    </AuthProvider>
  );
};
 export default App;
