import * as Mongoose from 'mongoose';
import mongoose from 'mongoose';
import { taskType } from 'src/@types/task';


const schema = mongoose.Schema;

const taskSchema = new schema<taskType>( {
  title: String,
  description: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ['Pending', 'In progress', 'Completed'],
    default: 'Pending'
  },
  recurrence: {
    type: String,
    enum: [null, 'Daily', 'Weekly', 'Monthly', 'BiMonthly', 'Annually'],
    default: null
  },
  assignedTo: {
    type: Mongoose.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
} );


const Task = mongoose.model( 'task', taskSchema );

export default Task;
