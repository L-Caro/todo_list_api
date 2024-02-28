import { Router } from 'express';
import { ApiError } from 'src/config/error/apiError.config';
import apiRouter from './api';


const router = Router();

// Homepage, À voir ce qu'il faut envoyer
router.get( '/' );

// les routes qui consomment l'api
router.use( '/api', apiRouter );

router.use( () => {
  throw new ApiError( { message: 'API Route not found', infos: { statusCode: 404 } } );
} );
export default router;
