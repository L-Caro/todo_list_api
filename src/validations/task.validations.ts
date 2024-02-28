import Joi from 'joi';


export const taskValidations = Joi.object( {
  title: Joi.string()
  .max( 60 )
  .trim()
  .required()
  .empty( '' )
  .messages( {
    'string.max': 'Le titre de la tache ne doit pas dépasser {#limit} caractères',
    'any.required': 'Le titre de la tache est requis'
  } ),
  description: Joi.string()
  .max( 300 )
  .messages( {
    'string.max': 'La description de la tache est trop longue',
  } ),
  status: Joi.string()
  .valid('Pending', 'In progress', 'Completed')
  .messages({
    'any.only': '{#label} doit être "En attente", "En cours", ou "Completé"',
  }),
  recurrence: Joi.string()
  .valid(null, 'Daily', 'Weekly', 'Monthly', 'BiMonthly', 'Annually')
  .messages({
    'any.only': '{#label} doit être null, "Journalier", "Hebdomadaire", "Bi-mensuel", "Mensuel", ou "Annuel"',
  }),
  assignedTo: Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Le membre assigné n\'est pas valide'),
  tags: Joi.array()
  .items(Joi.string())
  .messages({
    'string.base': 'Chaque tag doit être une chaîne de caractères',
  }),
} );
