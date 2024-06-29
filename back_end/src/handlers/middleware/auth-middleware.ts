import { User } from "../../database/entities/user";
import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../../database/database";
import { Token } from "../../database/entities/token";
import { verify } from "jsonwebtoken";

export const authMiddleware = async(req: Request, res: Response, next: NextFunction)=>{

    const tokenRepository = AppDataSource.getRepository(Token);
    const authToken = req.headers.authorization;
    
        if(!authToken){
            return res.status(401).json({"error": "Unauthorized token nul ou vide"});
        }
        const token = authToken.replace(/"/g, '').split(' ')[1];

        const tokenFound = await tokenRepository.findOne({where: {token}});
        if(!tokenFound){
            return res.status(401).json({"error": "Token non trouvé dans la db"})
        }
        
        const secret = process.env.JWT_SECRET ?? "";
        verify(token,secret,(err,user)=>{
            console.log(err);            
            if (err) return res.status(403).json({"error": "Access Forbidden token non valide pour la vérif"});
            (req as any).user = user;
            next();
        });
}


