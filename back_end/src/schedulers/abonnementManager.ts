import cron from 'node-cron';
import { AppDataSource } from '../database/database';
import { UserAbonnement,UserAbonnementStatus } from '../database/entities/userAbonnement';
import { UserAbonnementUseCase } from '../domain/usecases/userAbonnement-usecase';
import { Abonnement } from '../database/entities/abonnement';
import { LessThanOrEqual } from 'typeorm';

export class AbonnementManager {
    private userAbonnementUseCase: UserAbonnementUseCase;

    constructor() {
        this.userAbonnementUseCase = new UserAbonnementUseCase(AppDataSource);
    }

    start() {
        // Planifier la tâche pour s'exécuter toutes les heures
        cron.schedule('0 * * * *', async () => {
            console.log("Vérification des abonnements expirés...");
            await this.handleExpiredAbonnements();
        });
    }

    private async handleExpiredAbonnements() {
        const userAbonnementRepository = AppDataSource.getRepository(UserAbonnement);
        const abonnementRepository = AppDataSource.getRepository(Abonnement);

        const expiredAbonnements = await userAbonnementRepository.find({
            where: {
                endDate: LessThanOrEqual(new Date()),
                status: UserAbonnementStatus.Active,
            },
            relations: ['user', 'abonnement']
        });

        if (expiredAbonnements.length > 0) {
            console.log(`Trouvé ${expiredAbonnements.length} abonnements expirés.`);

            const freeAbonnement = await abonnementRepository.findOne({ where: { id: 1 } }); // L'abonnement "Free" avec l'id 1

            if (!freeAbonnement) {
                throw new Error("L'abonnement Free n'a pas été trouvé !");
            }

            for (const userAbonnement of expiredAbonnements) {
                await this.userAbonnementUseCase.updateUserAbonnement(userAbonnement.user.id, {
                    abonnementId: freeAbonnement.id,
                    startDate: new Date(),
                    endDate: undefined, // Abonnement Free à vie
                    updatedAt: new Date()
                });

                console.log(`L'abonnement de l'utilisateur ${userAbonnement.user.id} a été mis à jour vers l'abonnement Free.`);
            }
        } else {
            console.log("Aucun abonnement expiré trouvé.");
        }
    }
}

export const abonnementManager = new AbonnementManager();
abonnementManager.start();
