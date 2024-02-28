import { userType } from 'src/@types/user';
import { ApiError } from 'src/config/error/apiError.config';
import User from 'src/database/Models/user.model';


/**
 * Définit le jeton de rafraîchissement pour un utilisateur dans la base de données
 *
 * @param {string} id - l'identifiant de l'utilisateur
 * @param {string} token - le jeton de rafraîchissement à définir
 * @returns {Promise<any>} une promesse résolue avec les données de l'utilisateur mis à jour
 */
export const setRefreshToken = async ( id: string, token: string ): Promise<any> => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: id }, // Filtre l'utilisateur par son identifiant
      { refreshToken: token }, // Définir le nouveau jeton de rafraîchissement
      { new: true } // renvoyer l'utilisateur mis à jour
    );

    return updatedUser;
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors du rafraichissement du token', infos: { statusCode: 500 } } );
  }
};

/**
 * Récupère le jeton de rafraîchissement pour un utilisateur dans la base de données
 *
 * @param {string} id - l'identifiant de l'utilisateur
 * @returns {Promise<string>} une promesse résolue avec le jeton de rafraîchissement de l'utilisateur
 */
export const getRefreshToken = async ( id: string ) => {
  try {
    const user = await User.findById( id );

    if ( !user ) {
      return null;
    }

    return user.refreshToken;
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors de la récupération du token', infos: { statusCode: 500 } } );
  }
};

export const fetchUserById = ( id: string ) => {
  try {
    return User.findOne( { '_id': id } );
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors de la récupération de l\'utilisateur', infos: { statusCode: 500 } } );
  }
};

export const fetchUserByEmail = ( email: string ) => {
  try {
    return User.findOne( { 'email': email } );
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors de la récupération de l\'utilisateur', infos: { statusCode: 500 } } );
  }
};

export const fetchUserByGoogleId = ( googleId: string ) => {
  try {
    return User.findOne( { 'googleId': googleId } );
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors de la récupération de l\'utilisateur', infos: { statusCode: 500 } } );
  }
};

export const createUser = async ( userData: userType ) => {
  try {
    const hashPassword = await User.hashPassword( userData.password );
    const newUser = new User( {
      username: userData.username,
      email: userData.email,
      password: hashPassword
    } );

    await newUser.validate();
    return newUser.save();
  } catch ( error ) {
    throw new ApiError( { message: 'Erreur lors de la création de l\'utilisateur', infos: { statusCode: 500 } } );
  }
};
