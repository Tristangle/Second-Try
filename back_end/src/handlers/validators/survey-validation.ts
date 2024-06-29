import Joi from 'joi';

export interface CreateSurveyRequest {
  title: string;
  questions: {
    questionText: string;
    options?: string[];
    type: 'radio' | 'text';
  }[];
}

export const createSurveyValidation = Joi.object<CreateSurveyRequest>({
  title: Joi.string().required(),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string()).when('type', {
        is: 'radio',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      type: Joi.string().valid('radio', 'text').required(),
    })
  ).required(),
});
