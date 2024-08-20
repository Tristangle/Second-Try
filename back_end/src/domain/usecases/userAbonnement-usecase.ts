import { AppDataSource } from '../../database/database';
import { UserAbonnement, UserAbonnementStatus } from '../../database/entities/userAbonnement';
import { User } from '../../database/entities/user';
import { Abonnement } from '../../database/entities/abonnement';
import { createUserAbonnementValidation, createUserAbonnementValidationRequest, updateUserAbonnementValidation, updateUserAbonnementValidationRequest } from '../../handlers/validators/userAbonnement-validation';
import { DataSource } from 'typeorm';

export class UserAbonnementUseCase {
    constructor(private readonly db: DataSource) {}

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

        const userAbonnementData =({
            user: user,
            abonnement: abonnement,
            status: createUserAbonnement.status || UserAbonnementStatus.Active,
            startDate: createUserAbonnement.startDate || new Date(),
            endDate: createUserAbonnement.endDate || null,
            createdAt: createUserAbonnement.createdAt || new Date(),
            updatedAt: createUserAbonnement.updatedAt || new Date(),
        });

        return await userAbonnementRepository.save(userAbonnementData);
    }

    async updateUserAbonnement(userId: number, updateUserAbonnement: updateUserAbonnementValidationRequest): Promise<UserAbonnement | null> {
        const { error } = updateUserAbonnementValidation.validate(updateUserAbonnement);
        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }
    
        const userAbonnementRepository = this.db.getRepository(UserAbonnement);
    
        // Trouver l'abonnement actif actuel de l'utilisateur
        const userAbonnement = await userAbonnementRepository.findOne({
            where: { 
                user: { id: userId } 
            }        
        });
    
        if (!userAbonnement) {
            return null;
        }
    
        // Mettre à jour les champs avec les nouvelles données
        Object.assign(userAbonnement, updateUserAbonnement, { updatedAt: new Date() });
    
        return await userAbonnementRepository.save(userAbonnement);
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
    
        // Get a specific UserAbonnement by ID
        async getUserAbonnementById(userAbonnementId: number): Promise<UserAbonnement | null> {
            const userAbonnementRepository = this.db.getRepository(UserAbonnement);
            return await userAbonnementRepository.findOne({
                where: { id: userAbonnementId },
                relations: ['user', 'abonnement']
            });
        }
}
