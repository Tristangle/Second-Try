import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../database/database";
import { Bannissement } from "../../database/entities/bannissement";
import { User } from "../../database/entities/user";

export const banMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const bannissementRepository = AppDataSource.getRepository(Bannissement);
    const userRepository = AppDataSource.getRepository(User);
    const userId = (req as any).user.userId;

    try {
        // Rechercher un bannissement actif pour l'utilisateur
        const activeBan = await bannissementRepository.findOne({
            where: {
                user: { id: userId }
            },
            relations: ["user"]
        });

        if (activeBan) {
            return res.status(403).json({ "error": "Access Forbidden - User is banned" });
        }

        next();
    } catch (error) {
        console.error("Error checking ban status", error);
        return res.status(500).json({ "error": "Internal Server Error" });
    }
};
