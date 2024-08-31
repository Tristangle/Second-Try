import React, { useState } from 'react';
import axios from 'axios';
import './contactForm.css';

const ContactForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/contact', {
        email,
        content,
      });

      if (response.status === 200) {
        setMessage('Votre message a été envoyé avec succès.');
        setEmail('');
        setContent('');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi du message.');
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return (
    <div className="contact-form-container">
      <h2>Contactez-nous</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />

        <label>Message</label>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
        />

        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
};

export default ContactForm;
