import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ApiError } from 'src/config/error/apiError.config';


dotenv.config();

const url = process.env.DB_URL;

if ( !url ) {
  console.error( 'La variable d\'environnement DB_URL n\'est pas définie.' );
} else {
  mongoose.connect( url )
  .then( () => {
    console.log( '🟢 connexion DB ok' );

  } )
  .catch( () => {
    const apiError = new ApiError(
      { message: 'Erreur de connexion à la base de données', infos: { statusCode: 500 } } );
    console.error( apiError );
  } );
}
