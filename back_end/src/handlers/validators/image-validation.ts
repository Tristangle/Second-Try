import Joi from 'joi';

// Create Image Validation Request
export interface createImageValidationRequest {
  url: string;
  immobilierId: number;
}

// Create Image Validation
export const createImageValidation = Joi.object<createImageValidationRequest>({
  url: Joi.string().uri().required(),
  immobilierId: Joi.number().integer().required()
});

// List Images with Pagination Validation Request
export interface imageListValidationRequest {
  page?: number;
  result?: number;
}

// List Images with Pagination Validation
export const imageListValidation = Joi.object<imageListValidationRequest>({
  page: Joi.number().min(1).optional(),
  result: Joi.number().min(1).optional()
});
