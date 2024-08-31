import Joi from 'joi';

// Interface pour créer une nouvelle notation
export interface createNotationValidationRequest {
    score: number;
    prestationId: number;
    userId: number;
    commentaire?: string;  
}

// Interface pour mettre à jour une notation existante
export interface updateNotationValidationRequest {
    score?: number;
    prestationId?: number;
    userId?: number;
    commentaire?: string;  
}

// Validation lors de la création d'une nouvelle notation
export const createNotationValidation = Joi.object<createNotationValidationRequest>({
    score: Joi.number().integer().min(1).max(5).required(), 
    prestationId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    commentaire: Joi.string().optional().allow(null, '')  
}).options({ abortEarly: false });

// Validation lors de la mise à jour d'une notation existante
export const updateNotationValidation = Joi.object<updateNotationValidationRequest>({
    score: Joi.number().integer().min(1).max(5).optional(),
    prestationId: Joi.number().integer().optional(),
    userId: Joi.number().integer().optional(),
    commentaire: Joi.string().optional().allow(null, '')  
}).options({ abortEarly: false });
