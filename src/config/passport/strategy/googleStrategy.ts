/**
 * Stratégie d'authentification Google OAuth2 avec Passport.js
 *
 * Cette stratégie permet à l'utilisateur de s'authentifier avec son compte Google.
 * Si l'utilisateur est déjà enregistré dans la base de données, il est connecté.
 * Sinon, un nouveau compte utilisateur est créé et connecté.
 */

import { Request } from 'express';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import * as process from 'process';

import {
  DoneFunction,
  googleProfileType
} from 'src/@types/passport';
import { ApiError } from 'src/config/error/apiError.config';

import User from 'src/database/Models/user.model';

import {
  fetchUserByEmail,
  fetchUserByGoogleId
} from 'src/queries/users.queries';

// Création de la stratégie Google OAuth2
const googleStrategy = new GoogleStrategy( {
    clientID: process.env.GOOGLE_CLIENT_ID!, // Identifiant client Google OAuth2
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Clé secrète client Google OAuth2
    callbackURL: 'https://localhost:3000/api/auth/google/cb', // URL de redirection après l'authentification
    passReqToCallback: true // Indique à Passport de passer l'objet Request à la fonction de rappel
  },
  // Fonction de rappel exécutée lors de l'authentification avec Google
  async ( _request: Request, _accessToken: string, _refreshToken: string, profile: googleProfileType, done: DoneFunction ) => {
    try {
      const { id, displayName, email } = profile; // Récupération des informations du profil Google

      const existingUser = await fetchUserByEmail( email ); // Recherche de l'utilisateur dans la base de données par
                                                         // e-mail
      if (existingUser) {
        // Si l'utilisateur existe déjà avec cet e-mail, vous refusez la connexion.
        // Vous pouvez personnaliser le message d'erreur selon vos besoins
        return done(new ApiError(
          { message: 'Un utilisateur avec cet e-mail existe déjà. Veuillez vous connecter en utilisant votre e-mail et votre mot de passe.', infos: { statusCode: 401 } } ))
      }

      // S'il n'y a pas d'utilisateur existant avec cet e-mail, vous pouvez procéder à l'authentification Google

      const userId = await fetchUserByGoogleId( id ); // Recherche de l'utilisateur dans la base de données par ID
                                                      // Google
      if ( userId ) {
        return done( null, userId );
      }

      // Création d'un nouvel utilisateur s'il n'existe pas dans la base de données
      const newUser = new User( {
        username: displayName.toLowerCase(), // Utilisation du nom d'affichage Google comme nom d'utilisateur
        googleId: id, // ID Google de l'utilisateur
        email // Adresse e-mail de l'utilisateur
      } );
      const savedUser = await newUser.save(); // Enregistrement du nouvel utilisateur dans la base de données
      return done( null, savedUser ); // Connexion du nouvel utilisateur
    } catch ( err ) {
      const apiError = new ApiError(
        { message: 'Erreur lors de l\'authentification avec Google', infos: { statusCode: 500 } } );
      return done( apiError, null ); // Gestion des erreurs avec ApiError
    }
  }
);

export default googleStrategy; // Export de la stratégie d'authentification Google OAuth2
