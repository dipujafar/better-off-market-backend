
import { model, Schema } from 'mongoose';
import { IGetInTouch, IGetInTouchModel, } from './getInTouch.interface';

const getInTouchSchema = new Schema<IGetInTouch>(
  {
    counties: { type: [String], required: true },
    propertyTypes: { type: [String], required: true },
    email: { type: String, required: true, unique: true, trim: true },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

getInTouchSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

getInTouchSchema.pre('findOne', function (next) {
  this.where({ isDeleted: false });
  next();
});

getInTouchSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

getInTouchSchema.statics.isEmailExist = async function (email: string) {
  return await this.findOne({ email });
}


const GetInTouch = model<IGetInTouch, IGetInTouchModel>(
  'GetInTouch',
  getInTouchSchema
);
export default GetInTouch;