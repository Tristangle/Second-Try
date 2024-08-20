import Joi from 'joi';
import { DocumentType } from '../../database/entities/document';

export interface documentCreateValidationRequest {
  title: string;
  content?: {
    description?: string;
    text?: string;
  };
  file?: any;
  createdBy: number; // Utilisateur ID
  createdAt: Date;
  updatedAt: Date;
  userDocumentId?: number;
  devisId?: number;
  factureId?: number;
  inspectionId?: number;
  interventionId?: number;
}

export const documentCreateValidation = Joi.object<documentCreateValidationRequest>({
  title: Joi.string().required(),
  content: Joi.object({
    description: Joi.string().optional(),
    text: Joi.string().optional()
  }).optional(),
  file: Joi.any().optional(),
  createdBy: Joi.number().integer().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  userDocumentId: Joi.number().integer().optional(),
  devisId: Joi.number().integer().optional(),
  factureId: Joi.number().integer().optional(),
  inspectionId: Joi.number().integer().optional(),
  interventionId: Joi.number().integer().optional(),
});


// Document update validation request
export interface documentUpdateValidationRequest {
  title?: string;
  content?: {
    description?: string;
    text?: string;
  };
  file?: any;
  type?: DocumentType;
  updatedAt: Date;
  userDocumentId?: number;
  devisId?: number;
  factureId?: number;
  inspectionId?: number;
  interventionId?: number;
}

// Document update validation
export const documentUpdateValidation = Joi.object<documentUpdateValidationRequest>({
  title: Joi.string().optional(),
  content: Joi.object({
    description: Joi.string().optional(),
    text: Joi.string().optional()
  }).optional(),
  file: Joi.any().optional(),
  type: Joi.string().valid(...Object.values(DocumentType)).optional(),
  updatedAt: Joi.date().optional(),
  userDocumentId: Joi.number().integer().optional(),
  devisId: Joi.number().integer().optional(),
  factureId: Joi.number().integer().optional(),
  inspectionId: Joi.number().integer().optional(),
  interventionId: Joi.number().integer().optional(),
});

export interface documentListValidationRequest {
  page: number;
  result: number;
}

export const documentListValidation = Joi.object<documentListValidationRequest>({
  page: Joi.number().min(1).optional(),
  result: Joi.number().min(1).optional()
});