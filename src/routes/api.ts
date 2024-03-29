import { Router } from 'express';

import authRouter from 'src/routes/api/auth.routes';
import notificationRouter from 'src/routes/api/notification.router';
import tasksRouter from 'src/routes/api/task.routes';
import usersRouter from 'src/routes/api/users.routes';
import commentsRouter from 'src/routes/api/comments.routes'

const apiRouter = Router();

// Les routes users ne seront disponible que si on est connecté
// En vrai il ne faut pas mettre, c'est pour montrer la syntaxe d'un guard sur un controller
apiRouter.use( '/users', usersRouter );
apiRouter.use( '/auth', authRouter );
apiRouter.use('/tasks', tasksRouter)
apiRouter.use('/comments', commentsRouter)
apiRouter.use('/notifications', notificationRouter)

export default apiRouter;
