import { RequestHandler } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Request } from 'src/@types/expressRequest';
import { DecodedAccessTokenType, decodedRefreshTokenType } from 'src/@types/jwt';
import { userType } from 'src/@types/user';
import { ApiError } from 'src/config/error/apiError.config';
import TasksModel from 'src/database/Models/tasks.model';
import { fetchCommentById } from 'src/queries/comments.queries';
import { fetchTaskById } from 'src/queries/tasks.queries';
import { fetchUserByEmail, fetchUserById, getRefreshToken } from 'src/queries/users.queries';


const JWT_SECRET: Secret | undefined = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET: Secret | undefined = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRATION: string = process.env.ACCESS_TOKEN_EXPIRATION ?? '15m';
const REFRESH_TOKEN_EXPIRATION: string = process.env.REFRESH_TOKEN_EXPIRATION ?? '7d';

/**
 * Génère un jeton d'accès
 *
 * @param {string} ip - IP ayant été authentifiée
 * @param {userType} user - Utilisateur authentifié
 * @returns un jeton d'accès
 */
export const generateAccessToken = ( ip: string, user: userType ): string => {
  if ( !JWT_SECRET ) {
    throw new ApiError( { message: 'Unauthorized', infos: { statusCode: 401 } } );
  }

  return jwt.sign(
    {
      data: {
        ip,
        email: user.email,
        id: user._id
      }
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  );
};

/**
 * Génère un jeton de rafraîchissement
 *
 * @param {number} id - ID de l'utilisateur
 * @returns un jeton de rafraîchissement
 */
export const generateRefreshToken = ( id: number ): string => {
  if ( !JWT_REFRESH_SECRET ) {
    throw new ApiError( { message: 'Unauthorized', infos: { statusCode: 401 } } );
  }

  return jwt.sign( { id }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION
  } );
};

/**
 * Génère un middleware pour autoriser l'accès à une route en fonction des rôles du jeton
 *
 * @param {string} permission - la permission requise
 * @param {string} section - la section qui nécessite la permission
 * @returns {RequestHandler} une fonction middleware pour vérifier la permission sur la section
 *
 * Prend une permission (verbe CRUD) et une section (partie de l'application : projet, utilisateur, etc.)
 * Pour chaque cas, une logique spécifique est mise en place
 */
export const authorize = ( permission: string, section: string ): RequestHandler => {
  // @ts-ignore
  return async ( req: Request, _res, next ) => {
    try {
      const authHeader = req.headers.authorization;

      if ( !JWT_SECRET ) {
        return next( new ApiError( { message: 'Ud', infos: { statusCode: 403 } } ) );
      }
      if ( authHeader ) {
        // Vérification que l'IP qui demande est le même IP qui a stocké le token
        const token = authHeader.split( 'Bearer ' )[ 1 ];

        // récupère le jeton
        const decoded = jwt.verify( token, JWT_SECRET as Secret ) as DecodedAccessTokenType;

        // vérifie la cohérence de l'IP
        if ( decoded.data.ip !== req.ip ) {
          return next( new ApiError( { message: 'Unauthorized', infos: { statusCode: 403 } } ) );
        }

        //? Début des différents cas de comparaison

        if ( (permission === 'create' && section === 'tasks') || (permission === 'create' && section === 'comments')) {
          try {
            req.userId = decoded.data.id;
            return next();
          } catch {
            return next( new ApiError( { message: 'Invalid token', infos: { statusCode: 401 } } ) );
          }
        }

        if ( (permission === 'update' && section === 'users') || (permission === 'delete' && section === 'users') ) {
          const userId = req.params.id;
          const user = await fetchUserById( userId );
          if ( !user ) {
            return next( new ApiError( { message: 'Not found', infos: { statusCode: 404 } } ) );
          }
          if ( String( decoded.data.id ) === String( user._id ) ) {
            return next();
          }
        }

        // vérifie le créateur de la tache
        if ( (permission === 'update' && section === 'tasks') || (permission === 'delete' && section === 'tasks') ) {
          const taskId = req.params.id;
          const task = await fetchTaskById( taskId );
          if ( !task ) {
            return next( new ApiError( { message: 'Not found', infos: { statusCode: 404 } } ) );
          }
          if ( String( decoded.data.id ) === String( task.createdBy ) ) {
            return next();
          }
        }

        // Suppression de plusieurs taches en même temps
        if ( permission === 'deleteMany' && section === 'tasks' ) {
          const { ids } = req.body;
          if ( !Array.isArray( ids ) || !ids.every( id => Types.ObjectId.isValid( id ) ) ) {
            return next(
              new ApiError( { message: 'L\'ID de la tâche n\'est pas valide', infos: { statusCode: 400 } } ) );
          }
          const tasks = await TasksModel.find( { _id: { $in: ids } } );
          if ( tasks.length !== ids.length ) {
            return next( new ApiError( { message: 'One or more tasks not found', infos: { statusCode: 404 } } ) );
          }
          if ( !tasks.every( task => String( decoded.data.id ) === String( task.createdBy ) ) ) {
            return next( new ApiError(
              { message: 'User is not authorized to delete one or more of the tasks', infos: { statusCode: 403 } } ) );
          }
          return next();
        }

        // vérifie le créateur de la tache
        if ( (permission === 'update' && section === 'comments') || (permission === 'delete' && section === 'comments') ) {
          const commentId = req.params.id;

          const comment = await fetchCommentById( commentId );

          if ( !comment ) {
            return next( new ApiError( { message: 'Not found', infos: { statusCode: 404 } } ) );
          }
          if ( String( decoded.data.id ) === String( comment.user ) ) {
            return next();
          }
        }


        //? Fin des différents cas de comparaison et message d'erreur si passage dans aucun

        return next( new ApiError( { message: 'Unauthorized', infos: { statusCode: 403 } } ) );
      }
      return next( new ApiError( { message: 'Unauthorized', infos: { statusCode: 403 } } ) );
    } catch ( err ) {
      return next( new ApiError( { message: 'Unauthorized', infos: { statusCode: 403 } } ) );
    }
  };
};

/**
 * Valide un jeton de rafraîchissement par rapport à celui stocké en base de données
 *
 * @param {string} token - un jeton de rafraîchissement
 * @returns {boolean}
 */
export const isValidRefreshToken = async ( token: string ): Promise<boolean> => {
  if ( !JWT_REFRESH_SECRET ) {
    throw new Error( 'JWT_REFRESH_SECRET is not defined' );
  }

  const decodedRefreshToken = jwt.verify( token, JWT_REFRESH_SECRET as Secret ) as decodedRefreshTokenType;
  const storedToken = await getRefreshToken( decodedRefreshToken.id );

  return token === String( storedToken );
};

/**
 * Récupère l'utilisateur à partir de l'email stocké dans le jeton d'accès
 *
 * @param {string} token - un jeton d'accès (peut avoir expiré)
 * @returns {Promise<userType>} un objet utilisateur
 */
export const getTokenUser = async ( token: string ): Promise<userType | null> => {
  if ( !JWT_SECRET ) {
    throw new Error( 'JWT_SECRET is not defined' );
  }

  const decoded = jwt.verify( token, JWT_SECRET, { ignoreExpiration: true } ) as DecodedAccessTokenType;

  return fetchUserByEmail( decoded.data.email );
};
