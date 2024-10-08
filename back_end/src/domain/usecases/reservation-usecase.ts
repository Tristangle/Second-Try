import { DataSource } from "typeorm";
import { Immobilier } from "../../database/entities/immobilier";
import { Reservation } from "../../database/entities/reservation";
import { User } from "../../database/entities/user";
import { createReservationValidationRequest, updateReservationValidationRequest, reservationListValidationRequest } from "../../handlers/validators/reservation-validation";
import { EmailService } from "../services/EmailService";
import { StripeService } from "../services/stripeService";

export class reservationUseCase {
    private emailService: EmailService;
    private stripeService: StripeService;

    constructor(private readonly db: DataSource) {
        this.emailService = new EmailService();
        this.stripeService = new StripeService();
    }

    // List Reservations with Pagination
    async reservationList(immobilierId: number, listReservation: reservationListValidationRequest): Promise<{ reservations: Reservation[] }> {
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
    if (immobilier.dailyCost === undefined) {
        throw new Error("Le coût journalier de l'immobilier est introuvable.");
    }
    console.log(`Cout de l'immobilier: ${immobilier.dailyCost}`);


    // Calculer le coût total en fonction du dailyCost de l'immobilier et des dates de la réservation
    const differenceInTime = new Date(createReservation.dateFin).getTime() - new Date(createReservation.dateDebut).getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Différence en jours
    const totalCost = differenceInDays * immobilier.dailyCost * 100; // Coût total calculé (multiplié par 100 car Stripe attend des centimes)
    console.log(`Cout TOTAL: ${totalCost}`);
    // Créer la session de paiement avec Stripe
    const successUrl = `${process.env.SERVER_URL}:3001/success`;
    const cancelUrl = `${process.env.SERVER_URL}:3001/cancel`;
    console.log("Tentative de création de la session de paiement Stripe...");
    const paymentSession = await this.stripeService.createCheckoutSession(totalCost, "eur", successUrl, cancelUrl, reserveur.email);
    console.log("Session de paiement Stripe créée:", paymentSession);
    // Créer la réservation avec les entités associées
    const newReservationData = {
        ...createReservation,
        reserveur,
        immobilier,
        totalCost: totalCost / 100, // Stocker le coût total en euros
        paymentSessionId: paymentSession.id, // Ajouter l'ID de la session de paiement
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const newReservation = reservationRepository.create(newReservationData);
    const savedReservation = await reservationRepository.save(newReservation);

    // Envoyer un email de confirmation
    await this.emailService.sendReservationConfirmation(reserveur.email, savedReservation);

    return savedReservation;
}

    // Create Reservation without Stripe
async createReservationWithoutStripe(createReservation: createReservationValidationRequest): Promise<Reservation> {
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
    if (immobilier.dailyCost === undefined) {
        throw new Error("Le coût journalier de l'immobilier est introuvable.");
    }
    console.log(`Cout de l'immobilier: ${immobilier.dailyCost}`);

    // Calculer le coût total en fonction du dailyCost de l'immobilier et des dates de la réservation
    const differenceInTime = new Date(createReservation.dateFin).getTime() - new Date(createReservation.dateDebut).getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Différence en jours
    const totalCost = differenceInDays * immobilier.dailyCost; // Coût total calculé en euros
    console.log(`Cout TOTAL: ${totalCost}`);

    // Créer la réservation avec les entités associées
    const newReservationData = {
        ...createReservation,
        reserveur,
        immobilier,
        totalCost, // Stocker le coût total en euros
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const newReservation = reservationRepository.create(newReservationData);
    const savedReservation = await reservationRepository.save(newReservation);

    // Envoyer un email de confirmation
    await this.emailService.sendReservationConfirmation(reserveur.email, savedReservation);

    return savedReservation;
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

        // Recalculer le coût total si les dates de début ou de fin changent
        if (updateReservation.dateDebut || updateReservation.dateFin) {
            const dateDebut = updateReservation.dateDebut || reservation.dateDebut;
            const dateFin = updateReservation.dateFin || reservation.dateFin;
            
            const differenceInTime = new Date(dateFin).getTime() - new Date(dateDebut).getTime();
            const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
            reservation.totalCost = differenceInDays * reservation.immobilier.dailyCost;
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
