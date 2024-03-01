import { Router } from 'express';
import { authorize } from 'src/config/token/auth.config';
import { taskCreate, tasksFetch } from 'src/controllers/tasks.controller';
import { taskValidations } from 'src/validations/task.validations';
import { validate } from 'src/validations/Validate';

const tasksRouter = Router();

// @ts-ignore
tasksRouter.get('/', tasksFetch);
// @ts-ignore
tasksRouter.post('/', authorize('create', 'tasks'), validate( taskValidations, 'body'), taskCreate);
// tasksRouter.get('/:id', getOneTask);
// @ts-ignore
// tasksRouter.patch('/:id', authorize('update', 'tasks'), validate( taskValidations, 'body' ), updateTask);
// tasksRouter.delete('/:id', authorize('delete', 'tasks'), deleteTask);

export default tasksRouter;
