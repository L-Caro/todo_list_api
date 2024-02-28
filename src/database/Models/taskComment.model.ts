import mongoose from 'mongoose';
import * as Mongoose from 'mongoose';
import { taskCommentType } from 'src/@types/taskComments';


const schema = Mongoose.Schema;

const taskCommentSchema = new schema<taskCommentType>( {
  task: {
    type: Mongoose.Types.ObjectId,
    ref: 'Task'
  },
  user: {
    type: Mongoose.Types.ObjectId,
    ref: 'User'
  },
  comment: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
})

const TaskComment = mongoose.model( 'taskComment', taskCommentSchema );

export default TaskComment;
