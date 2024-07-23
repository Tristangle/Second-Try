import Joi from "joi";

export interface createUserValidationRequest {
    username: string;
    email: string;
    password: string;
    role:number
}
export const createUserValidation = Joi.object<createUserValidationRequest>({
    username: Joi.string().alphanum().min(5).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
}).options({abortEarly:false});

export interface loginUserValidationRequest {
    username: string;
    password: string;
}

export const loginUserValidation = Joi.object<loginUserValidationRequest>({
    username: Joi.string().required(),
    password: Joi.string().required()
}).options({abortEarly: false});

export interface userListValidationRequest {
    page: number;
    result: number;
}

export const userListValidation = Joi.object<userListValidationRequest>({
    page: Joi.number().min(1).optional(),
    result: Joi.number().min(1).optional()
})





export interface userUpdateRoleValidationRequest {
    roleId: number;
  }
  
  export const userUpdateRoleValidation = Joi.object<userUpdateRoleValidationRequest>({
    roleId: Joi.number().integer().required()
  });

  export const updateUserValidation = Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(8)
});