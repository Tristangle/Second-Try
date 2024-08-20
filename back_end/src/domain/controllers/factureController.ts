import { Request, Response } from "express";
import { factureUseCase } from "../usecases/facture-usecase";
import { AppDataSource } from "../../database/database";
import { createFactureValidation, updateFactureValidation } from "../../handlers/validators/facture-validation";

export class factureController {
    private factureUsecase: factureUseCase;

    constructor() {
        this.factureUsecase = new factureUseCase(AppDataSource);
    }

    // Create Facture
    async createFacture(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createFactureValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newFacture = await this.factureUsecase.createFacture(req.body);
            return res.status(201).json(newFacture);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Update Facture
    async updateFacture(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = updateFactureValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedFacture = await this.factureUsecase.updateFacture(parseInt(req.params.id), req.body);
            if (!updatedFacture) return res.status(404).json({ error: "Facture not found" });

            return res.status(200).json(updatedFacture);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Delete Facture
    async deleteFacture(req: Request, res: Response): Promise<Response> {
        try {
            await this.factureUsecase.deleteFacture(parseInt(req.params.id));
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const factureControllerInstance = new factureController();
