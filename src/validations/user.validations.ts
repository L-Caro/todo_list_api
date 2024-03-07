import Joi from 'joi';


export const userCreateValidation = Joi.object( {
  username: Joi.string()
  .max( 30 )
  .trim()
  .required()
  .empty( '' )
  .messages( {
    'string.max': 'Le nom d\'utilisateur ne doit pas dépasser {#limit} caractères',
    'any.required': 'Le nom d\'utilisateur est requis'
  } ),
  email: Joi.string()
  .email( { minDomainSegments: 2 } )
  .required()
  .empty( '' )
  .messages( {
    'string.email': 'L\'adresse email doit être valide',
    'any.required': 'L\'adresse email est requise'
  } ),
  password: Joi.string()
  .regex( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/ )
  .required()
  .min( 12 )
  .empty( '' )
  .messages( {
    'string.min': 'Le mot de passe n\'est pas assez long',
    'string.pattern.base': 'Le mot de passe ne correspond pas aux critères requis',
    'any.required': 'Le mot de passe est requis'
  } ),
  nonWorkingDays: Joi.array()
} );


export const userUpdateValidation = Joi.object( {
  username: Joi.string()
  .max( 30 )
  .trim()
  .empty( '' )
  .messages( {
    'string.max': 'Le nom d\'utilisateur ne doit pas dépasser {#limit} caractères'
  } ),
  email: Joi.string()
  .email( { minDomainSegments: 2 } )
  .empty( '' )
  .messages( {
    'string.email': 'L\'adresse email doit être valide'
  } ),
  password: Joi.string()
  .regex( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/ )
  .empty( '' )
  .messages( {
    'string.min': 'Le mot de passe n\'est pas assez long',
    'string.pattern.base': 'Le mot de passe ne correspond pas aux critères requis'
  } ),
  nonWorkingDays: Joi.array()
} );
