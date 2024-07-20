import Joi from "joi";
import { User } from "../../database/entities/user";

export interface CreateTacheRequest {
    nom: string;
    description: string;
    date_debut: Date;
    date_fin?: Date;
    type: string;
    createur?: number; 
    executeur: number; 
}
export const createTacheValidation = Joi.object({
    nom: Joi.string().required(),
    description: Joi.string().required(),
    date_debut: Joi.date().required(),
    date_fin: Joi.date().optional(),
    type: Joi.string().required(),
    createur: Joi.number().optional(),
    executeur: Joi.number().required() 
});
  