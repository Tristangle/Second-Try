import { Request, Response } from 'express';
import { AppDataSource } from '../../database/database';
import { updateUserAbonnementValidationRequest } from '../../handlers/validators/userAbonnement-validation';
import { UserAbonnementUseCase } from '../usecases/userAbonnement-usecase';

export class UserAbonnementController {
    private userAbonnementUsecase: UserAbonnementUseCase;

    constructor() {
        this.userAbonnementUsecase = new UserAbonnementUseCase(AppDataSource);
    }

    // Create a new UserAbonnement
    async createUserAbonnement(req: Request, res: Response): Promise<Response> {
        try {
            const newUserAbonnement = await this.userAbonnementUsecase.createUserAbonnement(req.body);
            return res.status(201).json(newUserAbonnement);
        } catch (err) {
            return res.status(400).json({ error: "Failed to create UserAbonnement", details: (err as Error).message });
        }
    }

// Update an existing UserAbonnement
async updateUserAbonnement(req: Request, res: Response): Promise<Response> {
    try {
        const userId = parseInt(req.params.userId, 10);
        const updateData: updateUserAbonnementValidationRequest = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }

        // Assurez-vous que `isAnnual` est bien défini, sinon donnez-lui une valeur par défaut.
        const isAnnual = req.body.isAnnual !== undefined ? req.body.isAnnual : false;

        const updatedUserAbonnement = await this.userAbonnementUsecase.updateUserAbonnement(userId, updateData, isAnnual);

        if (!updatedUserAbonnement) {
            return res.status(404).json({ error: 'UserAbonnement not found' });
        }

        return res.status(200).json(updatedUserAbonnement);
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error', details: (err as Error).message });
    }
}



    // Delete an existing UserAbonnement
    async deleteUserAbonnement(req: Request, res: Response): Promise<Response> {
        const userAbonnementId = parseInt(req.params.id, 10);

        try {
            await this.userAbonnementUsecase.deleteUserAbonnement(userAbonnementId);
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: "Failed to delete UserAbonnement", details: (err as Error).message });
        }
    }

    // Get all UserAbonnements
    async getAllUserAbonnements(req: Request, res: Response): Promise<Response> {
        try {
            const allUserAbonnements = await this.userAbonnementUsecase.getAllUserAbonnements();
            return res.status(200).json(allUserAbonnements);
        } catch (err) {
            return res.status(400).json({ error: "Failed to retrieve UserAbonnements", details: (err as Error).message });
        }
    }

    // Get a specific UserAbonnement by userId
    async getUserAbonnementById(req: Request, res: Response): Promise<Response> {
        // Convertir userId en nombre et vérifier la validité
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        try {
            const userAbonnement = await this.userAbonnementUsecase.getAbonnementByUserId(userId);
            if (!userAbonnement) {
                return res.status(404).json({ error: "UserAbonnement not found" });
            }
            return res.status(200).json(userAbonnement);
        } catch (err) {
            return res.status(500).json({ error: "Failed to retrieve UserAbonnement", details: (err as Error).message });
        }
    }
}
export const userAbonnementControllerInstance = new UserAbonnementController();
