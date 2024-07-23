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
    date_fin: Joi.date().required(),
    type: Joi.string().required(),
    createur: Joi.number().optional(),
    executeur: Joi.number().required() 
});

export interface UpdateTacheParams {
    nom?: string;
    description?: string;
    date_debut?: Date;
    date_fin?: Date;
    type?: string;
    createur?: number; // ID du créateur
    executeur?: number; // ID de l'exécuteur
}

export const updateTacheValidation = Joi.object({
    nom: Joi.string().optional(),
    description: Joi.string().optional(),
    date_debut: Joi.date().optional(),
    date_fin: Joi.date().optional(),
    type: Joi.string().optional(),
    createur: Joi.number().optional(),
    executeur: Joi.number().optional()
});