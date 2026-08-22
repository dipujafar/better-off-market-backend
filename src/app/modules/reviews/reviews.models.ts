
import { model, Schema } from 'mongoose';
import { IReviews, IReviewsModules } from './reviews.interface';

const reviewsSchema = new Schema<IReviews>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

reviewsSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

reviewsSchema.pre('findOne', function (next) {
  this.where({ isDeleted: false });
  next();
});

reviewsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Reviews = model<IReviews, IReviewsModules>(
  'Reviews',
  reviewsSchema
);
export default Reviews;