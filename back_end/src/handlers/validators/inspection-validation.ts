import Joi from 'joi';

// Create Inspection Validation Request
export interface createInspectionValidationRequest {
  name: string;
  dateDebut: Date;
  dateFin: Date;
  immobilierId: number;
  inspectorId: number;
  renterId: number;
  validation: boolean;
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Inspection Validation
export const createInspectionValidation = Joi.object<createInspectionValidationRequest>({
  name: Joi.string().required(),
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().required(),
  immobilierId: Joi.number().integer().required(),
  inspectorId: Joi.number().integer().required(),
  renterId: Joi.number().integer().required(),
  validation: Joi.boolean().required(),
  details: Joi.string().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

// Update Inspection Validation Request
export interface updateInspectionValidationRequest {
  name?: string;
  dateDebut?: Date;
  dateFin?: Date;
  immobilierId?: number;
  inspectorId?: number;
  renterId?: number;
  validation?: boolean;
  details?: string;
  documents?: number[];
  updatedAt: Date;
}

// Update Inspection Validation
export const updateInspectionValidation = Joi.object<updateInspectionValidationRequest>({
  name: Joi.string().optional(),
  dateDebut: Joi.date().optional(),
  dateFin: Joi.date().optional(),
  immobilierId: Joi.number().integer().optional(),
  inspectorId: Joi.number().integer().optional(),
  renterId: Joi.number().integer().optional(),
  validation: Joi.boolean().optional(),
  details: Joi.string().optional(),
  documents: Joi.array().items(Joi.number().integer()).optional(),
  updatedAt: Joi.date().optional()
});
// List Inspections with Pagination Validation Request
export interface inspectionListValidationRequest {
    page?: number;
    result?: number;
}
  
  // List Inspections with Pagination Validation
export const inspectionListValidation = Joi.object<inspectionListValidationRequest>({
    page: Joi.number().min(1).optional(),
    result: Joi.number().min(1).optional()
 });