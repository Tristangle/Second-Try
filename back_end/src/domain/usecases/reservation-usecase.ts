import { DataSource } from "typeorm";
import { Immobilier } from "../../database/entities/immobilier";
import { Reservation } from "../../database/entities/reservation";
import { User } from "../../database/entities/user";
import { createReservationValidationRequest, updateReservationValidationRequest, reservationListValidationRequest } from "../../handlers/validators/reservation-validation";

export class reservationUseCase {
    constructor(private readonly db: DataSource) {}

    // List Reservations with Pagination
    async reservationList(immobilierId: number,listReservation: reservationListValidationRequest): Promise<{ reservations: Reservation[] }> {
        const query = this.db.getRepository(Reservation)
            .createQueryBuilder('reservation')
            .where('reservation.immobilierId = :immobilierId', { immobilierId })
            .take(listReservation.result);
        
        const listeReservations = await query.getMany();
        return { reservations: listeReservations };
    }

    // Create Reservation
    async createReservation(createReservation: createReservationValidationRequest): Promise<Reservation> {
        const reservationRepository = this.db.getRepository(Reservation);
    
        // Rechercher le reserveur (User)
        const reserveur = await this.db.getRepository(User).findOne({ where: { id: createReservation.reserveurId } });
        if (!reserveur) {
            throw new Error("Reserveur introuvable");
        }
    
        // Rechercher l'immobilier
        const immobilier = await this.db.getRepository(Immobilier).findOne({ where: { id: createReservation.immobilierId } });
        if (!immobilier) {
            throw new Error("Immobilier introuvable");
        }
    
        // Créer la réservation avec les entités associées
        const newReservationData = ({
            ...createReservation,
            reserveur,
            immobilier,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const newReservation = reservationRepository.create(newReservationData);
        return reservationRepository.save(newReservation);
    }
    

    // Update Reservation
    async updateReservation(reservationId: number, updateReservation: updateReservationValidationRequest): Promise<Reservation | null> {
        const reservationRepository = this.db.getRepository(Reservation);
        const reservation = await reservationRepository.findOne({ where: { id: reservationId }, relations: ["reserveur", "immobilier"] });
    
        if (!reservation) {
            return null;
        }
    
        // Si un nouvel immobilierId est fourni, mettre à jour l'immobilier
        if (updateReservation.immobilierId !== undefined) {
            const immobilier = await this.db.getRepository(Immobilier).findOne({ where: { id: updateReservation.immobilierId } });
            if (!immobilier) {
                throw new Error("Immobilier introuvable");
            }
            reservation.immobilier = immobilier;
        }
    
        // Si un nouvel reserveurId est fourni, mettre à jour le reserveur
        if (updateReservation.reserveurId !== undefined) {
            const reserveur = await this.db.getRepository(User).findOne({ where: { id: updateReservation.reserveurId } });
            if (!reserveur) {
                throw new Error("Reserveur introuvable");
            }
            reservation.reserveur = reserveur;
        }
    
        // Mises à jour des autres champs
        Object.assign(reservation, updateReservation, { updatedAt: new Date() });
    
        return await reservationRepository.save(reservation);
    }
    

    // Delete Reservation
    async deleteReservation(reservationId: number): Promise<void> {
        const reservationRepository = this.db.getRepository(Reservation);
        const reservationSearch = await reservationRepository.findOneBy({ id: reservationId });
        
        if (reservationSearch) {
            await reservationRepository.remove(reservationSearch);
        }
    }
}
