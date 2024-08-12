import Joi from "joi";
import { AbonnementList } from "../../database/entities/abonnement";
// Create devis Validation Request
export interface devisValidationRequest {
    name: string;
    immobilierId: number;
    userId: number;
    date: Date;
    content: {
      startDate: Date;
      endDate: Date;
      price: number;
      cautions?: number;
      abonnement: AbonnementList;
      reduction?: number;
    };
    createdAt: Date;
  }
// Create devis Validation
export const createDevisValidation = Joi.object<devisValidationRequest>({
    name: Joi.string().min(3).max(16).required(),
    immobilierId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    date: Joi.date().required(),
    content: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      price: Joi.number().required(),
      cautions: Joi.number().optional(),
      abonnement: Joi.string().valid(...Object.values(AbonnementList)).required(),
      reduction: Joi.number().optional()
    }).required(),
    createdAt: Joi.date().required()
  });
// Update Devis Validation Request
export interface updateDevisValidationRequest {
    name?: string;
    userId?: number;
    date?: Date;
    content?: {
      startDate?: Date;
      endDate?: Date;
      price?: number;
      cautions?: number;
      abonnement?: AbonnementList;
      reduction?: number;
    };
    updatedAt: Date;
  }
// Update Devis Validation
export const updateDevisValidation = Joi.object<updateDevisValidationRequest>({
    name: Joi.string().min(3).max(16).optional(),
    userId: Joi.number().integer().optional(),
    date: Joi.date().optional(),
    content: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      price: Joi.number().optional(),
      cautions: Joi.number().optional(),
      abonnement: Joi.string().valid(...Object.values(AbonnementList)).optional(),
      reduction: Joi.number().optional()
    }).optional(),
    updatedAt: Joi.date().required()
  });
