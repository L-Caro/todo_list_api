import { Router } from 'express';

import upload from 'src/config/multer/profile-picture.config';
import {
  uploadImage, userCreate, userDelete, userFetch, usersFetch, userUpdate
} from 'src/controllers/users.controller';
import { userValidation } from 'src/validations/user.validations';

import { validate } from 'src/validations/userValidate';
import { authorize } from '../../config/token/auth.config';


const usersRouter = Router();

usersRouter.get( '/', authorize( 'mainRoute', 'testJWT' ), usersFetch ); // test de route avec JWT
usersRouter.get( '/:id', userFetch );
// @ts-ignore
usersRouter.post( '/', upload.single( 'image' ), validate( userValidation, 'body' ), userCreate ); // Joy vérifie les
// @ts-ignore
usersRouter.put( '/:id', validate( userValidation, 'body' ), userUpdate );
usersRouter.delete( '/:id', userDelete );

// image
usersRouter.post( '/update/image', upload.single( 'profile' ), uploadImage );

export default usersRouter;
