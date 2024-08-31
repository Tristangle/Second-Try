import { Request, Response } from 'express';
import { AppDataSource } from '../../database/database';
import { BannissementUseCase } from '../usecases/bannissement-usecase';
import { createBannissementValidationRequest, updateBannissementValidationRequest } from '../../handlers/validators/bannissement-validation';

export class BannissementController {
    private bannissementUsecase: BannissementUseCase;

    constructor() {
        this.bannissementUsecase = new BannissementUseCase(AppDataSource);
    }

    // Créer un nouveau bannissement
    async createBannissement(req: Request, res: Response): Promise<Response> {
        try {
            const newBannissement = await this.bannissementUsecase.createBannissement(req.body);
            return res.status(201).json(newBannissement);
        } catch (err) {
            return res.status(400).json({ error: "Failed to create Bannissement", details: (err as Error).message });
        }
    }

    // Mettre à jour un bannissement existant
    async updateBannissement(req: Request, res: Response): Promise<Response> {
        try {
            const bannissementId = parseInt(req.params.id, 10);
            const updateData: updateBannissementValidationRequest = req.body;

            if (isNaN(bannissementId)) {
                return res.status(400).json({ error: 'Invalid Bannissement ID' });
            }

            const updatedBannissement = await this.bannissementUsecase.updateBannissement(bannissementId, updateData);

            if (!updatedBannissement) {
                return res.status(404).json({ error: 'Bannissement not found' });
            }

            return res.status(200).json(updatedBannissement);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error', details: (err as Error).message });
        }
    }

    // Supprimer un bannissement existant
    async deleteBannissement(req: Request, res: Response): Promise<Response> {
        const bannissementId = parseInt(req.params.id, 10);

        try {
            await this.bannissementUsecase.deleteBannissement(bannissementId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(400).json({ error: "Failed to delete Bannissement", details: (err as Error).message });
        }
    }

    // Récupérer tous les bannissements
    async getAllBannissements(req: Request, res: Response): Promise<Response> {
        try {
            const allBannissements = await this.bannissementUsecase.getAllBannissements();
            return res.status(200).json(allBannissements);
        } catch (err) {
            return res.status(400).json({ error: "Failed to retrieve Bannissements", details: (err as Error).message });
        }
    }

    // Récupérer un bannissement spécifique par ID
    async getBannissementById(req: Request, res: Response): Promise<Response> {
        const bannissementId = parseInt(req.params.id, 10);

        try {
            const bannissement = await this.bannissementUsecase.getBannissementById(bannissementId);
            if (!bannissement) {
                return res.status(404).json({ error: "Bannissement not found" });
            }
            return res.status(200).json(bannissement);
        } catch (err) {
            return res.status(400).json({ error: "Failed to retrieve Bannissement", details: (err as Error).message });
        }
    }
}

export const bannissementControllerInstance = new BannissementController();
