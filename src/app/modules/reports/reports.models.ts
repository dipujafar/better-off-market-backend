
import { model, Schema } from 'mongoose';
import { IReports, IReportsModules } from './reports.interface';

const reportsSchema = new Schema<IReports>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

reportsSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

reportsSchema.pre('findOne', function (next) {
  this.where({ isDeleted: false });
  next();
});

reportsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Reports = model<IReports, IReportsModules>(
  'Reports',
  reportsSchema
);
export default Reports;