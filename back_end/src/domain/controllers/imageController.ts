import { Request, Response } from "express";
import { imageUseCase } from "../usecases/image-usecase";
import { AppDataSource } from "../../database/database";
import { createImageValidation, imageListValidation } from "../../handlers/validators/image-validation";

export class imageController {
    private imageUsecase: imageUseCase;

    constructor() {
        this.imageUsecase = new imageUseCase(AppDataSource);
    }

    // List Images
    async imageList(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = imageListValidation.validate(req.query);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const immobilierId = parseInt(req.params.immobilierId, 10);
            const listImageFilter = {
                page: parseInt(req.query.page as string) || 1,
                result: parseInt(req.query.result as string) || 10,
            };

            const images = await this.imageUsecase.imageList(immobilierId, listImageFilter);
            return res.status(200).json(images);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Create Image
    async createImage(req: Request, res: Response): Promise<Response> {
        try {
            const { error } = createImageValidation.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const newImage = await this.imageUsecase.createImage(req.body);
            return res.status(201).json(newImage);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }

    // Delete Image
    async deleteImage(req: Request, res: Response): Promise<Response> {
        try {
            const imageId = parseInt(req.params.id, 10);
            await this.imageUsecase.deleteImage(imageId);
            return res.status(204).send(); // No Content
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
        }
    }
}
export const imageControllerInstance = new imageController();
