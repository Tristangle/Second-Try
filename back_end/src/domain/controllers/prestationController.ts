import { Request, Response } from "express";
import { prestationUseCase } from "../usecases/prestation-usecase";
import { AppDataSource } from "../../database/database";
import { createPrestationValidation, prestationListValidation, updatePrestationValidation } from "../../handlers/validators/prestation-validation";

export class prestationController {
    private prestationUsecase: prestationUseCase;

    constructor() {
        this.prestationUsecase = new prestationUseCase(AppDataSource);
    }

    // Récupérer toutes les prestations avec pagination
    async getPrestations(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = prestationListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const listRequest = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };

            const prestations = await this.prestationUsecase.getPrestations(listRequest);
            return res.status(200).json(prestations);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
    async getNonExploratorPrestations(req: Request, res: Response): Promise<Response> {
        try {
            const prestations = await this.prestationUsecase.getNonExploratorPrestations();
            return res.status(200).json(prestations);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Récupérer une Prestation par ID
    async getPrestationByID(req: Request, res: Response): Promise<Response> {
        try {
            const prestationId = parseInt(req.params.id, 10);
            const prestation = await this.prestationUsecase.getPrestationByID(prestationId);
            if (!prestation) return res.status(404).json({ error: "Prestation not found" });
            return res.status(200).json(prestation);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Récupérer toutes les Prestations par User ID
    async getPrestationsByUserId(req: Request, res: Response): Promise<Response> {
        try {
            const userId = parseInt(req.params.userId, 10);
            const prestations = await this.prestationUsecase.getPrestationsByUserId(userId);
            return res.status(200).json(prestations);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Créer une Prestation
    async createPrestation(req: Request, res: Response): Promise<Response> {
        try {
            // Valider les données de la requête
            const { error } = createPrestationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            // Appeler le use case pour créer une nouvelle prestation
            const newPrestation = await this.prestationUsecase.createPrestation(req.body);
            return res.status(201).json(newPrestation);
        } catch (err) {
            // Gérer les erreurs et renvoyer un statut 500 si une exception est levée
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Mettre à jour une Prestation
    async updatePrestation(req: Request, res: Response): Promise<Response> {
        try {
            const prestationId = parseInt(req.params.id, 10);  // Extraire l'ID de la prestation à partir des paramètres de la requête

            // Valider les données de la requête
            const { error } = updatePrestationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            // Appeler le use case pour mettre à jour la prestation
            const updatedPrestation = await this.prestationUsecase.updatePrestation(prestationId, req.body);
            if (!updatedPrestation) return res.status(404).json({ error: "Prestation not found" });

            return res.status(200).json(updatedPrestation);
        } catch (err) {
            // Gérer les erreurs et renvoyer un statut 500 si une exception est levée
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Supprimer une Prestation
    async deletePrestation(req: Request, res: Response): Promise<Response> {
        try {
            const prestationId = parseInt(req.params.id, 10);  // Extraire l'ID de la prestation à partir des paramètres de la requête
            
            // Appeler le use case pour supprimer la prestation
            await this.prestationUsecase.deletePrestation(prestationId);
            return res.status(204).send(); // No Content, la suppression a été effectuée avec succès
        } catch (err) {
            // Gérer les erreurs et renvoyer un statut 500 si une exception est levée
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}

// Instance unique de `prestationController` pour être utilisée dans les routes
export const prestationControllerInstance = new prestationController();
