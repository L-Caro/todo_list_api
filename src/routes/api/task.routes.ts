import { Router } from 'express';
import { authorize } from 'src/config/token/auth.config';
import {
  taskChangeOrder,
  taskCreate, taskDelete,
  taskFetchOne,
  tasksFetchAll, taskUpdate

} from 'src/controllers/tasks.controller';
import { taskCreateValidations, taskUpdateValidations } from 'src/validations/task.validations';
import { validate } from 'src/validations/Validate';

const tasksRouter = Router();

// @ts-ignore
tasksRouter.get('/', tasksFetchAll);
tasksRouter.get('/:id', taskFetchOne);

// @ts-ignore
tasksRouter.post('/', authorize('create', 'tasks'), validate( taskCreateValidations, 'body'), taskCreate);

// @ts-ignore
tasksRouter.patch('/:id', authorize('update', 'tasks'), validate( taskUpdateValidations, 'body' ), taskUpdate);
tasksRouter.delete('/:id', authorize('delete', 'tasks'), taskDelete);

// Glisser déposer
tasksRouter.patch('/:id/order', taskChangeOrder)

export default tasksRouter;
