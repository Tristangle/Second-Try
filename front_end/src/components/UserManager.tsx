import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth/AuthContext';

interface User {
  id: number;
  username: string;
  roles: {
    id: number;
    name: string;
  };
}

const UserManager: React.FC = () => {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      setUsers(response.data.user);
    } catch (error) {
      alert('Error fetching users');
    }
  };

  const updateUserRole = async (userId: number, newRoleId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/users/${userId}/role`, { roleId: parseInt(newRoleId) }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      fetchUsers(); 
    } catch (error) {
      alert('Error updating user role');
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      fetchUsers(); 
    } catch (error) {
      alert('Error deleting user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (!auth.user) {
    return <p>Veuillez vous connecter.</p>;
  }

  return (
    <div>
      <h2>Gestion des utilisateurs</h2>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <p>Username: {user.username}</p>
              <p>Role: {user.roles.name}</p>
              <select value={user.roles.id} onChange={(e) => updateUserRole(user.id, e.target.value)}>
                <option value="1">Admin</option>
                <option value="2">User</option>
                <option value="3">Read-only</option>
              </select>
              <br/>
              <button onClick={() => deleteUser(user.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun utilisateur disponible.</p>
      )}
    </div>
  );
};

export default UserManager;
