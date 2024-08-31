import cron from 'node-cron';
import { AppDataSource } from '../database/database';
import { Reservation } from '../database/entities/reservation';
import { Immobilier } from '../database/entities/immobilier';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export class ReservationManager {
    start() {
        // Planifier la tâche pour s'exécuter toutes les heures
        cron.schedule('0 * * * *', async () => {
            console.log("Vérification des réservations en cours...");
            await this.updateRenterIds();
        });
    }

    private async updateRenterIds() {
        const reservationRepository = AppDataSource.getRepository(Reservation);
        const immobilierRepository = AppDataSource.getRepository(Immobilier);

        // Trouver toutes les réservations en cours (dont la date de début est passée et la date de fin n'est pas encore arrivée)
        const currentReservations = await reservationRepository.find({
            where: {
                dateDebut: LessThanOrEqual(new Date()),
                dateFin: MoreThanOrEqual(new Date())
            },
            relations: ['immobilier', 'reserveur']
        });

        for (const reservation of currentReservations) {
            const immobilier = reservation.immobilier;
            if (immobilier) {
                // Mettre à jour le renterId avec l'ID du reserveur
                immobilier.renter = reservation.reserveur;
                await immobilierRepository.save(immobilier);
                console.log(`Renter ID mis à jour pour l'immobilier ID ${immobilier.id}.`);
            }
        }

        // Optionnel : Réinitialiser le renterId pour les immobiliers sans réservation active
        const allImmobiliers = await immobilierRepository.find();
        for (const immobilier of allImmobiliers) {
            const hasActiveReservation = currentReservations.some(
                (reservation) => reservation.immobilier.id === immobilier.id
            );

            if (!hasActiveReservation) {
                immobilier.renter = null;
                await immobilierRepository.save(immobilier);
                console.log(`Renter ID réinitialisé pour l'immobilier ID ${immobilier.id}.`);
            }
        }
    }
}

export const reservationManager = new ReservationManager();
reservationManager.start();
