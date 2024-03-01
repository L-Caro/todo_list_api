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
  updatedAt: Date,
} );


const Task = mongoose.model( 'task', taskSchema );

export default Task;
