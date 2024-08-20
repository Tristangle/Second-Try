import { Request, Response } from "express";
import { documentUseCase } from "../usecases/document-usecase";
import { AppDataSource } from "../../database/database";
import { documentCreateValidation } from "../../handlers/validators/document-validation";

export class documentController {
    private documentUsecase: documentUseCase;

    constructor() {
        this.documentUsecase = new documentUseCase(AppDataSource);
    }

    // List Documents
    async documentList(req: Request, res: Response): Promise<Response> {
        try {
            const listDocumentFilter = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };
            const documents = await this.documentUsecase.documentList(listDocumentFilter);
            return res.status(200).json(documents);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

// Create Document
async createDocument(req: Request, res: Response): Promise<Response> {
    try {
        const { error } = documentCreateValidation.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        // Crée le document avec un chemin de fichier temporaire
        const tempFileUrl = "documents/temp";
        let newDocument = await this.documentUsecase.createDocument(req.body, tempFileUrl);

        if (!newDocument) {
            return res.status(500).json({ error: "Failed to create document" });
        }

        // Générez le chemin final en utilisant l'ID de l'utilisateur et l'ID du document
        const finalFileUrl = `${process.env.SERVER_URL}:${process.env.PORT}/documents/${newDocument.createdBy.id}/${newDocument.id}`;

        // Met à jour le document avec le chemin de fichier correct
        const updatedDocument = await this.documentUsecase.updateDocument(newDocument.id, { ...req.body, fileUrl: finalFileUrl });

        if (!updatedDocument) {
            return res.status(500).json({ error: "Failed to update document with final file URL" });
        }

        return res.status(201).json(updatedDocument);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
    }
}




    // Update Document
    async updateDocument(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = documentCreateValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const updatedDocument = await this.documentUsecase.updateDocument(parseInt(req.params.id), req.body);
            if (!updatedDocument) return res.status(404).json({ error: "Document not found" });

            return res.status(200).json(updatedDocument);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Delete Document
    async deleteDocument(req: Request, res: Response): Promise<Response> {
        try {
            await this.documentUsecase.deleteDocument(parseInt(req.params.id));
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const documentControllerInstance = new documentController();
