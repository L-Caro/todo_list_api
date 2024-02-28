import * as Mongoose from 'mongoose';
import { Document } from 'mongoose';


export interface taskType extends Document {
  title: string,
  description: string,
  dueDate: Date,
  status: string,
  recurrence: string,
  assignedTo: Mongoose.ObjectId
  tags: [ string ],
  createdAt: Date,
  updatedAt: Date
}
