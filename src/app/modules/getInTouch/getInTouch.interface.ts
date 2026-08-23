import { Model } from 'mongoose';

export interface IGetInTouch {
    counties: string[];
    propertyTypes: string[];
    email: string;
    isDeleted: boolean;
}

export interface IGetInTouchModel extends Model<IGetInTouch> {
    isEmailExist(email: string): Promise<IGetInTouch>;
}