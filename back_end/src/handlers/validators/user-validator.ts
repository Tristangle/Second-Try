import Joi from "joi";

// Interface de création d'un utilisateur

export interface createUserValidationRequest {
    username: string;
    email: string;
    password: string;
}
export const createUserValidation = Joi.object<createUserValidationRequest>({
    username: Joi.string().alphanum().min(5).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
}).options({abortEarly:false});

// Interface de login d'un utilisateur

export interface loginUserValidationRequest {
    username: string;
    password: string;
}

export const loginUserValidation = Joi.object<loginUserValidationRequest>({
    username: Joi.string().required(),
    password: Joi.string().required()
}).options({abortEarly: false});

// Interface d'update du rôle d'un utilisateur

export interface userUpdateRoleValidationRequest {
    roleId: number;
}
  
export const userUpdateRoleValidation = Joi.object<userUpdateRoleValidationRequest>({
    roleId: Joi.number().integer().required()
});

// Interface d'update des informations d'un utilisateur

// Interface d'update des informations d'un utilisateur
export const updateUserValidation = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).optional()
}).options({ abortEarly: false });
export interface userListValidationRequest {
    page: number;
    result: number;
}

export const userListValidation = Joi.object<userListValidationRequest>({
    page: Joi.number().min(1).optional(),
    result: Joi.number().min(1).optional()
});


