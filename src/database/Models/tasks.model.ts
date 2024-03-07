import * as Mongoose from 'mongoose';
import mongoose from 'mongoose';
import { taskType } from 'src/@types/task';


const schema = mongoose.Schema;

const taskSchema = new schema<taskType>( {
  title: String,
  description: String,
  dueDate: Date,
  doneDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  recurrence: {
    type: String,
    enum: [null, 'daily', 'weekly', 'monthly', 'bimonthly', 'annually', 'biannually', 'punctual'],
    default: 'punctual'
  },
  orderIndices: {
    daily: { type: Number },
    weekly: { type: Number },
    monthly: { type: Number },
    bimonthly: { type: Number },
    annually: { type: Number },
    biannually: { type: Number },
    punctual: { type: Number },
  },
  assignedTo: {
    type: Mongoose.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Mongoose.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
} );


const Task = mongoose.model( 'task', taskSchema );

export default Task;
