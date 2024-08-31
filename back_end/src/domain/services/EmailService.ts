import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configurer le transporteur SMTP
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // Utilisez vos variables d'environnement
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false, // true pour 465, false pour les autres ports
            auth: {
                user: process.env.SMTP_USER, // Votre email SMTP
                pass: process.env.SMTP_PASS, // Votre mot de passe SMTP
            },
        });
    }

    // Méthode pour envoyer un email de réservation
    async sendReservationConfirmation(userEmail: string, reservationDetails: any): Promise<void> {
        const mailOptions = {
            from: `"Paris Janitor" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Confirmation de votre réservation',
            text: `Merci pour votre réservation. Voici les détails : ${JSON.stringify(reservationDetails)}`,
        };

        await this.transporter.sendMail(mailOptions);
    }

    // Méthode pour envoyer un email de confirmation d'abonnement
    async sendAbonnementConfirmation(userEmail: string, abonnementDetails: any): Promise<void> {
        const mailOptions = {
            from: `"Paris Janitor" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Confirmation de votre abonnement',
            text: `Merci pour votre abonnement. Voici les détails : ${JSON.stringify(abonnementDetails)}`,
        };

        await this.transporter.sendMail(mailOptions);
    }
    async sendAbonnementUpdate(userEmail: string, abonnementDetails: any): Promise<void> {
        const mailOptions = {
            from: `"Paris Janitor" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Votre abonnement a expiré',
            text: `Votre abonnement a expiré, vous repassez à l'abonnement "Free" ! Voici les détails : ${JSON.stringify(abonnementDetails)}`,
        };

        await this.transporter.sendMail(mailOptions);
    }
        // Méthode pour envoyer une notification de bannissement
        async sendBanNotification(userEmail: string, banDetails: { reason: string; startDate: Date; endDate?: Date; isPermanent: boolean }): Promise<void> {
            const endDateMessage = banDetails.isPermanent
                ? 'Ce bannissement est permanent.'
                : `La fin de votre bannissement est prévue pour le ${banDetails.endDate?.toLocaleDateString()}.`;
    
            const mailOptions = {
                from: `"Paris Janitor" <${process.env.SMTP_USER}>`,
                to: userEmail,
                subject: 'Notification de Bannissement',
                text: `Vous avez été banni pour la raison suivante : ${banDetails.reason}.
                
                Date de début : ${banDetails.startDate.toLocaleDateString()}.
            ${endDateMessage}`,
            };
    
            await this.transporter.sendMail(mailOptions);
        }
    // Méthode pour envoyer une notification de mise à jour de bannissement
async sendUpdateBanNotification(userEmail: string, banDetails: { reason?: string; startDate: Date; endDate?: Date; isPermanent?: boolean }): Promise<void> {
    const reasonMessage = banDetails.reason 
        ? `Raison mise à jour : ${banDetails.reason}.` 
        : 'La raison de votre bannissement n\'a pas été modifiée.';
    
    const endDateMessage = banDetails.isPermanent
        ? 'Ce bannissement est désormais permanent.'
        : banDetails.endDate
            ? `La nouvelle date de fin de votre bannissement est prévue pour le ${banDetails.endDate.toLocaleDateString()}.`
            : 'Aucune date de fin n\'a été spécifiée, votre bannissement pourrait être permanent.';
    
    const mailOptions = {
        from: `"Paris Janitor" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Mise à jour de votre bannissement',
        text: `Votre bannissement a été mis à jour.
        
        ${reasonMessage}
        
        Date de début : ${banDetails.startDate.toLocaleDateString()}.
        ${endDateMessage}`,
    };

    await this.transporter.sendMail(mailOptions);
}

// Méthode pour envoyer une notification de révocation de bannissement
async sendBanRevocationNotification(userEmail: string): Promise<void> {
    const mailOptions = {
        from: `"Paris Janitor" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Votre bannissement a été révoqué',
        text: `Votre bannissement a été révoqué. Vous avez maintenant accès complet à nos services. Si vous avez des questions, n'hésitez pas à nous contacter.`,
    };

    await this.transporter.sendMail(mailOptions);
}


    // Méthode pour envoyer un email pour un devis/facture
    async sendInvoiceOrDevis(userEmail: string, documentDetails: any): Promise<void> {
        const mailOptions = {
            from: `"Paris Janitor" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Votre facture / devis',
            text: `Veuillez trouver votre facture / devis ci-joint. Voici les détails : ${JSON.stringify(documentDetails)}`,
        };

        await this.transporter.sendMail(mailOptions);
    }
    async sendContactEmail(userEmail: string, content: string): Promise<void> {
        const mailOptions = {
            from: `"Paris Janitor" <${process.env.SMTP_USER}>`, // Utilisation de l'email de l'administrateur
            to: process.env.ADMIN_EMAIL, // Email de l'administrateur, défini dans les variables d'environnement
            subject: 'Nouveau message de contact',
            text: `Vous avez reçu un nouveau message de contact.\n\nEmail: ${userEmail}\nMessage:\n${content}`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de contact:', error);
            throw new Error('Erreur lors de l\'envoi de l\'email de contact.');
        }
    }
    
}
