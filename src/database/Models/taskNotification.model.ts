import mongoose from 'mongoose';
import * as Mongoose from 'mongoose';
import { taskNotificationType } from 'src/@types/taskNotification';

const schema = Mongoose.Schema;

const taskNotificationSchema = new schema<taskNotificationType>( {
  user: {
    type: Mongoose.Types.ObjectId,
    ref: 'User'
  },
  task: {
    type: Mongoose.Types.ObjectId,
    ref: 'Task'
  },
  notificationType: {
    type: String,
    enum: ['TaskDelay', 'RepeatTask', 'NewTask', 'TaskDeleted', 'NewComment'],
    required: true
  },
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread'
  }
})

const TaskNotification = mongoose.model( 'taskNotification', taskNotificationSchema );

export default TaskNotification;
