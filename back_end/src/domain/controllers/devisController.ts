import { Request, Response } from "express";
import { devisUseCase } from "../usecases/devis-usecase";
import { AppDataSource } from "../../database/database";
import { createDevisValidation, updateDevisValidation } from "../../handlers/validators/devis-validation";

export class devisController {
    private devisUsecase: devisUseCase;

    constructor() {
        this.devisUsecase = new devisUseCase(AppDataSource);
    }

    // Create Devis
    async createDevis(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createDevisValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newDevis = await this.devisUsecase.createDevis(req.body);
            return res.status(201).json(newDevis);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Update Devis
    async updateDevis(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = updateDevisValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedDevis = await this.devisUsecase.updateDevis(parseInt(req.params.id), req.body);
            if (!updatedDevis) return res.status(404).json({ error: "Devis not found" });

            return res.status(200).json(updatedDevis);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Delete Devis
    async deleteDevis(req: Request, res: Response): Promise<Response> {
        try {
            await this.devisUsecase.deleteDevis(parseInt(req.params.id));
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const devisControllerInstance = new devisController();
