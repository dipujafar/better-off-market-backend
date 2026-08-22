
import httpStatus from 'http-status';
import { IReports } from './reports.interface';
import Reports from './reports.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createReports = async (payload: IReports) => {
  const result = await Reports.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create reports');
  }
  return result;
};

const getAllReports = async (query: Record<string, any>) => {
  query["isDeleted"] = false;
  const reportsModel = new QueryBuilder(Reports.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await reportsModel.modelQuery;
  const meta = await reportsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getReportsById = async (id: string) => {
  const result = await Reports.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Reports not found!');
  }
  return result;
};

const updateReports = async (id: string, payload: Partial<IReports>) => {
  const result = await Reports.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Reports');
  }
  return result;
};

const deleteReports = async (id: string) => {
  const result = await Reports.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete reports');
  }
  return result;
};

export const reportsService = {
  createReports,
  getAllReports,
  getReportsById,
  updateReports,
  deleteReports,
};