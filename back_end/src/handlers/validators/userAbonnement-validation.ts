import Joi from 'joi';
import { UserAbonnementStatus } from '../../database/entities/userAbonnement';

export interface createUserAbonnementValidationRequest {
  userId: number;
  abonnementId: number;
  status?: UserAbonnementStatus;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface updateUserAbonnementValidationRequest {
  abonnementId?: number;
  status?: UserAbonnementStatus;
  startDate?: Date;
  endDate?: Date;
  updatedAt?: Date;
  isAnnual?: boolean;
}

export const createUserAbonnementValidation = Joi.object<createUserAbonnementValidationRequest>({
  userId: Joi.number().integer().required(),
  abonnementId: Joi.number().integer().required(),
  status: Joi.string().valid(...Object.values(UserAbonnementStatus)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

export const updateUserAbonnementValidation = Joi.object<updateUserAbonnementValidationRequest>({
  abonnementId: Joi.number().integer().optional(),
  status: Joi.string().valid(...Object.values(UserAbonnementStatus)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  isAnnual: Joi.boolean().optional(),
});
