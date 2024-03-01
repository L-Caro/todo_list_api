import { NextFunction, Request, Response } from 'express';

import passport from 'passport';

import { userType } from 'src/@types/user';
import { ApiError } from 'src/config/error/apiError.config';
import {
  generateAccessToken, generateRefreshToken, getTokenUser, isValidRefreshToken
} from 'src/config/token/auth.config';
import { setRefreshToken } from 'src/queries/users.queries';


export const login = async ( req: Request, res: Response, next: NextFunction ) => {
  passport.authenticate( 'jwt', ( err: Error, user: userType, _info: string ) => {
    try {
      const ip = req.socket.remoteAddress!; // Obtenir l'adresse IP de la requête

      if ( err ) {
        return next( new ApiError( { message: 'Erreur lors de l\'authentification', infos: { statusCode: 401 } } ) );
      }

      if ( !user || user.isDeleted ) {
        return next( new ApiError( { message: 'Aucun membre trouvé', infos: { statusCode: 500 } } ) );
      }

      return sendTokens( res, ip, user );

    } catch ( error ) {
      return next( new ApiError(
        { message: 'Erreur lors de la connexion', infos: { statusCode: 500 } } ) );
    }
  } )( req, res );
};

export const logout = async ( _req: Request, res: Response, next: NextFunction ) => {
  try {

    res.clearCookie( 'accessToken' );
    res.clearCookie( 'refreshToken' );

    return res.status( 200 ).json( {
      statusCode: 200, status: 'success',
      data: {
        logged: false
      }
    } );
  } catch ( error ) {
    return next(
      new ApiError( { message: 'Erreur lors de la déconnexion de l\'utilisateur', infos: { statusCode: 500 } } ) );
  }
};

export const tokenRefresh = async ( req: Request, res: Response, _next: NextFunction ) => {
  const { refreshToken } = req.body;
  const authHeader = req.headers.authorization;
  if ( !authHeader || !refreshToken ) {
    throw new ApiError( { message: 'Unauthorized', infos: { statusCode: 401 } } );

  }
  // check if refreshToken is valid
  if ( await isValidRefreshToken( refreshToken ) ) {
    // get expired access token
    const token = authHeader?.split( 'Bearer ' )[ 1 ];
    // get user from expired access token
    const user = await getTokenUser( token );
    // send new tokens
    if ( user ) { // Vérifier si l'utilisateur existe
      // Envoyer de nouveaux tokens
      return sendTokens( res, req.ip!, user );
    } else {
      throw new ApiError( { message: 'Unauthorized', infos: { statusCode: 401 } } );
    }
  }
  throw new ApiError( { message: 'Unauthorized', infos: { statusCode: 401 } } );
};

export const sendTokens = async ( res: Response, ip: string, user: userType ) => {
  const userId = user.id;

  // create an access token
  const accessToken = generateAccessToken( ip, user );
  // create a refresh token
  const refreshToken = generateRefreshToken( userId );
  // save refresh token to db

  await setRefreshToken( user.id, refreshToken );

  // save tokens in cookie
  res.cookie( 'accessToken', accessToken );
  res.cookie( 'refreshToken', refreshToken );

  return res.status( 200 ).json( {
    statusCode: 200,
    status: 'success',
    data: {
      logged: true
    }
  } );
};

export const googleAuth = async ( req: Request, res: Response, next: NextFunction ) => {
  passport.authenticate( 'google', {
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
  } )( req, res, next );
};

export const googleAuthCb = async ( req: Request, res: Response, next: NextFunction ) => {
  passport.authenticate( 'google', {
    // Voir ces méthodes dans l'utilisation d'un front
    successRedirect: '/',
    failureRedirect: '/api/auth/signin'
  } )( req, res, next );
};

//! Essai de fonction auth google avec jwt
// export const googleAuthCb = async (req: Request, res: Response, next: NextFunction) => {
//   passport.authenticate('google', {
//     successRedirect: '/', // Redirection en cas de succès de l'authentification
//     failureRedirect: '/api/auth/signin', // Redirection en cas d'échec de l'authentification
//     session: false // Désactiver l'utilisation de sessions, car nous utilisons JWT
//   })(req, res, async () => {
//     try {
//       // Si l'authentification avec Google est réussie, récupérer les informations de profil
//       const user: userType = req.user;
//
//       // Générer et envoyer le token JWT
//       await sendTokens(res, req.ip, user);
//     } catch (error) {
//       throw new ApiError( { message: 'Erreur lors de l\'authentification avec Google', infos: { statusCode: 500 } }
// ); } }); };
