import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import EditUserModal from './EditUserModal'; 
import './UsersTab.css';
import './EditUserModal.css'; 

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:3000/api/users')
      .then(response => {
        const data = response.data;
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.user && Array.isArray(data.user)) {
          setUsers(data.user);
        } else {
          console.error('Unexpected data format:', data);
          setUsers([]);
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setUsers([]);
      });
  };

  const handleEdit = (userId: number) => {
    console.log('Edit user with ID:', userId); // Debugging line
    setSelectedUserId(userId);
    setEditModalOpen(true);
  };

  const handleDelete = (userId: number) => {
    console.log('Delete user with ID:', userId); // Debugging line
    axios.delete(`http://localhost:3000/api/users/${userId}`)
      .then(() => {
        setUsers(users.filter(user => user.id !== userId));
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  const handleSave = () => {
    console.log('Save triggered'); // Debugging line
    setEditModalOpen(false);
    fetchUsers(); // Refresh the user list after saving changes
  };

  return (
    <div>
        <div className="header">
        <h2>Gestion des Utilisateurs</h2>
        </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role?.name}</td>
              <td>
                <FaEdit 
                  className="icon" 
                  onClick={() => handleEdit(user.id)} 
                  style={{ cursor: 'pointer' }} // Ensure the cursor changes to indicate it's clickable
                />
                <FaTrash 
                  className="icon" 
                  onClick={() => handleDelete(user.id)} 
                  style={{ cursor: 'pointer' }} // Ensure the cursor changes to indicate it's clickable
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditModalOpen && selectedUserId !== null && (
        <EditUserModal
          userId={selectedUserId}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default UsersTab;
