import mongoose from 'mongoose';
import * as Mongoose from 'mongoose';
import { taskTemplateType } from 'src/@types/taskTemplate';

const schema = Mongoose.Schema;

const taskTemplateSchema = new schema<taskTemplateType>( {
  title: String,
  description: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
})

const TaskTemplate = mongoose.model( 'taskTemplate', taskTemplateSchema );

export default TaskTemplate;
