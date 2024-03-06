import { taskCommentType } from 'src/@types/taskComments';
import { ApiError } from 'src/config/error/apiError.config';
import TaskComment from 'src/database/Models/taskComment.model';


export const fetchCommentById = ( id: string ) => {
  try {
    return TaskComment.findOne( { '_id': id } );
  } catch ( error ) {
    throw new ApiError(
      { message: 'Erreur lors de la récupération du commentaire', infos: { statusCode: 500 } } );
  }
};

export const createComment = async( commentData : taskCommentType) => {
  try {
    const newComment = new TaskComment(commentData);
    console.log('new', newComment)
    await newComment.validate();
    return newComment.save();
  } catch (error) {
    throw new ApiError(
      { message: 'Erreur lors de la création du commentaire', infos: { statusCode: 500 } }
    );
  }
}
