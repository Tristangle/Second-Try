import { DataSource } from 'typeorm';
import { Bannissement } from '../../database/entities/bannissement';
import { User } from '../../database/entities/user';
import { createBannissementValidation, createBannissementValidationRequest, updateBannissementValidation, updateBannissementValidationRequest } from '../../handlers/validators/bannissement-validation';
import { EmailService } from '../services/EmailService';

export class BannissementUseCase {
    private emailService: EmailService;

    constructor(private readonly db: DataSource) {
        this.emailService = new EmailService();
    }

// Create Bannissement
async createBannissement(createBannissement: createBannissementValidationRequest): Promise<Bannissement> {
    const { error } = createBannissementValidation.validate(createBannissement);
    if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const userRepository = this.db.getRepository(User);
    const bannissementRepository = this.db.getRepository(Bannissement);

    const user = await userRepository.findOne({ where: { id: createBannissement.userId } });
    const initiatedBy = await userRepository.findOne({ where: { id: createBannissement.initiatedById } });

    if (!user || !initiatedBy) {
        throw new Error("User or initiator not found");
    }

    // Check if the user is already banned
    const existingBan = await bannissementRepository.findOne({
        where: {
            user: { id: createBannissement.userId },
        }
    });

    if (existingBan) {
        throw new Error("This user is already banned.");
    }

    const bannissementData = bannissementRepository.create({
        user: user,
        reason: createBannissement.reason,
        startDate: new Date(),  // Automatically set the start date to the current date and time
        endDate: createBannissement.endDate ? new Date(createBannissement.endDate) : undefined,  // Parse endDate correctly if provided
        isPermanent: createBannissement.isPermanent,
        initiatedBy: initiatedBy,
    });

    const newBannissement = await bannissementRepository.save(bannissementData);

    // Optionnel : Envoyer un email de notification à l'utilisateur banni
    await this.emailService.sendBanNotification(user.email, bannissementData);

    return newBannissement;
}


// Update Bannissement
async updateBannissement(bannissementId: number, updateBannissement: updateBannissementValidationRequest): Promise<Bannissement | null> {
    const bannissementRepository = this.db.getRepository(Bannissement);
    
    const bannissement = await bannissementRepository.findOne({
        where: { id: bannissementId },
        relations: ["user", "initiatedBy"]
    });

    if (!bannissement) {
        return null;
    }

    // Mise à jour des champs
    if (updateBannissement.reason !== undefined) {
        bannissement.reason = updateBannissement.reason;
    }
    if (updateBannissement.endDate !== undefined) {
        // Convertir endDate en objet Date si c'est une chaîne de caractères
        bannissement.endDate = new Date(updateBannissement.endDate);
    }
    if (updateBannissement.isPermanent !== undefined) {
        bannissement.isPermanent = updateBannissement.isPermanent;
    }

    const updatedBan = await bannissementRepository.save(bannissement);

    // Envoyer la notification de mise à jour de bannissement
    await this.emailService.sendUpdateBanNotification(
        bannissement.user.email, 
        {
            reason: bannissement.reason, 
            startDate: bannissement.startDate, 
            endDate: bannissement.endDate, 
            isPermanent: bannissement.isPermanent
        }
    );

    return updatedBan;
}

// Delete Bannissement
async deleteBannissement(bannissementId: number): Promise<void> {
    const bannissementRepository = this.db.getRepository(Bannissement);
    const bannissement = await bannissementRepository.findOne({ where: { id: bannissementId }, relations: ["user"] });

    if (bannissement) {
        await bannissementRepository.remove(bannissement);

        // Envoyer la notification de révocation de bannissement
        await this.emailService.sendBanRevocationNotification(bannissement.user.email);
    }
}


    // Get all Bannissements
    async getAllBannissements(): Promise<Bannissement[]> {
        const bannissementRepository = this.db.getRepository(Bannissement);
        return await bannissementRepository.find({ relations: ['user', 'initiatedBy'] });
    }

    // Get a specific Bannissement by ID
    async getBannissementById(bannissementId: number): Promise<Bannissement | null> {
        const bannissementRepository = this.db.getRepository(Bannissement);
        return await bannissementRepository.findOne({
            where: { id: bannissementId },
            relations: ['user', 'initiatedBy']
        });
    }
}
