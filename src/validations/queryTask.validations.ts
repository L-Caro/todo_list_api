import Joi from 'joi'
export const querySchema = Joi.object( {
  title: Joi.string(),
  description: Joi.string(),
  dueDate: Joi.date(),
  doneDate: Joi.date(),
  createdBy: Joi.string(),
  assignedTo: Joi.string(),
  dueDateBefore: Joi.date(),
  createdAtStart: Joi.date(),
  createdAtEnd: Joi.date(),
  withoutDueDate: Joi.string().valid( 'true', 'false' ),
  isOverdue: Joi.string().valid( 'true', 'false' ),
  createdInPastDays: Joi.string().pattern( /^\d+$/ ),
  assignedToMe: Joi.string().valid( 'true', 'false' ),
  tags: Joi.string(),
  status: Joi.string().valid( 'pending', 'in_progress', 'completed' ),
  recurrence: Joi.string()
  .valid( null, 'daily', 'weekly', 'monthly', 'bimonthly', 'annually', 'biannually', 'punctual' )
} );
