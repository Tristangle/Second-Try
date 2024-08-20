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
            const immobilierId = parseInt(req.params.immobilierId, 10);
            const { error } = interventionListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const listInterventionFilter = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };

            const interventions = await this.interventionUsecase.interventionList(immobilierId, listInterventionFilter);
            return res.status(200).json(interventions);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Create Intervention
    async createIntervention(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createInterventionValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newIntervention = await this.interventionUsecase.createIntervention(req.body);
            return res.status(201).json(newIntervention);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Update Intervention
    async updateIntervention(req: Request, res: Response): Promise<Response> {
        try {
            const interventionId = parseInt(req.params.id, 10);
            const { error } = updateInterventionValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedIntervention = await this.interventionUsecase.updateIntervention(interventionId, req.body);
            if (!updatedIntervention) return res.status(404).json({ error: "Intervention not found" });

            return res.status(200).json(updatedIntervention);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Delete Intervention
    async deleteIntervention(req: Request, res: Response): Promise<Response> {
        try {
            const interventionId = parseInt(req.params.id, 10);
            await this.interventionUsecase.deleteIntervention(interventionId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const interventionControllerInstance = new interventionController();
