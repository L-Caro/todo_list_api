import * as Mongoose from 'mongoose';
import { Document } from 'mongoose';


export interface taskCommentType extends Document {
  comment: string,
  task: Mongoose.ObjectId,
  user: Mongoose.ObjectId,
  createdAt: Date,
  updatedAt: Date,
}
