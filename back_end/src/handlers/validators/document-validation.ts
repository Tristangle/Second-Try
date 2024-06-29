import Joi from 'joi';

export interface documentListValidationRequest {
  page: number;
  result: number;
}

export const documentListValidation = Joi.object<documentListValidationRequest>({
  page: Joi.number().min(1).optional(),
  result: Joi.number().min(1).optional()
});

export interface documentCreateValidationRequest {
  title: string;
  description: string;
  text: string;
  content: string;
  file: any; 
}

export const documentCreateValidation = Joi.object<documentCreateValidationRequest>({
  title: Joi.string().required(),
  description: Joi.string().required(),
  text: Joi.string().required(),
  content: Joi.string().required(),
  file: Joi.any().required()
});
