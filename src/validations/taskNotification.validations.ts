import Joi from 'joi';

export const taskNotificationValidation = Joi.object({
  taskId: Joi.string(),
  notificationType: Joi.string()
  .valid(null, 'TaskDelay', 'RepeatTask', 'NewTask', 'TaskDeleted', 'NewComment')
  .messages({
    'any.only': '{#label} doit être null, "TaskDelay", "RepeatTask", "NewTask", "TaskDeleted", "NewComment"',
  }),
  content: Joi.string()
  .max(500)
  .trim()
  .messages({
    'string.empty': 'Un commentaire ne peut pas être vide',
    'string.max': 'Le commentaire ne peut pas dépasser {#limit} caractères',
  }),
  status: Joi.string()
});
