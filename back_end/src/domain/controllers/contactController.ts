import { Request, Response } from 'express';
import { EmailService } from '../services/EmailService';

export class ContactController {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    async sendContactForm(req: Request, res: Response): Promise<Response> {
        const { email, content } = req.body;

        if (!email || !content) {
            return res.status(400).json({ error: 'Email et message sont requis.' });
        }

        try {
            await this.emailService.sendContactEmail(email, content);
            return res.status(200).json({ message: 'Message envoyé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de l\'envoi du formulaire de contact:', error);
            return res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
        }
    }
}
export const contactControllerInstance = new ContactController();
