import { Request, Response } from "express";
import { InterventionPrestationUseCase } from "../usecases/interventionPrestation-usecase";
import { AppDataSource } from "../../database/database";
import { 
    createInterventionPrestationValidation, 
    updateInterventionPrestationValidation 
} from "../../handlers/validators/interventionPrestation-validation";

export class InterventionPrestationController {
    private interventionPrestationUsecase: InterventionPrestationUseCase;

    constructor() {
        this.interventionPrestationUsecase = new InterventionPrestationUseCase(AppDataSource);
    }

    // Ajouter une Prestation à une Intervention
    async addPrestationToIntervention(req: Request, res: Response): Promise<Response> {
        try {
            // Valider les données de la requête
            const { error } = createInterventionPrestationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            // Ajouter la prestation à l'intervention
            const intervention = await this.interventionPrestationUsecase.addPrestationToIntervention(req.body);
            return res.status(201).json(intervention);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Mettre à jour une association Prestation-Intervention
    async updateInterventionPrestation(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id, 10);  // Extraire l'ID de l'association à partir des paramètres de la requête

            // Valider les données de la requête
            const { error } = updateInterventionPrestationValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            // Mettre à jour l'association
            const updatedInterventionPrestation = await this.interventionPrestationUsecase.updateInterventionPrestation(id, req.body);
            if (!updatedInterventionPrestation) return res.status(404).json({ error: "InterventionPrestation not found" });

            return res.status(200).json(updatedInterventionPrestation);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Supprimer une association Prestation-Intervention
    async removePrestationFromIntervention(req: Request, res: Response): Promise<Response> {
        try {
            const interventionId = parseInt(req.params.interventionId, 10);  // Extraire l'ID de l'intervention
            const prestationId = parseInt(req.params.prestationId, 10);  // Extraire l'ID de la prestation

            // Supprimer l'association entre la prestation et l'intervention
            await this.interventionPrestationUsecase.removePrestationFromIntervention(interventionId, prestationId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Récupérer toutes les Prestations associées à une Intervention
    async getPrestationsForIntervention(req: Request, res: Response): Promise<Response> {
        try {
            const interventionId = parseInt(req.params.interventionId, 10);  // Extraire l'ID de l'intervention

            // Récupérer les prestations associées à l'intervention
            const interventionPrestations = await this.interventionPrestationUsecase.getPrestationsForIntervention(interventionId);
            return res.status(200).json(interventionPrestations);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}

// Instance unique de `InterventionPrestationController` pour être utilisée dans les routes
export const interventionPrestationControllerInstance = new InterventionPrestationController();
