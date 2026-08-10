
import { Model, Types } from 'mongoose';

export interface IFavorite {
    user: Types.ObjectId,
    property: Types.ObjectId,
    isDeleted: boolean;
}

export type IFavoriteModules = Model<IFavorite, Record<string, unknown>>;