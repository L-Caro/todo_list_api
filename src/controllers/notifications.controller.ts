import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { Request as RequestCustom, RequestWithQuery } from 'src/@types/expressRequest';
import { ApiError } from 'src/config/error/apiError.config';
import NotificationsModel from 'src/database/Models/taskNotification.model';
import TasksModel from 'src/database/Models/tasks.model';
import { createNotification } from 'src/queries/notifications.queries';



export const notificationsFetchAll = async ( _req: RequestWithQuery, res: Response, next: NextFunction ) => {
  try {
        const notifications = await NotificationsModel.find();

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        notifications
      }
    } );
  } catch ( err ) {
    return next( new ApiError( { message: 'Erreur lors de la récupération des notifications', infos: { statusCode: 500 } } ) );
  }
};


export const notificationFetchOne = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID de la notification n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    const notification = await NotificationsModel.findById( id );

    // Gérer le cas où la tâche n'est pas trouvée
    if ( !notification ) {
      return next( new ApiError( { message: 'Le notification demandée n\'a pas été trouvé', infos: { statusCode: 404 } } ) );
    }

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        notification
      }
    } );
  } catch ( e ) {
    return next( new ApiError(
      { message: 'Une erreur s\'est produite lors de la récupération de la notification', infos: { statusCode: 500 } } ) );
  }
};


export const notificationCreate = async ( req: RequestCustom, res: Response, next: NextFunction ) => {
  const { taskId } = req.body;
  const userId = req.userId;

  try {
    const task = await TasksModel.findById(taskId);

    if(!task) {
      return next(new ApiError({ message: "La tâche associée à la notification n'a pas été trouvée", infos: { statusCode: 404 }}));
    }

    req.body.task = taskId;
    req.body.user = userId;

      const notification = await createNotification( req.body );
      return res.json( {
        statusCode: 201,
        status: 'success',
        data: {
          notification
        }
      } );

  } catch ( err ) {
    return next( new ApiError( { message: 'Erreur lors de la création de la notification', infos: { statusCode: 500 } } ) );
  }
};


export const notificationUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('body', req.body)

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID de la notification n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    const notification = await NotificationsModel.findByIdAndUpdate(id, updateData, { new: true });

    return res.json({
      status: 'success',
      statusCode: 200,
      data: {
        notification: notification,
        message: 'Notification mise à jour avec succès'
      }
    });

  } catch (error) {
    return next(new ApiError({ message: "Une erreur est survenue pendant la mise à jour de la notification", infos: { statusCode: 500 }}));
  }
};


export const notificationDelete = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID de la notification n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    await NotificationsModel.findByIdAndDelete( id );

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        message: 'Notification supprimée avec succès'
      }
    } );

  } catch ( error ) {
    return next( new ApiError(
      { message: 'Une erreur s\'est produite lors de la suppression de la notification', infos: { statusCode: 500 } } ) );
  }
};
