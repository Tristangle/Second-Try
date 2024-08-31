import React, { useState } from 'react';
import axios from 'axios';
import './DevisTab.css';

const DevisTab: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    immobilierId: '',
    userId: '',
    date: '',
    content: {
      startDate: '',
      endDate: '',
      price: '',
      cautions: '',
      abonnement: '',
      reduction: '',
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      content: {
        ...prevState.content,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/devis/create', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setSuccess("Le devis a été créé avec succès !");
      setError(null);
      console.log('Devis créé:', response.data);

      // Réinitialiser les champs du formulaire
      setFormData({
        name: '',
        immobilierId: '',
        userId: '',
        date: '',
        content: {
          startDate: '',
          endDate: '',
          price: '',
          cautions: '',
          abonnement: '',
          reduction: '',
        },
      });
    } catch (error) {
      setError("Erreur lors de la création du devis.");
      setSuccess(null);
      console.error('Erreur lors de la création du devis:', error);
    }
  };

  return (
    <div className="devis-form-container">
      <h2>Je fais une demande de devis</h2>
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>Nom du devis (Nécessaire)</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>ID de l'immobilier (Nécessaire)</label>
        <input type="number" name="immobilierId" value={formData.immobilierId} onChange={handleChange} required />

        <label>ID de l'utilisateur (Nécessaire)</label>
        <input type="number" name="userId" value={formData.userId} onChange={handleChange} required />

        <label>Date (Nécessaire)</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <h3>Contenu du devis</h3>

        <label>Date de début (Nécessaire)</label>
        <input type="date" name="startDate" value={formData.content.startDate} onChange={handleContentChange} required />

        <label>Date de fin (Nécessaire)</label>
        <input type="date" name="endDate" value={formData.content.endDate} onChange={handleContentChange} required />

        <label>Prix (Nécessaire)</label>
        <input type="number" name="price" value={formData.content.price} onChange={handleContentChange} required />

        <label>Cautions</label>
        <input type="number" name="cautions" value={formData.content.cautions} onChange={handleContentChange} />

        <label>Abonnement (Nécessaire)</label>
        <select name="abonnement" value={formData.content.abonnement} onChange={handleContentChange} required>
          <option value="">Sélectionner un abonnement</option>
          <option value="Free">Free</option>
          <option value="Bag Packer">Bag Packer</option>
          <option value="Explorator">Explorator</option>
        </select>

        <label>Réduction</label>
        <input type="number" name="reduction" value={formData.content.reduction} onChange={handleContentChange} />

        <button type="submit">Soumettre le devis</button>
      </form>
    </div>
  );
};

export default DevisTab;
