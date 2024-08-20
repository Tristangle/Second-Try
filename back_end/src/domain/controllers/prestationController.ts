import { Request, Response } from "express";
import { prestationUseCase } from "../usecases/prestation-usecase";
import { AppDataSource } from "../../database/database";
import { createPrestationValidation, updatePrestationValidation } from "../../handlers/validators/prestation-validation";

export class prestationController {
    private prestationUsecase: prestationUseCase;

    constructor() {
        this.prestationUsecase = new prestationUseCase(AppDataSource);
    }

    // Créer une Prestation
    async createPrestation(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createPrestationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newPrestation = await this.prestationUsecase.createPrestation(req.body);
            return res.status(201).json(newPrestation);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Mettre à jour une Prestation
    async updatePrestation(req: Request, res: Response): Promise<Response> {
        try {
            const prestationId = parseInt(req.params.id, 10);
            const { error } = updatePrestationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedPrestation = await this.prestationUsecase.updatePrestation(prestationId, req.body);
            if (!updatedPrestation) return res.status(404).json({ error: "Prestation not found" });

            return res.status(200).json(updatedPrestation);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Supprimer une Prestation
    async deletePrestation(req: Request, res: Response): Promise<Response> {
        try {
            const prestationId = parseInt(req.params.id, 10);
            await this.prestationUsecase.deletePrestation(prestationId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const prestationControllerInstance = new prestationController();
