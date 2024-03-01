// Typage pour une table user avec email, password, username, googleId et profilePicture
// Typage aussi des fonctions comparePassword et hashPassword
// Le tout avec un Model Mongoose

import { JwtPayload } from 'jsonwebtoken';
import mongoose, { Document } from 'mongoose';


export interface userType extends Document {
  email: string,
  password: string
  username: string,
  googleId: string,
  isDeleted: boolean,
  profilePicture?: string
  accessToken: JwtPayload
  refreshToken: JwtPayload
  createdAt: Date,
  updatedAt: Date,
  comparePassword( password: string ): Promise<boolean>;
}


export interface UserStaticMethods {
  hashPassword( password: string ): Promise<string>;
}


export interface UserModel extends mongoose.Model<userType>, UserStaticMethods {
}
