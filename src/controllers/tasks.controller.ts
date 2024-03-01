import { NextFunction, Response } from 'express';
import { Request, RequestWithQuery } from 'src/@types/expressRequest';
import { ApiError } from 'src/config/error/apiError.config';
import TasksModel from 'src/database/Models/tasks.model';
import { createTask } from 'src/queries/tasks.queries';
import { querySchema } from 'src/validations/queryTask.validations';


/**
 * Fetches tasks based on query parameters.
 *
 * @param {RequestWithQuery} req - The request object with query parameters.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves with the fetched tasks or rejects with an error.
 * @throws {ApiError} - An error occurred while fetching the tasks.
 */
export const tasksFetch = async ( req: RequestWithQuery, res: Response, next: NextFunction ) => {
  try {
    //? Valider req.query avec Joi
    const { error, value } = querySchema.validate( req.query );

    // Si la validation échoue, retourner une erreur
    if ( error ) {
      return next( new ApiError( { message: error.details[ 0 ].message, infos: { statusCode: 400 } } ) );
    }

    const query = { ...value };

    //? Gestion des filtres spéciaux
    // Recherche les taches qui se terminent avant une certaine date
    if ( query.dueDateBefore ) {
      query.dueDate = { $lt: new Date( query.dueDateBefore ) };
      delete query.dueDateBefore;
    }

    // Intervalle de dates de création
    if ( query.createdAtStart || query.createdAtEnd ) {
      query.createdAt = {};
      if ( query.createdAtStart ) {
        query.createdAt.$gte = new Date( query.createdAtStart );
        delete query.createdAtStart;
      }
      if ( query.createdAtEnd ) {
        query.createdAt.$lte = new Date( query.createdAtEnd );
        delete query.createdAtEnd;
      }
    }

    // Recherche les taches créent il y a X jours
    if ( query.createdInPastDays ) {
      const daysAgo = new Date();
      daysAgo.setDate( daysAgo.getDate() - parseInt( query.createdInPastDays ) );
      query.createdAt = { $gte: daysAgo };
      delete query.createdInPastDays;
    }

    // Recherche les taches qui n'ont pas de dates d'échéance
    // /tasks?withoutDueDate=true
    if ( query.withoutDueDate && query.withoutDueDate.toLowerCase() === 'true' ) {
      query.dueDate = { $exists: false };
      delete query.withoutDueDate;
    }

    // Recherche les taches qui ont une date d'échéance dépassée
    // /tasks?isOverdue=true
    if ( query.isOverdue && query.isOverdue.toLowerCase() === 'true' ) {
      const now = new Date();
      query.dueDate = { $lt: now };
      delete query.isOverdue;
    }

    // Gestion des tags dans la recherche
    if ( query.tags ) {
      query.tags = { $all: query.tags.split( ',' ) };
    }

    //? Gestion des cas contradictoires
    if ( query.createdInPastDays && (query.createdAtStart || query.createdAtEnd) ) {
      return res.status( 400 ).json( {
        message: 'Ne peut pas utiliser createdInPastDays avec createdAtStart ou createdAtEnd'
      } );
    }

    const tasks = await TasksModel.find( query );

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        tasks
      }
    } );
  } catch ( err ) {
    return next( new ApiError( { message: 'Erreur lors de la récupération des tâches', infos: { statusCode: 500 } } ) );
  }
};

export const getOneTask = ( _req: Request, _res: Response, _next: NextFunction ) => {

};

/**
 * Creates a new task
 *
 * @async
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns {Promise<void>}
 */
export const taskCreate = async ( req: Request, res: Response, next: NextFunction ) => {
  const { body } = req; // Request body contains the new task details.
  const userId = req.userId;
  try {

    const existingTask = await TasksModel.findOne( { title: body.title } );

    if ( existingTask ) {
      return next( new ApiError( { message: 'Une tâche avec ce titre existe déjà', infos: { statusCode: 400 } } ) );
    } else {
      body.createdBy = userId;
      body.assignedTo = body.assignedTo ? body.assignedTo : userId;
      const task = await createTask( body );

      return res.json( {
        statusCode: 201,
        status: 'success',
        data: {
          task
        }
      } );
    }
  } catch ( err ) {
    return next( new ApiError( { message: 'Erreur lors de la création de la tâche', infos: { statusCode: 500 } } ) );
  }
};
export const updateTask = async ( _req: Request, _res: Response, _next: NextFunction ) => {

};
export const deleteTask = ( _req: Request, _res: Response, _next: NextFunction ) => {

};
