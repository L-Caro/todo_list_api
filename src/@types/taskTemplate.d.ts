import { Document } from 'mongoose';


export interface taskTemplateType extends Document {
  title: string,
  description: string,
  tags: [string],
  createdAt: Date
}
