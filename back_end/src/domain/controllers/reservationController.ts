import { Request, Response } from "express";
import { reservationUseCase } from "../usecases/reservation-usecase";
import { AppDataSource } from "../../database/database";
import { createReservationValidation, updateReservationValidation, reservationListValidation } from "../../handlers/validators/reservation-validation";

export class reservationController {
    private reservationUsecase: reservationUseCase;

    constructor() {
        this.reservationUsecase = new reservationUseCase(AppDataSource);
    }

    // Lister les réservations avec pagination
    async listReservations(req: Request, res: Response): Promise<Response> {
        try {
            const immobilierId = parseInt(req.params.immobilierId, 10);
            const { error } = reservationListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const reservations = await this.reservationUsecase.reservationList(immobilierId, req.query as any);
            return res.status(200).json(reservations);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Créer une réservation
    async createReservation(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createReservationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newReservation = await this.reservationUsecase.createReservation(req.body);
            return res.status(201).json(newReservation);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Mettre à jour une réservation
    async updateReservation(req: Request, res: Response): Promise<Response> {
        try {
            const reservationId = parseInt(req.params.id, 10);
            const { error } = updateReservationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedReservation = await this.reservationUsecase.updateReservation(reservationId, req.body);
            if (!updatedReservation) return res.status(404).json({ error: "Reservation not found" });

            return res.status(200).json(updatedReservation);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Supprimer une réservation
    async deleteReservation(req: Request, res: Response): Promise<Response> {
        try {
            const reservationId = parseInt(req.params.id, 10);
            await this.reservationUsecase.deleteReservation(reservationId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const reservationControllerInstance = new reservationController();
