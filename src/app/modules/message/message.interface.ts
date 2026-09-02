import { Model, Types } from 'mongoose';

export interface IMessageImage {
    url: string;
}

export interface IMessage {
    _id?: Types.ObjectId;
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    text?: string;
    images?: IMessageImage[];
    seen: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type MessageModel = Model<IMessage>;