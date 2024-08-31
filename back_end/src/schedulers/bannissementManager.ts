import cron from 'node-cron';
import { AppDataSource } from '../database/database';
import { Bannissement } from '../database/entities/bannissement';
import { LessThanOrEqual } from 'typeorm';
import { BannissementUseCase } from '../domain/usecases/bannissement-usecase';

export class BannissementManager {
    private bannissementUseCase: BannissementUseCase;

    constructor() {
        this.bannissementUseCase = new BannissementUseCase(AppDataSource);
    }

    start() {
        // Planifier la tâche pour s'exécuter toutes les heures
        cron.schedule('0 * * * *', async () => {
            console.log("Vérification des bannissements expirés...");
            await this.handleExpiredBannissements();
        });
    }

    private async handleExpiredBannissements() {
        const bannissementRepository = AppDataSource.getRepository(Bannissement);

        // Trouver tous les bannissements expirés (ceux dont la date de fin est passée)
        const expiredBannissements = await bannissementRepository.find({
            where: {
                endDate: LessThanOrEqual(new Date()),
                isPermanent: false
            },
            relations: ['user', 'initiatedBy']
        });

        if (expiredBannissements.length > 0) {
            console.log(`Trouvé ${expiredBannissements.length} bannissements expirés.`);

            for (const bannissement of expiredBannissements) {
                await this.bannissementUseCase.deleteBannissement(bannissement.id);
                console.log(`Le bannissement de l'utilisateur ${bannissement.user.id} a été révoqué.`);
            }
        } else {
            console.log("Aucun bannissement expiré trouvé.");
        }
    }
}

export const bannissementManager = new BannissementManager();
bannissementManager.start();
