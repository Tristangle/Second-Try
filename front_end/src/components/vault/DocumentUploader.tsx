import React, { useState } from 'react';
import axios from 'axios';

interface DocumentUploaderProps {
  onUploadSuccess: () => void;  
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert('Veuillez télécharger un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('text', text);
    formData.append('content', content);
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTitle('');
      setDescription('');
      setText('');
      setContent('');
      setFile(null);
      (event.target as HTMLFormElement).reset();
       
      onUploadSuccess();

    } catch (error) {
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Titre:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Texte:
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Contenu:
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Télécharger un fichier:
          <input
            type="file"
            onChange={handleFileChange}
            required
          />
        </label>
      </div>
      <button type="submit">Soumettre</button>
    </form>
  );
};

export default DocumentUploader;
