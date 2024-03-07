import * as Mongoose from 'mongoose';
import { Document } from 'mongoose';


export interface taskType extends Document {
  title: string,
  description: string | null,
  dueDate: Date | null,
  doneDate: Date | null,
  status: string,
  recurrence: string,
  assignedTo: Mongoose.ObjectId,
  orderIndices: {
    daily: number,
    weekly: number,
    monthly: number,
    bimonthly: number,
    annually: number,
    biannually: number,
    punctual: number
  } & { [key: string]: number }
  tags: [ string ] | null,
  createdBy: Mongoose.ObjectId,
  createdAt: Date,
  updatedAt: Date
}
