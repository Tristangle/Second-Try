import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { checkUserRole } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password,
      });

      // Save the token in local storage
      localStorage.setItem('token', response.data.token);

      // Update the user context with the role
      await checkUserRole();

      // Redirect to the app page
      window.location.href = '/home';
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <div className="signup-link">
        <p>Don't have an account? <a href="/signup">Sign up here</a></p>
      </div>
    </div>
  );
};

export default Login;
