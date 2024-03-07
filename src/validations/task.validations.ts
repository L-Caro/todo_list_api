import Joi from 'joi';

// La seule différence entre createValidation et updateValidation est le champ title qui n'est pas obligatoire lors de l'update
export const taskCreateValidations = Joi.object( {
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
  .valid('pending', 'in_progress', 'completed')
  .messages({
    'any.only': '{#label} doit être "En attente", "En cours", ou "Completé"',
  }),
  recurrence: Joi.string()
  .valid(null, 'daily', 'weekly', 'monthly', 'bimonthly', 'annually', 'biannually', 'punctual')
  .messages({
    'any.only': '{#label} doit être null, "Journalier", "Hebdomadaire", "Bi-mensuel", "Mensuel", "Annuel", "Bi-annuel" ou "Ponctuel" ',
  }),
  assignedTo: Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Le membre assigné n\'est pas valide'),
  tags: Joi.array()
  .items(Joi.string())
  .messages({
    'string.base': 'Chaque tag doit être une chaîne de caractères',
  }),
  dueDate: Joi.date()
  .iso()
  .messages( { 'any.only': 'La date d\'échéance doit être au format ISO 8601' }),
  doneDate: Joi.date()
  .iso()
  .messages( { 'any.only': 'La date de validation de la date doit être au format ISO 8601' }),
} );


export const taskUpdateValidations = Joi.object( {
  title: Joi.string()
  .max( 60 )
  .trim()
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
  .valid('pending', 'in_progress', 'completed')
  .messages({
    'any.only': '{#label} doit être "En attente", "En cours", ou "Completé"',
  }),
  recurrence: Joi.string()
  .valid(null, 'daily', 'weekly', 'monthly', 'bimonthly', 'annually', 'biannually', 'punctual')
  .messages({
    'any.only': '{#label} doit être null, "Journalier", "Hebdomadaire", "Bi-mensuel", "Mensuel", "Annuel", "Bi-annuel" ou "Ponctuel" ',
  }),
  assignedTo: Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Le membre assigné n\'est pas valide'),
  tags: Joi.array()
  .items(Joi.string())
  .messages({
    'string.base': 'Chaque tag doit être une chaîne de caractères',
  }),
  dueDate: Joi.date()
  .iso()
  .messages( { 'any.only': 'La date d\'échéance doit être au format ISO 8601' }),
  doneDate: Joi.date()
  .iso()
  .messages( { 'any.only': 'La date de validation de la date doit être au format ISO 8601' }),
  newPosition: Joi.number()
} );
