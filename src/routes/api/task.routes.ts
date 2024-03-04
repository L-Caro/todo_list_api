import { Router } from 'express';
import { authorize } from 'src/config/token/auth.config';
import {
  deleteManyTasks, deleteTask, getOneTask, taskCreate, tasksFetch, updateTask
} from 'src/controllers/tasks.controller';
import { taskCreateValidations, taskUpdateValidations } from 'src/validations/task.validations';
import { validate } from 'src/validations/Validate';

const tasksRouter = Router();

// @ts-ignore
tasksRouter.get('/', tasksFetch);

// @ts-ignore
tasksRouter.post('/', authorize('create', 'tasks'), validate( taskCreateValidations, 'body'), taskCreate);
tasksRouter.get('/:id', getOneTask);

// @ts-ignore
tasksRouter.patch('/:id', authorize('update', 'tasks'), validate( taskUpdateValidations, 'body' ), updateTask);
tasksRouter.delete('/:id', authorize('delete', 'tasks'), deleteTask);
tasksRouter.delete('/', authorize('deleteMany', 'tasks'), deleteManyTasks);

export default tasksRouter;
