import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface EditUserModalProps {
  userId: number;
  onClose: () => void;
  onSave: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ userId, onClose, onSave }) => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(0);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    // Fetch user data by ID
    axios.get(`http://localhost:3000/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        const userData = response.data;
        setUsername(userData.username);
        setEmail(userData.email);
        setRoleId(userData.role.id);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });

    // Fetch available roles
    axios.get('http://localhost:3000/api/roles', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        console.log('Roles response:', response.data);
        setRoles(response.data.role || []);  // Accès à response.data.role au lieu de response.data.roles
      })
      .catch(error => {
        console.error('Error fetching roles:', error);
      });
  }, [userId]);

  const handleSave = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found');
      return;
    }

    const updatedData: any = {};

    // Add fields to updatedData only if they have been modified
    if (username) updatedData.username = username;
    if (email) updatedData.email = email;
    if (password) updatedData.password = password;

    // Function to update user information
    const updateUser = async () => {
      try {
        if (Object.keys(updatedData).length > 0) {  // Only send if there are updates
          await axios.put(`http://localhost:3000/api/admin/users/${userId}`, updatedData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    };

    // Function to update user role
    const updateUserRole = async () => {
      try {
        if (roleId !== 0) {  // Only send if the role has changed
          await axios.put(`http://localhost:3000/api/userRole/${userId}`, { roleId }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    };

    // Execute update functions and close modal
    Promise.all([updateUser(), updateUserRole()])
      .then(() => {
        onSave();
        onClose();
      })
      .catch(error => {
        console.error('Error saving changes:', error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit User</h2>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
        />
        <label>Role:</label>
        <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))}>
          {roles.length > 0 ? (
            roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))
          ) : (
            <option value="">No roles available</option>
          )}
        </select>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
