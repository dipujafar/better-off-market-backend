
import { Model, Types } from 'mongoose';

export interface IReviews {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    seller: Types.ObjectId;
    property: Types.ObjectId;
    rating: number;
    review: string;
    isDeleted: boolean;
}

export type IReviewsModules = Model<IReviews, Record<string, unknown>>;