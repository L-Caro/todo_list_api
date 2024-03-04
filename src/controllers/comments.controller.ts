import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { Request as RequestCustom, RequestWithQuery } from 'src/@types/expressRequest';
import { ApiError } from 'src/config/error/apiError.config';
import CommentsModel from 'src/database/Models/taskComment.model';
import TasksModel from 'src/database/Models/tasks.model';
import { createComment } from 'src/queries/comments.queries';



export const commentsFetchAll = async ( _req: RequestWithQuery, res: Response, next: NextFunction ) => {
  try {
        const comments = await CommentsModel.find();

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        comments
      }
    } );
  } catch ( err ) {
    return next( new ApiError( { message: 'Erreur lors de la récupération des commentaires', infos: { statusCode: 500 } } ) );
  }
};


export const commentFetchOne = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID du commentaire n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    const comment = await CommentsModel.findById( id );

    // Gérer le cas où la tâche n'est pas trouvée
    if ( !comment ) {
      return next( new ApiError( { message: 'Le commentaire demandé n\'a pas été trouvé', infos: { statusCode: 404 } } ) );
    }

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        comment
      }
    } );
  } catch ( e ) {
    return next( new ApiError(
      { message: 'Une erreur s\'est produite lors de la récupération du commentaire', infos: { statusCode: 500 } } ) );
  }
};


export const commentCreate = async ( req: RequestCustom, res: Response, next: NextFunction ) => {
  const { taskId } = req.body;
  const userId = req.userId;

  try {
    const task = await TasksModel.findById(taskId);

    if(!task) {
      return next(new ApiError({ message: "La tâche associée au commentaire n'a pas été trouvée", infos: { statusCode: 404 }}));
    }

    req.body.task = taskId;
    req.body.user = userId;

      const comment = await createComment( req.body );

      return res.json( {
        statusCode: 201,
        status: 'success',
        data: {
          comment
        }
      } );

  } catch ( err ) {
    return next( new ApiError( { message: 'Erreur lors de la création u commentaire', infos: { statusCode: 500 } } ) );
  }
};


export const commentUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('body', req.body)

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID du commentaire n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    const comment = await CommentsModel.findByIdAndUpdate(id, updateData, { new: true });

    return res.json({
      status: 'success',
      statusCode: 200,
      data: {
        comment: comment,
        message: 'Commentaire mise à jour avec succès'
      }
    });

  } catch (error) {
    return next(new ApiError({ message: "Une erreur est survenue pendant la mise à jour du commentaire", infos: { statusCode: 500 }}));
  }
};


export const commentDelete = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if ( !Types.ObjectId.isValid( id ) ) {
      return next( new ApiError( { message: 'L\'ID du commentaire n\'est pas valide', infos: { statusCode: 400 } } ) );
    }

    await CommentsModel.findByIdAndDelete( id );

    res.json( {
      status: 'success',
      statusCode: 200,
      data: {
        message: 'Commentaire supprimé avec succès'
      }
    } );

  } catch ( error ) {
    return next( new ApiError(
      { message: 'Une erreur s\'est produite lors de la suppression du commentaire', infos: { statusCode: 500 } } ) );
  }
};
