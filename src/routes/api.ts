import { Router } from 'express';

import authRouter from 'src/routes/api/auth.routes';
import tasksRouter from 'src/routes/api/task.routes';
import usersRouter from './api/users.routes';


const apiRouter = Router();

// Les routes users ne seront disponible que si on est connecté
// En vrai il ne faut pas mettre, c'est pour montrer la syntaxe d'un guard sur un controller
apiRouter.use( '/users', usersRouter );
apiRouter.use( '/auth', authRouter );
apiRouter.use('/tasks', tasksRouter)

export default apiRouter;
