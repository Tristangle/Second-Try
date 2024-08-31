import { Request, Response } from 'express';
import { UserDocumentUseCase } from '../usecases/userDocument-usecase';
import { AppDataSource } from '../../database/database';

const userDocumentUseCase = new UserDocumentUseCase(AppDataSource);

export class UserDocumentController {
    // Create UserDocument
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const newUserDocument = await userDocumentUseCase.createUserDocument(req.body);
            return res.status(201).json(newUserDocument);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            } else {
                return res.status(400).json({ error: "An unknown error occurred" });
            }
        }
    }

    // Delete UserDocument
    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const userDocumentId = parseInt(req.params.id, 10);
            await userDocumentUseCase.deleteUserDocument(userDocumentId);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            } else {
                return res.status(400).json({ error: "An unknown error occurred" });
            }
        }
    }

    // Get all UserDocuments
    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const userDocuments = await userDocumentUseCase.getAllUserDocuments();
            return res.status(200).json(userDocuments);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            } else {
                return res.status(400).json({ error: "An unknown error occurred" });
            }
        }
    }

    // Get UserDocument by User ID
    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const userId = parseInt(req.params.userId, 10);
            const userDocuments = await userDocumentUseCase.getUserDocumentByUserId(userId);
            if (!userDocuments || userDocuments.length === 0) {
                return res.status(404).json({ error: "No documents found for this user" });
            }
            return res.status(200).json(userDocuments);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            } else {
                return res.status(400).json({ error: "An unknown error occurred" });
            }
        }
    }
}
export const userDocumentControllerInstance = new UserDocumentController();
