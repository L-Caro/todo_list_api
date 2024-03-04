import * as Mongoose from 'mongoose';
import { Document } from 'mongoose';


export interface taskNotificationType extends Document {
  user: Mongoose.ObjectId,
  task: Mongoose.ObjectId,
  notificationType: string,
  content: string,
  status: string,
  createdAt: Date,
  updatedAt: Date,
}
