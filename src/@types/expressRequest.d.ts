import { Request as ExprRequest } from 'express';

export interface Request extends ExprRequest {
  userId: string;
}


export interface RequestWithQuery extends Request {
  query: {
    dueDateBefore?: string,
    createdAtStart?: string,
    createdAtEnd?: string,
    withoutDueDate?: string,
    isOverdue?: string,
    createdInPastDays?: string,
    assignedToMe?: string,
    tags?: string,
  };
}
