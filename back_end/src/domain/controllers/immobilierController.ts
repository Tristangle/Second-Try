import { Request, Response } from "express";
import { immobilierUseCase } from "../usecases/immobilier-usecase";
import { AppDataSource } from "../../database/database";
import { createImmobilierValidation, updateImmobilierValidation, immobilierListValidation, immobilierListValidationRequest } from "../../handlers/validators/immobilier-validation";
import { getUnit } from "@mui/material/styles/cssUtils";
import { getUserIdFromToken } from "../../handlers/utils/getUserId";

export class immobilierController {
    private immobilierUsecase: immobilierUseCase;

    constructor() {
        this.immobilierUsecase = new immobilierUseCase(AppDataSource);
    }
        // Get Immobilier by ID
        async getImmobilierById(req: Request, res: Response): Promise<Response> {
            try {
                const immobilierId = parseInt(req.params.id, 10);
                const immobilier = await this.immobilierUsecase.getImmobilierById(immobilierId);
    
                if (!immobilier) {
                    return res.status(404).json({ error: "Immobilier not found" });
                }
    
                return res.status(200).json(immobilier);
            } catch (err) {
                return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
            }
        }
async getImmobiliersByOwnerId(req: Request, res: Response): Promise<Response> {
    try {
        // Validation des paramètres de requête
        const { error } = immobilierListValidation.validate(req.query);
        if (error) return res.status(400).json({ error: error.details[0].message });

        // Extraire les paramètres validés
        const listImmobilierFilter: immobilierListValidationRequest = {
            page: parseInt(req.query.page as string) || 1,
            result: parseInt(req.query.result as string) || 10,
        };

        const ownerId = parseInt(req.params.ownerId, 10);

        // Appel du Usecase pour récupérer les biens immobiliers par ownerId avec pagination
        const immobiliers = await this.immobilierUsecase.getImmobiliersByOwnerId(listImmobilierFilter, ownerId);

        if (immobiliers.length === 0) {
            return res.status(404).json({ error: "No properties found for this owner" });
        }

        return res.status(200).json(immobiliers);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
    }
}


    // List Immobilier
    async listImmobilierAdmin(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = immobilierListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const listImmobilierFilter = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };

            const immobilier = await this.immobilierUsecase.immobilierListAdmin(listImmobilierFilter);
            return res.status(200).json(immobilier);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
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
        // Approve Immobilier
        async approveImmobilier(req: Request, res: Response): Promise<Response> {
            try {
                const immobilierId = parseInt(req.params.id, 10);
                const updatedImmobilier = await this.immobilierUsecase.approveImmobilier(immobilierId);
                return res.status(200).json(updatedImmobilier);
            } catch (err) {
                return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
            }
        }
    
        // Reject Immobilier
        async rejectImmobilier(req: Request, res: Response): Promise<Response> {
            try {
                const immobilierId = parseInt(req.params.id, 10);
                const updatedImmobilier = await this.immobilierUsecase.rejectImmobilier(immobilierId);
                return res.status(200).json(updatedImmobilier);
            } catch (err) {
                return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
            }
        }
        async getRevenue(req: Request, res: Response): Promise<Response> {
            try {
                const userId = getUserIdFromToken(req) // Assurez-vous que l'ID de l'utilisateur est récupéré correctement
                const revenue = await this.immobilierUsecase.calculateRevenue(userId!);
                return res.status(200).json({ revenue });
            } catch (error) {
                return res.status(500).json({ error: "Erreur lors du calcul des bénéfices", details: (error as Error).message });
            }
        }
        async getExpenses(req: Request, res: Response): Promise<Response> {
            try {
                const userId = getUserIdFromToken(req); // Assurez-vous que l'ID de l'utilisateur est récupéré correctement
                const expenses = await this.immobilierUsecase.calculateExpenses(userId!);
                return res.status(200).json({ expenses });
            } catch (error) {
                return res.status(500).json({ error: "Erreur lors du calcul des dépenses", details: (error as Error).message });
            }
        }
        async getImmobiliersByRenter(req: Request, res: Response): Promise<Response> {
            try {
                const renterId = parseInt(req.params.renterId);
                const immobiliers = await this.immobilierUsecase.getImmobiliersByRenterId(renterId);
        
                if (immobiliers.length === 0) {
                    return res.status(404).json({ message: 'Aucun immobilier trouvé pour ce locataire.' });
                }
        
                return res.status(200).json(immobiliers);
            } catch (error) {
                return res.status(500).json({ error: 'Erreur lors de la récupération des immobiliers', details: (error as Error).message });
            }
        }
        
        
}
export const immobilierControllerInstance = new immobilierController();
