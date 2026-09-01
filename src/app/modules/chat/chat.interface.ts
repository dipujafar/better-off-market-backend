import { Model, Types } from 'mongoose';

export interface IChat {
    _id?: Types.ObjectId;
    participants: Types.ObjectId[];
    status: 'accepted';
}

export type ChatModel = Model<IChat>;