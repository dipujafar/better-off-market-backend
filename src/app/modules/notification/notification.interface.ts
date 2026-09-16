import { ObjectId } from 'mongodb';

export interface TNotification {
  receiver: ObjectId;
  message: string;
  description?: string;
  // refference: ObjectId;
  date?: Date;
  link?: string;
  read: boolean;
  isDeleted: boolean;
}
