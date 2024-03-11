import { Router } from 'express';
import { googleAuth, googleAuthCb, login, logout, tokenRefresh } from 'src/controllers/auth.controller';


const authRouter = Router();

// Connexion

authRouter.post( '/signin', login );
authRouter.get( '/signout', logout );

// Google connexion
authRouter.get( '/google', googleAuth );
authRouter.get( '/google/cb', googleAuthCb );

// Rafraichissement du token
authRouter.put( '/refresh-token', tokenRefresh );

export default authRouter;
