import { NextFunction, Request, Response } from 'express';

import { userType } from 'src/@types/user';
import { ApiError } from 'src/config/error/apiError.config';

import UserModel from 'src/database/Models/user.model';

import { createUser, fetchUserById } from 'src/queries/users.queries';


export const usersFetch = async ( _req: Request, res: Response, next: NextFunction ) => {
  try {
    const users = await UserModel.find({ isDeleted: false });
    return res.json( { statusCode: 200, status: 'success', users } );
  } catch ( error ) {
    return next(
      new ApiError( { message: 'Erreur lors de la récupération des utilisateurs', infos: { statusCode: 500 } } ) );
  }
};

export const userFetch = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const userId = req.params.id;
    const user = await fetchUserById( userId );
    if ( !user || user.isDeleted ) {
      return next( new ApiError( { message: 'L\'utilisateur n\'a pas été trouvé', infos: { statusCode: 404 } } ) );
    }
    return res.json( { statusCode: 200, status: 'success', user } );
  } catch ( error ) {
    return next(
      new ApiError( { message: 'Erreur lors de la récupération de l\'utilisateur', infos: { statusCode: 500 } } ) );
  }
};

export const userCreate = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const existingUser = await UserModel.findOne( { email: req.body.email } );
    if ( existingUser ) {
      return next( new ApiError( { message: 'L\'adresse email est déjà utilisée', infos: { statusCode: 500 } } ) );
    } else {
      const user = await createUser( req.body );

      return res.json( { statusCode: 201, status: 'success', data: user  } );
    }
  } catch ( error ) {
    return next(
      new ApiError( { message: 'Erreur lors de la création de l\'utilisateur', infos: { statusCode: 500 } } ) );
  }
};

export const userUpdate = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const userId = req.params.id;
    const updatedUser = await UserModel.findByIdAndUpdate( userId, req.body, { new: true } );
    if ( !updatedUser ) {
      return next( new ApiError( { message: 'L\'utilisateur n\'a pas été trouvé', infos: { statusCode: 500 } } ) );
    }
    return res.json( { statusCode: 200, status: 'success', user: updatedUser } );
  } catch ( error ) {
    return next(
      new ApiError( { message: 'Erreur lors de la mise à jour de l\'utilisateur', infos: { statusCode: 500 } } ) );
  }
};
export const userDelete = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);
    if ( !user ) {
      return next( new ApiError( { message: 'L\'utilisateur n\'a pas été trouvé', infos: { statusCode: 500 } } ) );
    }
    user.isDeleted = true;
    await user.save();
    return res.json( { statusCode: 200, status: 'success' } );
  } catch ( error ) {
    return next(
      new ApiError( { message: 'Erreur lors de la suppression de l\'utilisateur', infos: { statusCode: 500 } } ) );
  }
};

export const uploadImage = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const user = req.user as userType;
    if ( !user ) {
      return next( new ApiError( { message: 'Utilisateur non trouvé', infos: { statusCode: 404 } } ) );
    }
    if (req.file) { user.profilePicture = `/upload/profilePictures/${ req.file.filename }` }

    await user.save();
    res.json( { statusCode: 200, status: 'success', user } );
  } catch ( error ) {
    next(
      new ApiError( { message: 'Erreur lors de la mise à jour de l\'image de profil', infos: { statusCode: 500 } } ) );
  }
};
