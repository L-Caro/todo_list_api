import { NextFunction, Response } from 'express';

// Fonction validate qui liste les erreurs Joy et les envoie en json pour le front
export function validate( schema: { validate: ( arg0: any ) => { error: any; }; }, dataSource: string | number ) {
  return ( request: Request, response: Response, next: NextFunction ) => {
    // @ts-ignore
    const { error } = schema.validate( request[ dataSource ], { abortEarly: false } );
    if ( error ) {
      return response.status( 400 ).json( { errors: error.details.map( ( err: Error ) => err.message ) } );
    }
    return next();
  };
}
