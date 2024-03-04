import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { UserModel, userType } from 'src/@types/user';
import { ApiError } from 'src/config/error/apiError.config';


const schema = mongoose.Schema;

const userSchema = new schema<userType>( {
  accessToken: { type: String },
  refreshToken: { type: String },
  email: { type: String },
  password: { type: String },
  isDeleted: {
    type: Boolean,
    default: false
  },
  username: { type: String, unique: true },
  googleId: { type: String },
  profilePicture: { type: String, default: '/upload/profilePictures/profile.svg' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
} );

userSchema.statics.hashPassword = async ( password: string ): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt( Number( process.env.SALT ) );
    return bcrypt.hash(password, salt);
  } catch ( e ) {
    throw new ApiError( { message: 'Erreur lors du hachage du mot de passe', infos: { statusCode: 500 } } );
  }
};

userSchema.methods.comparePassword = function ( password: string ) {
  return bcrypt.compare( password, this.password );
};

const User = mongoose.model<userType, UserModel>( 'user', userSchema );

export default User;
