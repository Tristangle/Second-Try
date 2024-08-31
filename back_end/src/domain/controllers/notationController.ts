import { Request, Response } from 'express';
import { AppDataSource } from '../../database/database';
import { NotationUseCase } from '../usecases/notation-usecase';

export class NotationController {
    private notationUsecase: NotationUseCase;

    constructor() {
        this.notationUsecase = new NotationUseCase(AppDataSource);
    }

    // Create a new Notation
    async createNotation(req: Request, res: Response): Promise<Response> {
        try {
            const newNotation = await this.notationUsecase.createNotation(req.body);
            return res.status(201).json(newNotation);
        } catch (err) {
            return res.status(400).json({ error: "Failed to create Notation", details: (err as Error).message });
        }
    }

    // Update an existing Notation
    async updateNotation(req: Request, res: Response): Promise<Response> {
        try {
            const notationId = parseInt(req.params.id, 10);
            const updateData = req.body;

            if (isNaN(notationId)) {
                return res.status(400).json({ error: 'Invalid notationId' });
            }

            const updatedNotation = await this.notationUsecase.updateNotation(notationId, updateData);

            if (!updatedNotation) {
                return res.status(404).json({ error: 'Notation not found' });
            }

            return res.status(200).json(updatedNotation);
        } catch (err) {
            return res.status(500).json({ error: 'Internal Server Error', details: (err as Error).message });
        }
    }

    // Delete an existing Notation
    async deleteNotation(req: Request, res: Response): Promise<Response> {
        const notationId = parseInt(req.params.id, 10);

        try {
            await this.notationUsecase.deleteNotation(notationId);
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: "Failed to delete Notation", details: (err as Error).message });
        }
    }

    // Get all Notations
    async getAllNotations(req: Request, res: Response): Promise<Response> {
        try {
            const allNotations = await this.notationUsecase.getAllNotations();
            return res.status(200).json(allNotations);
        } catch (err) {
            return res.status(400).json({ error: "Failed to retrieve Notations", details: (err as Error).message });
        }
    }

    // Get a specific Notation by ID
    async getNotationById(req: Request, res: Response): Promise<Response> {
        const notationId = parseInt(req.params.id, 10);

        try {
            const notation = await this.notationUsecase.getNotationById(notationId);
            if (!notation) {
                return res.status(404).json({ error: "Notation not found" });
            }
            return res.status(200).json(notation);
        } catch (err) {
            return res.status(400).json({ error: "Failed to retrieve Notation", details: (err as Error).message });
        }
    }
// Get notations by Prestation ID
async getNotationsByPrestationId(req: Request, res: Response): Promise<Response> {
    const prestationId = parseInt(req.params.prestationId, 10);

    try {
        const { notations, moyenne } = await this.notationUsecase.getNotationsByPrestationId(prestationId);
        return res.status(200).json({ notations, moyenne });
    } catch (err) {
        return res.status(400).json({ error: "Failed to retrieve Notations for the Prestation", details: (err as Error).message });
    }
}

        // Get notations by User ID
        async getNotationsByUserId(req: Request, res: Response): Promise<Response> {
            const userId = parseInt(req.params.userId, 10);
    
            try {
                const notations = await this.notationUsecase.getNotationsByUserId(userId);
                return res.status(200).json(notations);
            } catch (err) {
                return res.status(400).json({ error: "Failed to retrieve Notations for the User", details: (err as Error).message });
            }
        }
}

export const notationControllerInstance = new NotationController();
