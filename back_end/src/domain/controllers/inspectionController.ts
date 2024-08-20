import { Request, Response } from "express";
import { inspectionUseCase } from "../usecases/inspection-usecase";
import { AppDataSource } from "../../database/database";
import { createInspectionValidation, updateInspectionValidation, inspectionListValidation } from "../../handlers/validators/inspection-validation";

export class inspectionController {
    private inspectionUsecase: inspectionUseCase;

    constructor() {
        this.inspectionUsecase = new inspectionUseCase(AppDataSource);
    }

    // List Inspections
    async listInspections(req: Request, res: Response): Promise<Response> {
        try {
            const immobilierId = parseInt(req.params.immobilierId, 10);
            const { error } = inspectionListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const listInspectionFilter = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };

            const inspections = await this.inspectionUsecase.inspectionList(immobilierId, listInspectionFilter);
            return res.status(200).json(inspections);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Create Inspection
    async createInspection(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createInspectionValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newInspection = await this.inspectionUsecase.createInspection(req.body);
            return res.status(201).json(newInspection);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Update Inspection
    async updateInspection(req: Request, res: Response): Promise<Response> {
        try {
            const inspectionId = parseInt(req.params.id, 10);
            const { error } = updateInspectionValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedInspection = await this.inspectionUsecase.updateInspection(inspectionId, req.body);
            if (!updatedInspection) return res.status(404).json({ error: "Inspection not found" });

            return res.status(200).json(updatedInspection);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Delete Inspection
    async deleteInspection(req: Request, res: Response): Promise<Response> {
        try {
            const inspectionId = parseInt(req.params.id, 10);
            await this.inspectionUsecase.deleteInspection(inspectionId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const inspectionControllerInstance = new inspectionController();
