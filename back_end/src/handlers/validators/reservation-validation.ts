import Joi from 'joi';

// Create Reservation Validation Request
export interface createReservationValidationRequest {
  dateDebut: Date;
  dateFin: Date;
  reserveurId: number;
  immobilierId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create Reservation Validation
export const createReservationValidation = Joi.object<createReservationValidationRequest>({
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().required(),
  reserveurId: Joi.number().integer().required(),
  immobilierId: Joi.number().integer().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

// Update Reservation Validation Request
export interface updateReservationValidationRequest {
  dateDebut?: Date;
  dateFin?: Date;
  reserveurId?: number;
  immobilierId?: number;
  updatedAt: Date;
}

// Update Reservation Validation
export const updateReservationValidation = Joi.object<updateReservationValidationRequest>({
  dateDebut: Joi.date().optional(),
  dateFin: Joi.date().optional(),
  reserveurId: Joi.number().integer().optional(),
  immobilierId: Joi.number().integer().optional(),
  updatedAt: Joi.date().optional()
});
// List Reservations with Pagination Validation Request
export interface reservationListValidationRequest {
    page?: number;
    result?: number;
}
  
  // List Reservations with Pagination Validation
export const reservationListValidation = Joi.object<reservationListValidationRequest>({
    page: Joi.number().min(1).optional(),
    result: Joi.number().min(1).optional()
 });
