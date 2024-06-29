import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import AppContent from './AppContent';
import Login from './components/auth/Login';
import './App.css';

const App: React.FC = () => {
  const token = localStorage.getItem('token');

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={token ? <AppContent /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
