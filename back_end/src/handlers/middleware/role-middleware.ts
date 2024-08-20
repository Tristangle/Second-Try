import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (...allowedRoles: number[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const auth = req.headers.authorization;
            const authSeparation = auth!.split('.')[1];
            const decodedPayload = Buffer.from(authSeparation, 'base64').toString('utf-8');
            const user = JSON.parse(decodedPayload);
            const userRole = user.roles;

            console.log(`Le rôle de l'utilisateur est ${userRole}`);

            // Vérifie si le rôle de l'utilisateur est parmi les rôles autorisés
            if (!allowedRoles.includes(userRole)) {
                return res.status(401).json({ error: 'Permission insuffisante!' });
            }

            next();
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
        }
    };
};
