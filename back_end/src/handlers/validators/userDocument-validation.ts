import Joi from 'joi';

export interface createUserDocumentValidationRequest {
  userId: number;
  documentId: number;
}

export const createUserDocumentValidation = Joi.object<createUserDocumentValidationRequest>({
  userId: Joi.number().integer().required(),
  documentId: Joi.number().integer().required(),
});
