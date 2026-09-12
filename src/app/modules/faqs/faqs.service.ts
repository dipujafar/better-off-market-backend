
import httpStatus from 'http-status';
import { IFaqs } from './faqs.interface';
import Faqs from './faqs.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createFaqs = async (payload: IFaqs) => {
  const result = await Faqs.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create faqs');
  }
  return result;
};

const getAllFaqs = async (query: Record<string, any>) => {
  query["isDeleted"] = false;
  const faqsModel = new QueryBuilder(Faqs.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await faqsModel.modelQuery;
  const meta = await faqsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getFaqsById = async (id: string) => {
  const result = await Faqs.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Faqs not found!');
  }
  return result;
};

const updateFaqs = async (id: string, payload: Partial<IFaqs>) => {
  const result = await Faqs.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Faqs');
  }
  return result;
};

const deleteFaqs = async (id: string) => {
  const result = await Faqs.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete faqs');
  }
  return result;
};

export const faqsService = {
  createFaqs,
  getAllFaqs,
  getFaqsById,
  updateFaqs,
  deleteFaqs,
};