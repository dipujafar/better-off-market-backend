
import { Model, Types } from 'mongoose';

export interface IReports {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    seller: Types.ObjectId;
    subject: string;
    description: string;
    isDeleted: boolean;
}

export type IReportsModules = Model<IReports, Record<string, unknown>>;