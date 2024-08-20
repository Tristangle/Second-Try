import Joi from 'joi';

// Create Intervention Validation Request
export interface createInterventionValidationRequest {
  name: string;
  dateDebut: Date;
  dateFin: Date;
  immobilierId: number;
  factureId?: number;
  devisId?: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create Intervention Validation
export const createInterventionValidation = Joi.object<createInterventionValidationRequest>({
  name: Joi.string().required(),
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().required(),
  immobilierId: Joi.number().integer().required(),
  factureId: Joi.number().integer().optional(),
  devisId: Joi.number().integer().optional(),
  price: Joi.number().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

// Update Intervention Validation Request
export interface updateInterventionValidationRequest {
  name?: string;
  dateDebut?: Date;
  dateFin?: Date;
  immobilierId?: number;
  factureId?: number;
  devisId?: number;
  prestations?: number[];
  price?: number;
  updatedAt: Date;
}

// Update Intervention Validation
export const updateInterventionValidation = Joi.object<updateInterventionValidationRequest>({
  name: Joi.string().optional(),
  dateDebut: Joi.date().optional(),
  dateFin: Joi.date().optional(),
  immobilierId: Joi.number().integer().optional(),
  factureId: Joi.number().integer().optional(),
  devisId: Joi.number().integer().optional(),
  prestations: Joi.array().items(Joi.number().integer()).optional(),
  price: Joi.number().optional(),
  updatedAt: Joi.date().optional()
});
// List Interventions with Pagination Validation Request
export interface interventionListValidationRequest {
    page?: number;
    result?: number;
}
  
  // List Interventions with Pagination Validation
export const interventionListValidation = Joi.object<interventionListValidationRequest>({
    page: Joi.number().min(1).optional(),
    result: Joi.number().min(1).optional()
 });