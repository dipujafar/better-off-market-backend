import httpStatus from 'http-status';
import { IGetInTouch } from './getInTouch.interface';
import GetInTouch from './getInTouch.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createGetInTouch = async (payload: IGetInTouch) => {
  const isEmailExist = await GetInTouch.isEmailExist(payload.email);

  if (isEmailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Get notified feature already subscribed with this email');
  }
  const result = await GetInTouch.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create getInTouch');
  }
  return result;
};

const getAllGetInTouch = async (query: Record<string, any>) => {
  query["isDeleted"] = false;
  const getInTouchModel = new QueryBuilder(GetInTouch.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await getInTouchModel.modelQuery;
  const meta = await getInTouchModel.countTotal();

  return {
    data,
    meta,
  };
};

const getGetInTouchById = async (id: string) => {
  const result = await GetInTouch.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('GetInTouch not found!');
  }
  return result;
};

const updateGetInTouch = async (id: string, payload: Partial<IGetInTouch>) => {
  const result = await GetInTouch.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update GetInTouch');
  }
  return result;
};

const deleteGetInTouch = async (id: string) => {
  const result = await GetInTouch.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete getInTouch');
  }
  return result;
};

export const getInTouchService = {
  createGetInTouch,
  getAllGetInTouch,
  getGetInTouchById,
  updateGetInTouch,
  deleteGetInTouch,
};