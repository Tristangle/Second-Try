import { Request, Response } from "express";
import { immobilierUseCase } from "../usecases/immobilier-usecase";
import { AppDataSource } from "../../database/database";
import { createImmobilierValidation, updateImmobilierValidation, immobilierListValidation } from "../../handlers/validators/immobilier-validation";

export class immobilierController {
    private immobilierUsecase: immobilierUseCase;

    constructor() {
        this.immobilierUsecase = new immobilierUseCase(AppDataSource);
    }

    // List Immobilier
    async listImmobilier(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = immobilierListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const listImmobilierFilter = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };

            const immobilier = await this.immobilierUsecase.immobilierList(listImmobilierFilter);
            return res.status(200).json(immobilier);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Create Immobilier
    async createImmobilier(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createImmobilierValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newImmobilier = await this.immobilierUsecase.createImmobilier(req.body);
            return res.status(201).json(newImmobilier);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Update Immobilier
    async updateImmobilier(req: Request, res: Response): Promise<Response> {
        try {
            const immobilierId = parseInt(req.params.id, 10);
            const { error } = updateImmobilierValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedImmobilier = await this.immobilierUsecase.updateImmobilier(immobilierId, req.body);
            if (!updatedImmobilier) return res.status(404).json({ error: "Immobilier not found" });

            return res.status(200).json(updatedImmobilier);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Delete Immobilier
    async deleteImmobilier(req: Request, res: Response): Promise<Response> {
        try {
            const immobilierId = parseInt(req.params.id, 10);
            await this.immobilierUsecase.deleteImmobilier(immobilierId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const immobilierControllerInstance = new immobilierController();
