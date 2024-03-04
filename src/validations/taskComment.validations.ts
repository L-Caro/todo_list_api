import Joi from 'joi';

export const taskCommentValidation = Joi.object({
  taskId: Joi.string(),
  comment: Joi.string()
  .max(500)
  .trim()
  .messages({
    'string.empty': 'Un commentaire ne peut pas être vide',
    'string.max': 'Le commentaire ne peut pas dépasser {#limit} caractères',
  }),
});
