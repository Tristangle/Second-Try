import Joi from 'joi';

// Create Immobilier Validation Request
export interface createImmobilierValidationRequest {
  name: string;
  content: {
    description: string;
    adresse: string;
  };
  ownerId: number;
  renterId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create Immobilier Validation
export const createImmobilierValidation = Joi.object<createImmobilierValidationRequest>({
  name: Joi.string().required(),
  content: Joi.object({
    description: Joi.string().required(),
    adresse: Joi.string().required()
  }).required(),
  ownerId: Joi.number().integer().required(),
  renterId: Joi.number().integer().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

// Update Immobilier Validation Request
export interface updateImmobilierValidationRequest {
  name?: string;
  content?: {
    description?: string;
    adresse?: string;
  };
  ownerId?: number;
  renterId?: number;
  factures?: number[];
  devis?: number[];
  interventions?: number[];
  reservations?: number[];
  inspections?: number[];
  images?: {
    url: string;
  }[];
  updatedAt: Date;
}

// Update Immobilier Validation
export const updateImmobilierValidation = Joi.object<updateImmobilierValidationRequest>({
  name: Joi.string().optional(),
  content: Joi.object({
    description: Joi.string().optional(),
    adresse: Joi.string().optional()
  }).optional(),
  ownerId: Joi.number().integer().optional(),
  renterId: Joi.number().integer().optional(),
  factures: Joi.array().items(Joi.number().integer()).optional(),
  devis: Joi.array().items(Joi.number().integer()).optional(),
  interventions: Joi.array().items(Joi.number().integer()).optional(),
  reservations: Joi.array().items(Joi.number().integer()).optional(),
  inspections: Joi.array().items(Joi.number().integer()).optional(),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().optional()
  })).optional(),
  updatedAt: Joi.date().optional()
});
// List Immobilier with Pagination Validation Request
export interface immobilierListValidationRequest {
  page?: number;
  result?: number;
}

// List Immobilier with Pagination Validation
export const immobilierListValidation = Joi.object<immobilierListValidationRequest>({
  page: Joi.number().min(1).optional(),
  result: Joi.number().min(1).optional()
});