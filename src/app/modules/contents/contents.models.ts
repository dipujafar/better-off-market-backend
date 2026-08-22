import { Schema, model } from 'mongoose';
import { IContents, IContentsModel } from './contents.interface';

const contentsSchema = new Schema<IContents>(
  {
    aboutUs: {
      type: String,
    },
    termsAndConditions: {
      type: String,
    },
    privacyPolicy: {
      type: String,
    },
    banner: [
      {
        key: {
          type: String,
          required: true,
        },
        url: { type: String, required: true },
      },
    ],
    supports: {
      type: String,
    },
    faq: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

contentsSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

contentsSchema.pre('findOne', function (next) {
  this.where({ isDeleted: false });
  next();
});

contentsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
  next();
});

// filter out deleted documents
const Contents = model<IContents, IContentsModel>('Contents', contentsSchema);

export default Contents;
