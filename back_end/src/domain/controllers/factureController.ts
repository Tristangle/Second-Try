import { Request, Response } from "express";
import { factureUseCase } from "../usecases/facture-usecase";
import { AppDataSource } from "../../database/database";
import { createFactureValidation, updateFactureValidation } from "../../handlers/validators/facture-validation";
import { PDFService } from '../services/PDFService';

export class factureController {
    private factureUsecase: factureUseCase;
    
    constructor() {
        this.factureUsecase = new factureUseCase(AppDataSource);
    }

    // Create Facture
    async createFacture(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createFactureValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newFacture = await this.factureUsecase.createFacture(req.body);
            return res.status(201).json(newFacture);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Update Facture
    async updateFacture(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = updateFactureValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedFacture = await this.factureUsecase.updateFacture(parseInt(req.params.id), req.body);
            if (!updatedFacture) return res.status(404).json({ error: "Facture not found" });

            return res.status(200).json(updatedFacture);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
    async downloadFacturePDF(req: Request, res: Response): Promise<Response> {
        try {
            const factureId = parseInt(req.params.id);
            const facture = await this.factureUsecase.getFactureById(factureId);
            if (!facture) {
                return res.status(404).json({ error: "Facture non trouvée" });
            }
    
            const pdfService = new PDFService();
            const pdfBuffer = pdfService.generateInvoicePDF(facture);
    
            res.setHeader('Content-Disposition', `attachment; filename=Facture_${facture.id}.pdf`);
            res.setHeader('Content-Type', 'application/pdf');
            return res.send(Buffer.from(pdfBuffer));
        } catch (err) {
            return res.status(500).json({ error: "Erreur lors du téléchargement de la facture", details: (err as Error).message });
        }
    }
    async getFacturesByUser(req: Request, res: Response): Promise<Response> {
        try {
            const userId = parseInt(req.params.userId);

            const factures = await this.factureUsecase.getFacturesByUserId(userId);
            if (!factures || factures.length === 0) {
                return res.status(404).json({ error: "Aucune facture trouvée pour cet utilisateur." });
            }

            return res.status(200).json(factures);
        } catch (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des factures", details: (err as Error).message });
        }
    }
    

    // Delete Facture
    async deleteFacture(req: Request, res: Response): Promise<Response> {
        try {
            await this.factureUsecase.deleteFacture(parseInt(req.params.id));
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
    
}
export const factureControllerInstance = new factureController();
