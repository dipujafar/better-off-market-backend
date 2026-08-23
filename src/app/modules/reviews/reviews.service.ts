
import httpStatus from 'http-status';
import { IReviews } from './reviews.interface';
import Reviews from './reviews.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { Types } from 'mongoose';

const createReviews = async (payload: IReviews) => {
  const result = await Reviews.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create reviews');
  }
  return result;
};

const getAllReviews = async (query: Record<string, any>) => {
  query["isDeleted"] = false;
  const reviewsModel = new QueryBuilder(Reviews.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await reviewsModel.modelQuery;
  const meta = await reviewsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getReviewsById = async (id: string) => {
  const result = await Reviews.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Reviews not found!');
  }
  return result;
};

const getAllReviewsBySeller = async (
  sellerId: string,
  query: Record<string, any>,
) => {
  query['isDeleted'] = false;

  const reviewsModel = new QueryBuilder(
    Reviews.find({ seller: sellerId }).populate('user'),
    query,
  )
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await reviewsModel.modelQuery;
  const meta = await reviewsModel.countTotal();

  const ratingAgg: { _id: number; count: number }[] = await Reviews.aggregate([
    {
      $match: {
        seller: new Types.ObjectId(sellerId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap: Record<number, number> = {};
  let totalReviews = 0;
  let ratingSum = 0;

  for (const r of ratingAgg) {
    countMap[r._id] = r.count;
    totalReviews += r.count;
    ratingSum += r._id * r.count;
  }

  const avgRating = totalReviews
    ? Number((ratingSum / totalReviews).toFixed(1))
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: countMap[star] || 0,
  }));

  return {
    data,
    meta,
    summary: {
      avgRating,
      totalReviews,
      ratingBreakdown,
    },
  };
};

const updateReviews = async (id: string, payload: Partial<IReviews>) => {
  const result = await Reviews.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Reviews');
  }
  return result;
};

const deleteReviews = async (id: string) => {
  const result = await Reviews.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete reviews');
  }
  return result;
};

export const reviewsService = {
  createReviews,
  getAllReviews,
  getReviewsById,
  getAllReviewsBySeller,
  updateReviews,
  deleteReviews,
};