import Joi from 'joi';

// Interface pour la création d'un bannissement
export interface createBannissementValidationRequest {
    userId: number; // Référence à l'utilisateur banni
    reason: string;
    startDate: Date;
    endDate?: Date; // Optionnel, car un bannissement peut être permanent
    isPermanent: boolean;
    initiatedById: number; // Référence à l'administrateur qui a initié le bannissement
}

// Validateur pour la création d'un bannissement
export const createBannissementValidation = Joi.object<createBannissementValidationRequest>({
    userId: Joi.number().integer().required(),
    reason: Joi.string().min(3).max(255).required(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(), // Optionnel si le bannissement est permanent
    isPermanent: Joi.boolean().required(),
    initiatedById: Joi.number().integer().required(),
}).options({ abortEarly: false });

// Interface pour la mise à jour d'un bannissement
export interface updateBannissementValidationRequest {
    reason?: string;
    endDate?: Date; // Optionnel, car un bannissement peut être permanent
    isPermanent?: boolean;
}

// Validateur pour la mise à jour d'un bannissement
export const updateBannissementValidation = Joi.object<updateBannissementValidationRequest>({
    reason: Joi.string().min(3).max(255).optional(),
    endDate: Joi.date().optional(), // Optionnel si le bannissement est permanent
    isPermanent: Joi.boolean().optional(),
}).options({ abortEarly: false });

// Interface pour la liste des bannissements
export interface bannissementListValidationRequest {
    page: number;
    result: number;
}

// Validateur pour la liste des bannissements
export const bannissementListValidation = Joi.object<bannissementListValidationRequest>({
    page: Joi.number().min(1).optional(),
    result: Joi.number().min(1).optional()
});
