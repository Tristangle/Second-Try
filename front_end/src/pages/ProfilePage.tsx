import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { decodeToken } from './auth/jwtDecode';
import './ProfilePage.css';
import Navbar from '../components/common/Navbar';
const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = decodeToken(token);
        try {
          const response = await axios.get(`http://localhost:3000/api/users/${decoded.userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUsername(response.data.username);
          setEmail(response.data.email);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setMessage('Failed to fetch user profile.');
        }
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      const updateData: any = {};

      // Only include fields that have been updated
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      try {
        await axios.put(`http://localhost:3000/api/users/${decoded.userId}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessage('Profile updated successfully!');
      } catch (error) {
        setMessage('Failed to update profile.');
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <div>
        <Navbar />
      <div className="profile-container">
        <h2>Profile</h2>
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
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>
          {message && <p>{message}</p>}
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
};


export default ProfilePage;
