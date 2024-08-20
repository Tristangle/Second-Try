import Joi from 'joi';
import { UserAbonnementStatus } from '../../database/entities/userAbonnement';

export interface createUserAbonnementValidationRequest {
  userId: number;
  abonnementId: number;
  status?: UserAbonnementStatus;
  startDate?: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface updateUserAbonnementValidationRequest {
  status?: UserAbonnementStatus;
  startDate?: Date;
  endDate?: Date;
  updatedAt?: Date;
}

export const createUserAbonnementValidation = Joi.object<createUserAbonnementValidationRequest>({
  userId: Joi.number().integer().required(),
  abonnementId: Joi.number().integer().required(),
  status: Joi.string().valid(...Object.values(UserAbonnementStatus)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

export const updateUserAbonnementValidation = Joi.object<updateUserAbonnementValidationRequest>({
  status: Joi.string().valid(...Object.values(UserAbonnementStatus)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});
