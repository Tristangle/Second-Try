import Joi from 'joi';
import { TauxTVA } from '../../database/entities/facture';

// Create Facture Validation Request
export interface createFactureValidationRequest {
  name: string;
  immobilierId?: number;
  interventionId?: number;
  emetteurId: number;
  receveurId: number;
  date: Date;
  emailEmetteur: string;
  adresseEmetteur: string;
  content: {
    quantite: number;
    designation: string;
    tauxTVA: TauxTVA;
    prixUnitaire: number;
    totalHT: number;
    totalTTC: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Create Facture Validation
export const createFactureValidation = Joi.object<createFactureValidationRequest>({
  name: Joi.string().required(),
  immobilierId: Joi.number().integer().optional(),
  interventionId: Joi.number().integer().optional(),
  emetteurId: Joi.number().integer().required(),
  receveurId: Joi.number().integer().required(),
  date: Joi.date().required(),
  emailEmetteur: Joi.string().email().required(),
  adresseEmetteur: Joi.string().required(),
  content: Joi.array().items(
    Joi.object({
      quantite: Joi.number().integer().required(),
      designation: Joi.string().required(),
      tauxTVA: Joi.string().valid(...Object.values(TauxTVA)).required(),
      prixUnitaire: Joi.number().required(),
      totalHT: Joi.number().required(),
      totalTTC: Joi.number().required()
    })
  ).required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

// Update Facture Validation Request
export interface updateFactureValidationRequest {
  name?: string;
  immobilierId?: number;
  interventionId?: number;
  emetteurId?: number;
  receveurId?: number;
  date?: Date;
  emailEmetteur?: string;
  adresseEmetteur?: string;
  content?: {
    quantite?: number;
    designation?: string;
    tauxTVA?: TauxTVA;
    prixUnitaire?: number;
    totalHT?: number;
    totalTTC?: number;
  }[];
  updatedAt: Date;
}

// Update Facture Validation
export const updateFactureValidation = Joi.object<updateFactureValidationRequest>({
  name: Joi.string().optional(),
  immobilierId: Joi.number().integer().optional(),
  interventionId: Joi.number().integer().optional(),
  emetteurId: Joi.number().integer().optional(),
  receveurId: Joi.number().integer().optional(),
  date: Joi.date().optional(),
  emailEmetteur: Joi.string().email().optional(),
  adresseEmetteur: Joi.string().optional(),
  content: Joi.array().items(
    Joi.object({
      quantite: Joi.number().integer().optional(),
      designation: Joi.string().optional(),
      tauxTVA: Joi.string().valid(...Object.values(TauxTVA)).optional(),
      prixUnitaire: Joi.number().optional(),
      totalHT: Joi.number().optional(),
      totalTTC: Joi.number().optional()
    })
  ).optional(),
  updatedAt: Joi.date().optional()
});
