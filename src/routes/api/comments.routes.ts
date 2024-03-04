import { Router } from 'express';
import { authorize } from 'src/config/token/auth.config';
import {
  commentCreate, commentDelete, commentFetchOne, commentsFetchAll, commentUpdate
} from 'src/controllers/comments.controller';

import { taskCommentValidation } from 'src/validations/taskComment.validations';
import { validate } from 'src/validations/Validate';

const commentsRouter = Router();

// @ts-ignore
commentsRouter.get('/', commentsFetchAll);
commentsRouter.get('/:id', commentFetchOne);

// @ts-ignore
commentsRouter.post('/', authorize('create', 'comments'), validate( taskCommentValidation, 'body'), commentCreate);

// @ts-ignore
commentsRouter.patch('/:id', authorize('update', 'comments'), validate( taskCommentValidation, 'body' ), commentUpdate);
commentsRouter.delete('/:id', authorize('delete', 'comments'), commentDelete);

export default commentsRouter;
