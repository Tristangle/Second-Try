import Joi from 'joi';

// Interfaces pour les requêtes de validation
export interface CreateInterventionPrestationValidationRequest {
  interventionId: number;
  prestationId: number;
}

export interface UpdateInterventionPrestationValidationRequest {
  interventionId?: number;
  prestationId?: number;
  cost?: number;
}

// Schéma de validation pour la création
export const createInterventionPrestationValidation = Joi.object<CreateInterventionPrestationValidationRequest>({
  interventionId: Joi.number().integer().required(),
  prestationId: Joi.number().integer().required()
});

// Schéma de validation pour la mise à jour
export const updateInterventionPrestationValidation = Joi.object<UpdateInterventionPrestationValidationRequest>({
  interventionId: Joi.number().integer().optional(),
  prestationId: Joi.number().integer().optional(),
  cost: Joi.number().optional(),
});
