
import { model, Schema } from 'mongoose';
import { IFavorite, IFavoriteModules } from './favorite.interface';

const favoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

//favoriteSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//favoriteSchema.pre('findOne', function (next) {
//@ts-ignore
//this.find({ isDeleted: { $ne: true } });
// next();
//});

favoriteSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

favoriteSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Favorite = model<IFavorite, IFavoriteModules>(
  'Favorite',
  favoriteSchema
);
export default Favorite;