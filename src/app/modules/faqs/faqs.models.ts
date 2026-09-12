
import { model, Schema } from 'mongoose';
import { IFaqs, IFaqsModules } from './faqs.interface';

const faqsSchema = new Schema<IFaqs>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

faqsSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

faqsSchema.pre('findOne', function (next) {
  this.where({ isDeleted: false });
  next();
});

faqsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Faqs = model<IFaqs, IFaqsModules>(
  'Faqs',
  faqsSchema
);
export default Faqs;