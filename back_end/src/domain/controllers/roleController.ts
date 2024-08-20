import { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { RoleUsecase } from "../usecases/role-usecase";
import { authMiddleware } from "../../handlers/middleware/auth-middleware";
import { roleMiddleware } from "../../handlers/middleware/role-middleware";

export class roleController {
    private roleUsecase: RoleUsecase;

    constructor() {
        this.roleUsecase = new RoleUsecase(AppDataSource);
    }

    async getRoles(req: Request, res: Response): Promise<Response> {
        const { page = 1, result = 10 } = req.query;

        const filter = {
            page: Number(page),
            result: Number(result)
        };

        try {
            const roles = await this.roleUsecase.roleList(filter);
            return res.json(roles);
        } catch (error) {
            console.error('Error fetching roles:', error);
            return res.status(500).json({ message: 'Error fetching roles' });
        }
    }
}

export const roleControllerInstance = new roleController();
