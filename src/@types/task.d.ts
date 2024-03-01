import * as Mongoose from 'mongoose';
import { Document } from 'mongoose';


export interface taskType extends Document {
  title: string,
  description: string | null,
  dueDate: Date | null,
  doneDate: Date | null,
  status: string,
  recurrence: string,
  assignedTo: Mongoose.ObjectId
  tags: [ string ] | null,
  createdBy: Mongoose.ObjectId,
  createdAt: Date,
  updatedAt: Date
}
