import dotenv from 'dotenv';
import errorHandler from 'errorhandler';
import express from 'express';
import path from 'path';

// Variables d'environnement
const env = (process.env.NODE_ENV || 'development').trim();
dotenv.config( { path: path.join( __dirname, `../.env.${ env }` ) } );

// Passeport / Session
import passport from './config/passport/passport.config'; // Importez la configuration de Passport

// Database
import 'src/database';

// Morgan
import { morganConfig } from 'src/config/morgan.config';

// Router
import router from 'src/routes';

// === Construction de l'app ===
const app = express();

// === Session / Passport ===
app.use( passport.initialize() );

// === Setup du logger Morgan ===
app.use( morganConfig );

// === Setup du dossier static ===
app.use( express.static( path.join( __dirname, '../public' ) ) );

// === Setup body parser ===
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

// === Routes ===
app.use( router );

// === Gestion des erreurs ===
app.use( errorHandler() );

export default app;
