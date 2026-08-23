import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { IProperty } from './properties.interface';
import { PROPERTY_STATUS, propertySearchableFields, STATUS } from './properties.constants';
import { Property } from './properties.models';
import { Types } from 'mongoose';
import { FilterQuery } from 'mongoose';

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



const getPriceDroppedProperties = async (query: Record<string, unknown>) => {
  const filter: FilterQuery<IProperty> = {
    oldListingPrice: { $ne: null },
    $expr: { $gt: ['$oldListingPrice', '$listingPrice'] },
  } as FilterQuery<IProperty>;

  const propertyQuery = new QueryBuilder(Property.find(filter), query)
    .search(propertySearchableFields)
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await propertyQuery.modelQuery;
  const meta = await propertyQuery.countTotal();

  return { data, meta };
};


const getMyListingProperties = async (
  sellerId: string,
  query: Record<string, unknown>,
) => {
  const propertyQuery = new QueryBuilder(
    Property.find({ seller: sellerId }),
    query,
  )
    .search(propertySearchableFields)
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await propertyQuery.modelQuery;
  const meta = await propertyQuery.countTotal();

  const counts: { _id: string; count: number }[] = await Property.aggregate([
    { $match: { seller: new Types.ObjectId(sellerId), isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const countMap: Record<string, number> = {};
  let all = 0;

  for (const c of counts) {
    countMap[c._id] = c.count;
    all += c.count;
  }

  const statusCounts: Record<string, number> = { all };
  for (const key of PROPERTY_STATUS) {
    const label = STATUS[key];
    statusCounts[key] = countMap[label] || 0;
  }

  return { data, meta, statusCounts };
};

const getPropertyById = async (id: string) => {
  const result = await Property.findById(id).populate('seller');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return result;
};

const getPropertiesBySeller = async (
  sellerId: string,
  query: Record<string, unknown>,
) => {
  const propertyQuery = new QueryBuilder(
    Property.find({
      seller: sellerId,
      status: { $nin: [STATUS.pending, STATUS.rejected] },
    }),
    query,
  )
    .search(propertySearchableFields)
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await propertyQuery.modelQuery;
  const meta = await propertyQuery.countTotal();

  return { data, meta };
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


// ======================================= admin services =======================================
const approveProperty = async (id: string) => {
  const result = await Property.findByIdAndUpdate(id, { status: STATUS.active }, { new: true });


  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return result;
}

const rejectProperty = async (id: string) => {
  const result = await Property.findByIdAndUpdate(id, { status: STATUS.rejected }, { new: true });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  return result;
}

export const propertyService = {
  createProperty,
  getAllProperties,
  getPriceDroppedProperties,
  getMyListingProperties,
  getPropertyById,
  getPropertiesBySeller,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty
};