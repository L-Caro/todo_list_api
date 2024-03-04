import { taskType } from 'src/@types/task';
import { ApiError } from 'src/config/error/apiError.config';
import Task from 'src/database/Models/tasks.model';


export const fetchTaskById = ( id: string ) => {
  try {
    return Task.findOne( { '_id': id } );
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors de la récupération de la tache', infos: { statusCode: 500 } } );
  }
};

export const createTask = async( taskData : taskType) => {
  try {
    const newTask = new Task(taskData);
    console.log('new', newTask)
    await newTask.validate();
    return newTask.save();
  } catch (error) {
    throw new ApiError(
      { message: 'Erreur lors de la création de la tâche', infos: { statusCode: 500 } }
    );
  }
}
