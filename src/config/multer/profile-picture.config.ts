import { Request } from 'express';
import { Error } from 'mongoose';

import multer from 'multer';
import path from 'path';
import { ApiError } from 'src/config/error/apiError.config';

//* Config à faire pour chaque input image afin d'avoir toujours un emplacement spécifique et des règles de validations
// appropriées * A importer dans le router ayant le fichier à récupérer

const uploadProfilePicture = multer( {
  // Gère l'emplacement et nommage des fichiers
  storage: multer.diskStorage( {
    destination: path.join( __dirname, '../../../public/upload/profilePictures' ),
    filename: ( _req: Request, file: Express.Multer.File, callback: ( error: (Error | null), filename: string ) => void ) => {
      const uniqueSuffix = `${ Date.now() }-${ Math.round( Math.random() * 1e9 ) }`;
      callback( null, `${ uniqueSuffix }-${ file.originalname }` );
    }
  } ),
// Pose des limites sur ce qui peut être reçu (taille du fichier, longueur du nom...)
  limits: {
    fileSize: 6 * 1024 * 1024 // 6Mo
  }
  ,
// Controle les noms de fichiers, extensions...
  fileFilter( _req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback ) {
    const allowedMimes = [ 'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml' ];
    if ( allowedMimes.includes( file.mimetype ) ) {
      // Accepte le fichier
      callback( null, true );
    } else {
      // Rejette le fichier avec une erreur
      const apiError = new ApiError( { message: 'Format de fichier non pris en charge', infos: { statusCode: 400 } } );
      // @ts-ignore
      callback( apiError, false );
    }
  }
} );

export default uploadProfilePicture;
