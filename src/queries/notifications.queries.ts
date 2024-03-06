import { taskNotificationType } from 'src/@types/taskNotification';
import { ApiError } from 'src/config/error/apiError.config';
import TaskNotification from 'src/database/Models/taskNotification.model';


export const fetchNotificationById = ( id: string ) => {
  try {
    return TaskNotification.findOne( { '_id': id } );
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors de la récupération de la notification', infos: { statusCode: 500 } } );
  }
};

export const createNotification = async( notificationData : Partial<taskNotificationType>) => {
  try {
    const newNotification = new TaskNotification(notificationData);
    console.log('new', newNotification)
    await newNotification.validate();
    return newNotification.save();
  } catch (error) {
    throw new ApiError(
      { message: 'Erreur lors de la création de la notification', infos: { statusCode: 500 } }
    );
  }
}
