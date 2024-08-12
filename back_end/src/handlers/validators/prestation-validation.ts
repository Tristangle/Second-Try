import Joi from 'joi';

// Create Prestation Validation Request
export interface createPrestationValidationRequest {
  type: string;
  description: string;
  cost: number;
  date: Date;
  interventionId: number;
  prestataireId: number;
  createdAt: Date;
}

// Create Prestation Validation
export const createPrestationValidation = Joi.object<createPrestationValidationRequest>({
  type: Joi.string().required(),
  description: Joi.string().required(),
  cost: Joi.number().required(),
  date: Joi.date().required(),
  interventionId: Joi.number().integer().required(),
  prestataireId: Joi.number().integer().required(),
  createdAt: Joi.date().required()
});

// Update Prestation Validation Request
export interface updatePrestationValidationRequest {
  type?: string;
  description?: string;
  cost?: number;
  date?: Date;
  interventionId?: number;
  prestataireId?: number;
  updatedAt: Date;
}

// Update Prestation Validation
export const updatePrestationValidation = Joi.object<updatePrestationValidationRequest>({
  type: Joi.string().optional(),
  description: Joi.string().optional(),
  cost: Joi.number().optional(),
  date: Joi.date().optional(),
  interventionId: Joi.number().integer().optional(),
  prestataireId: Joi.number().integer().optional(),
  updatedAt: Joi.date().required()
});
