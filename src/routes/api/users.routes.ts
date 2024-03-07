import { Router } from 'express';

import upload from 'src/config/multer/profile-picture.config';
import { authorize } from 'src/config/token/auth.config';
import {
  uploadImage, userCreate, userDelete, userFetch, usersFetch, userUpdate
} from 'src/controllers/users.controller';
import {userUpdateValidation, userCreateValidation} from 'src/validations/user.validations';

import { validate } from 'src/validations/Validate';


const usersRouter = Router();

usersRouter.get( '/', usersFetch );
usersRouter.get( '/:id', userFetch );
// @ts-ignore
usersRouter.post( '/', upload.single( 'image' ), validate( userCreateValidation, 'body' ), userCreate ); // Joy vérifie les
// @ts-ignore
usersRouter.put( '/:id', authorize('update', 'users'), validate( userUpdateValidation, 'body' ), userUpdate );
usersRouter.delete( '/:id', authorize('delete', 'users'), userDelete );

// image
usersRouter.post( '/update/image', upload.single( 'profile' ), uploadImage );

export default usersRouter;
