import { ObjectId } from 'mongodb';

export interface TNotification {
  receiver: ObjectId;
  message: string;
  description?: string;
  // refference: ObjectId;
  date?: Date;
  read: boolean;
  isDeleted: boolean;
}
