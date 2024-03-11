import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { Request as RequestCustom, RequestWithQuery } from 'src/@types/expressRequest';
import { ApiError } from 'src/config/error/apiError.config';
import TasksModel from 'src/database/Models/tasks.model';
import {createNotification} from 'src/queries/notifications.queries';
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
export const tasksFetchAll = async ( req: RequestWithQuery, res: Response, next: NextFunction ) => {
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

/**
 * Retrieves a single task
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 *
 * @returns {Promise<void>} - A promise that resolves to void
 *
 * @throws {ApiError} - If the task ID is not valid or the task is not found
 */
export const taskFetchOne = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID de la tâche n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    const task = await TasksModel.findById( id );

    // Gérer le cas où la tâche n'est pas trouvée
    if ( !task ) {
      return next( new ApiError( { message: 'La tâche demandée n\'a pas été trouvée', infos: { statusCode: 404 } } ) );
    }

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        task
      }
    } );
  } catch ( e ) {
    return next( new ApiError(
      { message: 'Une erreur s\'est produite lors de la récupération de la tâche', infos: { statusCode: 500 } } ) );
  }
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
export const taskCreate = async ( req: RequestCustom, res: Response, next: NextFunction ) => {
  const { body } = req; // Request body contains the new task details.
  const userId = req.userId;
  try {

    const existingTask = await TasksModel.findOne( { title: body.title } );

    if ( existingTask ) {
      return next( new ApiError( { message: 'Une tâche avec ce titre existe déjà', infos: { statusCode: 400 } } ) );
    } else {
      body.createdBy = userId;
      body.assignedTo = body.assignedTo ? body.assignedTo : userId;

      // On implémente une position initiale à la tache
      const maxOrderTask = await TasksModel.findOne({ recurrence: body.recurrence}).sort(`-orderIndices.${body.recurrence}`).limit(1)
      const newOrderIndex = maxOrderTask ? maxOrderTask.orderIndices[body.recurrence] + 1 : 0;
      body.orderIndices = { [body.recurrence]: newOrderIndex };

      const task = await createTask( body );

      // Vérification si la tâche a été attribuée à un autre utilisateur
      // Et envoi d'une notification
      if (body.assignedTo !== userId) {
        let notification = {
          user: body.assignedTo,
          task: task._id,
          notificationType: 'NewTask',
          content: `Vous avez une nouvelle tâche intitulée ${task.title}.`
        };
        await createNotification(notification);
      }

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

/**
 * Updates a task.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<Response>} A promise that resolves to the response object.
 * @throws {ApiError} If the task ID is not valid, or if an error occurs while updating the task.
 */
export const taskUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID de la tâche n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    // Récupération de l'ancienne tâche pour pouvoir comparer l'ancien assignedTo et le nouveau.
    const oldTask = await TasksModel.findById(id);
    if (!oldTask) {
      return next(new ApiError({ message: "La tâche n'existe pas", infos: { statusCode: 404 }}));
    }

    const task = await TasksModel.findByIdAndUpdate(id, updateData, { new: true });

    // Vérification si le champ assignedTo a été modifié.
    if (updateData.assignedTo && String(oldTask.assignedTo) !== String(updateData.assignedTo)) {
      let notification = {
        user: updateData.assignedTo,
        task: task?._id,
        notificationType: 'NewTask',
        content: `Une nouvelle tâche vous a été attribuée avec le titre ${task?.title}.`
      };
      await createNotification(notification);
    }

    return res.json({
      status: 'success',
      statusCode: 200,
      data: {
        task: task,
        message: 'Tâche mise à jour avec succès'
      }
    });

  } catch (error) {
    return next(new ApiError({ message: "Une erreur est survenue pendant la mise à jour de la tâche", infos: { statusCode: 500 }}));
  }
};


/**
 * Changes the order of a task.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<Response>} The updated task or an error response.
 * @throws {ApiError} If the task is not found or an error occurs during the update.
 */
export const taskChangeOrder = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    // Récupère les données de l'API
    const { newPosition } = req.body;
    const id = req.params.id;


    // Obtient la tâche déplacée
    const movedTask = await TasksModel.findById(id);
    if (!movedTask) {
      return next(new ApiError({ message: "La tâche n'a pas été trouvée", infos: { statusCode: 404 }}));
    }

    // Ancien emplacement
    const oldIndex = movedTask.orderIndices[movedTask.recurrence];

    // Mettre à jour les indices des tâches affectées
    if (oldIndex < newPosition) {
      // La tâche a été déplacée vers le bas dans la liste
      await TasksModel.updateMany(
        {
          ["orderIndices." + movedTask.recurrence]: {
            $gt: oldIndex,
            $lte: newPosition,
          },
        },
        {$inc: {["orderIndices." + movedTask.recurrence]: -1}}
      );
    } else if (oldIndex > newPosition) {
        // La tâche a été déplacée vers le haut dans la liste
        await TasksModel.updateMany(
          {
            ["orderIndices." + movedTask.recurrence]: {
              $gte: newPosition,
              $lt: oldIndex,
            },
          },
          { $inc: { ["orderIndices." + movedTask.recurrence]: 1 } }
        );
      }

    movedTask.orderIndices[movedTask.recurrence] = newPosition;
    await movedTask.save();

    return res.json({
      status: 'success',
      statusCode: 200,
      data: {
        task: movedTask,
        message: 'Tâche mise à jour avec succès'
      }
    });

  } catch (error) {
    return next(new ApiError({ message: "Une erreur est survenue pendant la mise à jour de la tâche", infos: { statusCode: 500 }}));
  }
}


/**
 * Deletes a task.
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ApiError} - If the task ID is invalid or an error occurs during deletion.
 */
export const taskDelete = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID de la tâche n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    const task = await TasksModel.findById(id);

    if (!task) {
      return next(new ApiError({ message: "La tâche n'existe pas", infos: { statusCode: 404 }}));
    }


    // Toutes les tâches qui ont un indice d'ordre supérieur à la tâche qui a été supprimée
    const affectedTasks = await TasksModel.find({
      [`orderIndices.${task.recurrence}`]: {$gt: task.orderIndices[task.recurrence]},
      recurrence: task.recurrence
    });

    // Décrémenter l'indice d'ordre de chaque tâche affectée
    const updatePromises = affectedTasks.map(affectedTask => TasksModel.updateOne(
      {_id: affectedTask._id},
      {$inc: {[`orderIndices.${task.recurrence}`]: -1}}
    ));

    // Attendez que toutes les promesses soient résolues
    await Promise.all(updatePromises);



    await TasksModel.findByIdAndDelete( id );

    // Création d'une notification de tâche supprimée pour l'utilisateur assigné
    if (task.assignedTo) {
      let notification = {
        user: task.assignedTo,
        task: task._id,
        notificationType: 'TaskDeleted',
        content: `La tâche intitulée ${task.title} qui vous a été attribuée a été supprimée.`
      };
      await createNotification(notification);
    }

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        message: 'Tâche supprimée avec succès'
      }
    } );

  } catch ( error ) {
    return next( new ApiError(
      { message: 'Une erreur s\'est produite lors de la suppression de la tâche', infos: { statusCode: 500 } } ) );
  }
};
