
import httpStatus from 'http-status';
import { IFavorite } from './favorite.interface';
import Favorite from './favorite.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { Property } from '../properties/properties.models';

const createFavorite = async (payload: IFavorite) => {
  const result = await Favorite.create(payload);

  Property.findByIdAndUpdate(result?.property, {
    $inc: { totalSaved: 1 },
  }).catch((err) => {
    console.error('Failed to increment favoriteCount:', err);
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create favorite');
  }
  return result;
};

const getAllFavorite = async (query: Record<string, any>) => {
  query["isDeleted"] = false;
  const favoriteModel = new QueryBuilder(Favorite.find().populate('property'), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await favoriteModel.modelQuery;
  const meta = await favoriteModel.countTotal();

  return {
    data,
    meta,
  };
};

const getFavoriteById = async (id: string) => {
  const result = await Favorite.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Favorite not found!');
  }
  return result;
};

const updateFavorite = async (id: string, payload: Partial<IFavorite>) => {
  const result = await Favorite.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Favorite');
  }
  return result;
};

const deleteFavorite = async (id: string) => {
  const result = await Favorite.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete favorite');
  }

  Property.findByIdAndUpdate(result.property, {
    $inc: { totalSaved: -1 },
  }).catch((err) => {
    console.error('Failed to decrement favoriteCount:', err);
  });


  return result;
};

export const favoriteService = {
  createFavorite,
  getAllFavorite,
  getFavoriteById,
  updateFavorite,
  deleteFavorite,
};