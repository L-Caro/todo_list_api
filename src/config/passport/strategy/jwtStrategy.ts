/**
 * Stratégie d'authentification locale avec Passport.js
 *
 * Cette stratégie permet à l'utilisateur de s'authentifier avec un identifiant et un mot de passe locaux.
 * Elle utilise le module `passport-local` pour gérer l'authentification.
 * Si l'utilisateur fournit des identifiants valides, il est connecté. Sinon, une erreur est renvoyée.
 */

// Import des modules et des types nécessaires
import { Strategy as JwtStrategy } from 'passport-local';

import { userType } from 'src/@types/user';
import { ApiError } from 'src/config/error/apiError.config';

import { fetchUserByEmail } from 'src/queries/users.queries';

// Création de la stratégie locale d'authentification
// Remplacement de usernameField par l'email (username par défaut)
const jwtStrategy = new JwtStrategy( { usernameField: 'email' }, async ( email, password, done ) => {
  try {
    const user: userType | null = await fetchUserByEmail( email ); // Recherche de l'utilisateur dans la base de
    // données par e-mail
    // Vérification si l'utilisateur existe dans la base de données
    if ( !user ) {
      const apiError = new ApiError(
        { message: 'Mauvaise combinaison email/mot de passe', infos: { statusCode: 401 } } );
      return done( apiError );
    }

    const match = await user.comparePassword( password ); // Comparaison du mot de passe fourni avec celui stocké en

    if ( match ) {
      return done( null, user ); // Si les mots de passe correspondent, l'utilisateur est connecté.
    } else {
      // Création d'une instance de ApiError pour gérer les erreurs
      const apiError = new ApiError(
        { message: 'Mauvaise combinaison email/mot de passe', infos: { statusCode: 401 } } );
      return done( apiError );
    }

  } catch ( err ) {
    const apiError = new ApiError(
      { message: 'Erreur lors de la vérification du mot de passe', infos: { statusCode: 500 } } );
    return done( apiError );
  }
} );

export default jwtStrategy; // Export de la stratégie
