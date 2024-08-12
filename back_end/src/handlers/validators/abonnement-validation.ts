import Joi from "joi";
import { AbonnementStatus, AbonnementList } from "../../database/entities/abonnement";

// Create Abonnement Request Validation

export interface createAbonnementRequest {
    name: string;
    description: string;
    price: number;
    duration: number;
    startDate: Date;
    endDate: Date;
    status: AbonnementStatus;
    benefits: {
      type: string;
      description: string;
      value?: number;
    }[];
    createdAt: Date;
  }
// Create Abonnement Request
export const createAbonnementValidation = Joi.object<createAbonnementRequest>({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().required(),
    price: Joi.number().positive().required(),
    duration: Joi.number().integer().positive().required(),
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
    createdAt: Joi.date().required(),
  });
// Update Abonnement Request Validation
export interface updateAbonnementRequest {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
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
    duration: Joi.number().integer().positive().optional(),
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
    updatedAt: Joi.date().required(),
  });