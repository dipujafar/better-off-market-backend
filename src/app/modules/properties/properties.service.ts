import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { IProperty } from './properties.interface';
import { propertySearchableFields } from './properties.constants';
import { Property } from './properties.models';

const createProperty = async (payload: Partial<IProperty>) => {
  const result = await Property.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Property creation failed');
  }
  return result;
};

const getAllProperties = async (query: Record<string, unknown>) => {
  const propertyQuery = new QueryBuilder(Property.find(), query)
    .search(propertySearchableFields)
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await propertyQuery.modelQuery;
  const meta = await propertyQuery.countTotal();
  return { data, meta };
};

const getPropertyById = async (id: string) => {
  const result = await Property.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return result;
};

const updateProperty = async (id: string, payload: Partial<IProperty>) => {
  const existing = await Property.findById(id);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const result = await Property.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteProperty = async (id: string) => {
  const existing = await Property.findById(id);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const result = await Property.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

export const propertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};