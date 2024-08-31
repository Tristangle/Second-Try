import { Request, Response } from "express";
import { interventionUseCase } from "../usecases/intervention-usecase";
import { AppDataSource } from "../../database/database";
import { createInterventionValidation, updateInterventionValidation, interventionListValidation } from "../../handlers/validators/intervention-validation";

export class interventionController {
    private interventionUsecase: interventionUseCase;

    constructor() {
        this.interventionUsecase = new interventionUseCase(AppDataSource);
    }

    // List Interventions
    async listInterventions(req: Request, res: Response): Promise<Response> {
        try {
            const immobilierId = parseInt(req.params.immobilierId, 10); // Extraire l'ID de l'immobilier des paramètres de la requête

            // Valider les paramètres de la requête
            const { error } = interventionListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            // Configurer les options de filtrage et de pagination
            const listInterventionFilter = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };

            // Appeler le use case pour lister les interventions
            const interventions = await this.interventionUsecase.interventionList(immobilierId, listInterventionFilter);
            return res.status(200).json(interventions);
        } catch (err) {
            // Gérer les erreurs et renvoyer un statut 500 si une exception est levée
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Create Intervention
    async createIntervention(req: Request, res: Response): Promise<Response> {
        try {
            // Valider les données de la requête
            const { error } = createInterventionValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            // Appeler le use case pour créer une nouvelle intervention
            const newIntervention = await this.interventionUsecase.createIntervention(req.body);
            return res.status(201).json(newIntervention);
        } catch (err) {
            // Gérer les erreurs et renvoyer un statut 500 si une exception est levée
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

 // Update Intervention
 async updateIntervention(req: Request, res: Response): Promise<Response> {
    try {
        const interventionId = parseInt(req.params.id, 10); // Extraire l'ID de l'intervention à partir des paramètres de la requête

        // Valider les données de la requête
        const { error } = updateInterventionValidation.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        // Appeler le use case pour mettre à jour l'intervention
        const updatedIntervention = await this.interventionUsecase.updateIntervention(interventionId, req.body);
        if (!updatedIntervention) return res.status(404).json({ error: "Intervention not found" });

        return res.status(200).json(updatedIntervention);
    } catch (err) {
        // Gérer les erreurs et renvoyer un statut 500 si une exception est levée
        return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
    }
}


    // Delete Intervention
    async deleteIntervention(req: Request, res: Response): Promise<Response> {
        try {
            const interventionId = parseInt(req.params.id, 10); // Extraire l'ID de l'intervention à partir des paramètres de la requête

            // Appeler le use case pour supprimer l'intervention
            await this.interventionUsecase.deleteIntervention(interventionId);
            return res.status(204).send(); // No Content, la suppression a été effectuée avec succès
        } catch (err) {
            // Gérer les erreurs et renvoyer un statut 500 si une exception est levée
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
    async processPayment(req: Request, res: Response): Promise<Response> {
        try {
            const { interventionId } = req.params;
            const { userId } = req.body; // Assurez-vous que userId est transmis dans la requête
            console.log("ids :",interventionId, userId)
            const result = await this.interventionUsecase.processPayment(Number(interventionId), userId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: "Erreur lors du traitement du paiement", details: (error as Error).message });
        }
    }
}

// Instance unique de `interventionController` pour être utilisée dans les routes
export const interventionControllerInstance = new interventionController();
