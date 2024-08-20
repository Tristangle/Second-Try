import { Request, Response } from "express";
import { abonnementUseCase } from "../usecases/abonnement-usecase";
import { AppDataSource } from "../../database/database";
import { createAbonnementValidation, updateAbonnementValidation, abonnementListValidation } from "../../handlers/validators/abonnement-validation";

export class abonnementController {
    private abonnementUsecase: abonnementUseCase;

    constructor() {
        this.abonnementUsecase = new abonnementUseCase(AppDataSource);
    }

    // Create Abonnement
    async createAbonnement(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createAbonnementValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newAbonnement = await this.abonnementUsecase.createAbonnement(req.body);
            return res.status(201).json(newAbonnement);
        } catch (err: unknown) {
            const error = err as Error;
            return res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }

    // Update Abonnement
    async updateAbonnement(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = updateAbonnementValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const abonnement = await this.abonnementUsecase.updateAbonnement(parseInt(req.params.id), req.body);
            if (!abonnement) return res.status(404).json({ error: "Abonnement not found" });

            return res.status(200).json(abonnement);
        } catch (err: unknown) {
            const error = err as Error;
            return res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }

    // Delete Abonnement
    async deleteAbonnement(req: Request, res: Response): Promise<Response> {
        try {
            await this.abonnementUsecase.deleteAbonnement(parseInt(req.params.id));
            return res.status(204).send();
        } catch (err: unknown) {
            const error = err as Error;
            return res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }

    // List Abonnements
    async listAbonnements(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = abonnementListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const abonnements = await this.abonnementUsecase.abonnementList(req.query as any);
            return res.status(200).json(abonnements);
        } catch (err: unknown) {
            const error = err as Error;
            return res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }
}
export const abonnementControllerInstance = new abonnementController();
