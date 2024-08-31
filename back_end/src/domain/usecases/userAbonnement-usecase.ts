import { AppDataSource } from '../../database/database';
import { UserAbonnement, UserAbonnementStatus } from '../../database/entities/userAbonnement';
import { User } from '../../database/entities/user';
import { Abonnement } from '../../database/entities/abonnement';
import { createUserAbonnementValidation, createUserAbonnementValidationRequest, updateUserAbonnementValidation, updateUserAbonnementValidationRequest } from '../../handlers/validators/userAbonnement-validation';
import { DataSource } from 'typeorm';
import { EmailService } from '../services/EmailService';
import { StripeService } from '../services/stripeService';

export class UserAbonnementUseCase {
    private emailService: EmailService;
    private stripeService: StripeService
    constructor(private readonly db: DataSource) {
        this.emailService = new EmailService();
        this.stripeService = new StripeService();
    }

    async createUserAbonnement(createUserAbonnement: createUserAbonnementValidationRequest): Promise<UserAbonnement> {
        const { error } = createUserAbonnementValidation.validate(createUserAbonnement);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }
    
        const userRepository = this.db.getRepository(User);
        const abonnementRepository = this.db.getRepository(Abonnement);
        const userAbonnementRepository = this.db.getRepository(UserAbonnement);
    
        const user = await userRepository.findOne({ where: { id: createUserAbonnement.userId } });
        const abonnement = await abonnementRepository.findOne({ where: { id: createUserAbonnement.abonnementId } });
    
        if (!user || !abonnement) {
            throw new Error("User or Abonnement not found");
        }
    
        // Initialiser les valeurs des prestations restantes
        let remainingMediumPrestations = 0;
        let remainingLimitlessPrestations = 0;
    
        abonnement.benefits.forEach((benefit) => {
            if (benefit.type === "Medium Prestations") {
                remainingMediumPrestations = benefit.value || 0;
            } else if (benefit.type === "Limitless Prestations") {
                remainingLimitlessPrestations = benefit.value || 0;
            }
        });
    
        const userAbonnementData = {
            user: user,
            abonnement: abonnement,
            status: createUserAbonnement.status || UserAbonnementStatus.Active,
            startDate: createUserAbonnement.startDate || new Date(),
            endDate: createUserAbonnement.endDate, 
            remainingMediumPrestations,
            remainingLimitlessPrestations,
            mediumPrestationsCooldownEnd: null, // Initialiser à null
            limitlessPrestationsCooldownEnd: null // Initialiser à null
        };
    
        const newAbonnement = await userAbonnementRepository.save(userAbonnementData);
    
        // Envoyer un email de bienvenue ou de confirmation d'inscription
        await this.emailService.sendAbonnementConfirmation(user.email, abonnement);
    
        return newAbonnement;
    }
    
    
    

    async updateUserAbonnement(userId: number, updateUserAbonnement: updateUserAbonnementValidationRequest, isAnnual: boolean): Promise<UserAbonnement | null> {
        const userAbonnementRepository = this.db.getRepository(UserAbonnement);
        const abonnementRepository = this.db.getRepository(Abonnement);
    
        const userAbonnement = await userAbonnementRepository.findOne({
            where: { 
                user: { id: userId } 
            },
            relations: ["user", "abonnement"]
        });
    
        if (!userAbonnement) {
            return null;
        }
    
        let amount = 0;
        let createPaymentSession = false;
    
        if (updateUserAbonnement.abonnementId !== undefined) {
            const abonnement = await abonnementRepository.findOne({ where: { id: updateUserAbonnement.abonnementId } });
            if (!abonnement) {
                throw new Error("Abonnement introuvable");
            }
    
            userAbonnement.abonnement = abonnement;
    
            // Si l'utilisateur passe à un abonnement payant (id 2 ou 3)
            if (abonnement.id === 2 || abonnement.id === 3) {
                createPaymentSession = true;
                amount = isAnnual ? abonnement.yearPrice * 100 : abonnement.price * 100;
    
                // Vérifier si l'utilisateur renouvelle un abonnement Explorer
                if (isAnnual && abonnement.id === 3) {
                    const existingExplorerAbonnement = await userAbonnementRepository.findOne({
                        where: {
                            user: { id: userId },
                            abonnement: { id: 3 },
                            status: UserAbonnementStatus.Active
                        }
                    });
    
                    if (existingExplorerAbonnement) {
                        amount *= 0.9; // Appliquer une réduction de 10%
                    }
                }
            }
    
            // Réinitialiser les prestations et les dates de fin de cooldown si un nouvel abonnement est sélectionné
            let remainingMediumPrestations = 0;
            let remainingLimitlessPrestations = 0;
            let mediumPrestationsCooldownEnd = null;
            let limitlessPrestationsCooldownEnd = null;
    
            abonnement.benefits.forEach((benefit) => {
                if (benefit.type === "Medium Prestations") {
                    remainingMediumPrestations = benefit.value || 0;
                } else if (benefit.type === "Limitless Prestations") {
                    remainingLimitlessPrestations = benefit.value || 0;
                }
            });
    
            userAbonnement.remainingMediumPrestations = remainingMediumPrestations;
            userAbonnement.remainingLimitlessPrestations = remainingLimitlessPrestations;
            userAbonnement.mediumPrestationsCooldownEnd = mediumPrestationsCooldownEnd;
            userAbonnement.limitlessPrestationsCooldownEnd = limitlessPrestationsCooldownEnd;
        }
    
        // Ajouter du temps à la date de fin de l'abonnement
        if (isAnnual) {
            userAbonnement.endDate = this.addTimeToDate(userAbonnement.endDate || new Date(), 365);
        } else {
            userAbonnement.endDate = this.addTimeToDate(userAbonnement.endDate || new Date(), 30);
        }
    
        // Créer une nouvelle session de paiement si l'utilisateur passe à un abonnement payant
        if (createPaymentSession) {
            const paymentSession = await this.stripeService.createCheckoutSession(
                amount,
                "eur",
                `${process.env.SERVER_URL}:3001/success`,
                `${process.env.SERVER_URL}:3001/cancel`,
                userAbonnement.user.email
            );
            userAbonnement.paymentSessionId = paymentSession.id;
        }
    
        return await userAbonnementRepository.save(userAbonnement);
    }
    
    private addTimeToDate(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    
    
    
    
    

    async deleteUserAbonnement(userAbonnementId: number): Promise<void> {
        const userAbonnementRepository = this.db.getRepository(UserAbonnement);
        const userAbonnement = await userAbonnementRepository.findOne({ where: { id: userAbonnementId } });

        if (userAbonnement) {
            await userAbonnementRepository.remove(userAbonnement);
        }
    }
        // Get all UserAbonnements
        async getAllUserAbonnements(): Promise<UserAbonnement[]> {
            const userAbonnementRepository = this.db.getRepository(UserAbonnement);
            return await userAbonnementRepository.find({ relations: ['user', 'abonnement'] });
        }
    
        async getAbonnementByUserId(userId: number): Promise<UserAbonnement | null> {
            const userAbonnementRepository = this.db.getRepository(UserAbonnement);
            return await userAbonnementRepository.findOne({
              where: { user: { id: userId }},
              relations: ['user', 'abonnement']
            });
          }
          
}
