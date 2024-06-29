import Joi from "joi";

export interface CreateVoteRequest {
  title: string;
  mode: string;
  comment?: string;
  questions: {
    questionText: string;
    options: string[];
  }[];
}

export const createVoteValidation = Joi.object<CreateVoteRequest>({
  title: Joi.string().required(),
  mode: Joi.string().required(),
  comment: Joi.string().optional(),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string().required()).required()
    })
  ).required()
});

export interface VoteListValidationRequest {
  page?: number;
  result?: number;
}

export const voteListValidation = Joi.object<VoteListValidationRequest>({
  page: Joi.number().min(1).optional(),
  result: Joi.number().min(1).optional()
});