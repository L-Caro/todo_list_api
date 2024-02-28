import { RequestHandler } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { DecodedAccessTokenType, decodedRefreshTokenType } from 'src/@types/jwt';
import { userType } from 'src/@types/user';
import { ApiError } from 'src/config/error/apiError.config';
import { fetchUserByEmail, getRefreshToken } from 'src/queries/users.queries';


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
  return async ( req, _res, next ) => {
    try {
      const authHeader = req.headers.authorization;
      console.log( 'authHeader', authHeader );
      if ( !JWT_SECRET ) {
        throw new ApiError( { message: 'Ud', infos: { statusCode: 402 } } );
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
        // vérifie la création de projet
        if ( permission === 'mainRoute' && section === 'testJWT' ) {
          return next();
        }

        //? Fin des différents cas de comparaison et message d'erreur si passage dans aucun

        return next( new ApiError( { message: 'Unrized', infos: { statusCode: 404 } } ) );
      }
      return next( new ApiError( { message: 'Unauthod', infos: { statusCode: 406 } } ) );
    } catch ( err ) {
      return next( new ApiError( { message: 'Unzed', infos: { statusCode: 407 } } ) );
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
  console.log( 'token', token );

  const decodedRefreshToken = jwt.verify( token, JWT_REFRESH_SECRET as Secret ) as decodedRefreshTokenType;
  console.log( 'deco', decodedRefreshToken );
  const storedToken = await getRefreshToken( decodedRefreshToken.id );
  console.log( 'store', storedToken );
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
  console.log( 'deeeecoded', decoded );
  return fetchUserByEmail( decoded.data.email );
};
