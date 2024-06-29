import {NextFunction, Request, Response} from "express"
import { Role } from "../../database/entities/roles";
import { verify } from "jsonwebtoken";


export const roleMiddleware = async(req: Request, res: Response, next: NextFunction)=>{

      const auth = req.headers.authorization;
      const authSeparation = auth!.split('.')[1];
      const decodedPayload = Buffer.from(authSeparation, 'base64').toString('utf-8');
      const user = JSON.parse(decodedPayload);
      const userRole = user.roles;
      console.log(`le role de l'utilisateur est ${userRole}`);
      
    if(userRole != 1){
        return res.status(401).json({"error": "Permission insuffisante !"});    
    }
    next();
}

    


    
