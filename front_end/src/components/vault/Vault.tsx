import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import DocumentUploader from './DocumentUploader';

interface Document {
  id: number;
  title: string;
  description: string;
  text: string;
  content: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const Vault: React.FC = () => {
  const auth = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploader, setShowUploader] = useState(false);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:3000/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      setDocuments(response.data.document);  
    } catch (error) {
      alert('Error fetching documents:');
    }
  };


  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleToggleUploader = () => {
    setShowUploader(!showUploader);
  };

  if (!auth.user) {
    return <p>Veuillez vous connecter.</p>;
  }

  return (
    <div>
      <h2>Coffre-fort numérique</h2>
      {auth.user.role === 'admin' && (
        <div>
          <p>Accès complet pour l'Admin.</p>
          <button onClick={handleToggleUploader}>
            {showUploader ? 'Masquer' : 'Ajouter un fichier'}
          </button>
          {showUploader && <DocumentUploader onUploadSuccess={fetchDocuments} />}
        </div>
      )}
      
      <div>
        <h3>Documents</h3>
        {documents.length > 0 ? (
          <ul>
            {documents.map((doc) => (
              <li key={doc.id}>
                <h4>{doc.title}</h4>
                <h4>{doc.content}</h4>
                <h4>{doc.description}</h4>
                <p>{doc.text}</p>
                <a href={`http://localhost:3000/uploads/${doc.fileUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                  Télécharger le fichier
                </a>
                <p>Créé le: {new Date(doc.createdAt).toLocaleDateString()}</p>
                <p>Mis à jour le: {new Date(doc.updatedAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun document disponible.</p>
        )}
      </div>
    </div>
  );
};

export default Vault;
