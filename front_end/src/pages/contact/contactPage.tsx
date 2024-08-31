import React from 'react';
import Navbar from '../../components/common/Navbar';
import ContactForm from './contactForm';  // Chemin vers votre composant ContactForm

const ContactPage: React.FC = () => {
  return (
    <div>
    <Navbar />
    <div>
      <h1>Contact</h1>
      <ContactForm />
    </div>
    </div>
  );
};

export default ContactPage;
