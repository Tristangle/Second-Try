import Joi from 'joi';

// Create Prestation Validation Request
export interface createPrestationValidationRequest {
  type: string;
  description: string;
  cost: number;
  date: Date;
  exploratorOnly: boolean;
  interventionId?: number; 
  prestataireId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create Prestation Validation
export const createPrestationValidation = Joi.object<createPrestationValidationRequest>({
  type: Joi.string().required(),
  description: Joi.string().required(),
  cost: Joi.number().required(),
  date: Joi.date().required(),
  exploratorOnly : Joi.boolean().required(),
  interventionId: Joi.number().integer().optional(),  // Optional lors de la création
  prestataireId: Joi.number().integer().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

// Update Prestation Validation Request
export interface updatePrestationValidationRequest {
  type?: string;
  description?: string;
  cost?: number;
  date?: Date;
  exploratorOnly?: boolean;
  interventionId?: number;
  prestataireId?: number;
  updatedAt?: Date;
}

// Update Prestation Validation
export const updatePrestationValidation = Joi.object<updatePrestationValidationRequest>({
  type: Joi.string().optional(),
  description: Joi.string().optional(),
  cost: Joi.number().optional(),
  date: Joi.date().optional(),
  exploratorOnly: Joi.boolean().optional(),
  interventionId: Joi.number().integer().optional(),  // Peut être mis à jour
  prestataireId: Joi.number().integer().optional(),
  updatedAt: Joi.date().optional()
});

// Interface pour la requête de pagination des prestations
export interface prestationListValidationRequest {
  page?: number;
  result?: number;
}

// Schéma de validation pour la pagination des prestations
export const prestationListValidation = Joi.object<prestationListValidationRequest>({
  page: Joi.number().min(1).optional(),
  result: Joi.number().min(1).optional()
});