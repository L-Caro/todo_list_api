import {Request, Response, Router} from 'express';
import { ApiError } from 'src/config/error/apiError.config';
import authRouter from 'src/routes/api/auth.routes';
import apiRouter from './api';


const router = Router();



export const googleAuthSuccess = (_req: Request, res: Response) => {
  return res.status(200).json({
    statusCode: 200,
    status: 'success',
    message: 'Authentification Google réussie'
  });
}
export const googleAuthFailure = (_req: Request, res: Response) => {
  return res.status(401).json({
    statusCode: 401,
    status: 'failure',
    message: 'Échec de l\'authentification Google'
  });
}



// Redirects de google auth
router.get('/', googleAuthSuccess);
authRouter.get('/api/auth/signin', googleAuthFailure);



// Les routes qui consomment l'api
router.use( '/api', apiRouter );

// La gestion des erreurs
router.use( () => {
  throw new ApiError( { message: 'API Route not found', infos: { statusCode: 404 } } );
} );
export default router;
