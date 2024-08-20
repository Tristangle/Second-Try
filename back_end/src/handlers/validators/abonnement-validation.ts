import Joi from "joi";
import { AbonnementStatus, AbonnementList } from "../../database/entities/abonnement";

// Create Abonnement Request Validation

export interface createAbonnementRequest {
    name: string;
    description: string;
    price: number;
    yearPrice: number;
    duration: number;
    yearDuration: number;
    startDate: Date;
    endDate: Date;
    status: AbonnementStatus;
    benefits: {
      type: string;
      description: string;
      value?: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }
// Create Abonnement Request
export const createAbonnementValidation = Joi.object<createAbonnementRequest>({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    yearPrice: Joi.number().required(),
    duration: Joi.number().integer().positive().required(),
    yearDuration: Joi.number().integer().positive().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    status: Joi.string().valid(...Object.values(AbonnementStatus)).required(),
    benefits: Joi.array().items(
      Joi.object({
        type: Joi.string().required(),
        description: Joi.string().required(),
        value: Joi.number().optional(),
      })
    ).required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
  });
// Update Abonnement Request Validation
export interface updateAbonnementRequest {
    name?: string;
    description?: string;
    price?: number;
    yearPrice?: number;
    duration?: number;
    yearDuration: number;
    startDate?: Date;
    endDate?: Date;
    status?: AbonnementStatus;
    benefits?: {
      type: string;
      description: string;
      value?: number;
    }[];
    updatedAt: Date;
  }
// Update Abonnement Validation
export const updateAbonnementValidation = Joi.object<updateAbonnementRequest>({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    yearPrice: Joi.number().positive().optional(),
    duration: Joi.number().integer().positive().optional(),
    yearDuration: Joi.number().integer().positive().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    status: Joi.string().valid(...Object.values(AbonnementStatus)).optional(),
    benefits: Joi.array().items(
      Joi.object({
        type: Joi.string().required(),
        description: Joi.string().required(),
        value: Joi.number().optional(),
      })
    ).optional(),
    updatedAt: Joi.date().optional(),
});

// List Abonnements with Pagination Validation Request
export interface abonnementListValidationRequest {
  page?: number;
  result?: number;
}

// List Abonnement with Pagination Validation
export const abonnementListValidation = Joi.object<abonnementListValidationRequest>({
  page: Joi.number().min(1).optional(),
  result: Joi.number().min(1).optional()
});