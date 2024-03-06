import { Router } from 'express';
import { authorize } from 'src/config/token/auth.config';
import {
  notificationCreate,
  notificationDelete, notificationFetchOne, notificationsFetchAll, notificationUpdate
} from 'src/controllers/notifications.controller';

import { taskNotificationValidation } from 'src/validations/taskNotification.validations';
import { validate } from 'src/validations/Validate';

const notificationsRouter = Router();

// @ts-ignore
notificationsRouter.get('/', notificationsFetchAll);
notificationsRouter.get('/:id', notificationFetchOne);

// @ts-ignore
notificationsRouter.post('/', authorize('create', 'notifications'), validate( taskNotificationValidation, 'body'), notificationCreate);

// @ts-ignore
notificationsRouter.patch('/:id', authorize('update', 'notifications'), validate( taskNotificationValidation, 'body' ), notificationUpdate);
notificationsRouter.delete('/:id', authorize('delete', 'notifications'), notificationDelete);

export default notificationsRouter;
