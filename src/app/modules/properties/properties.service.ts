import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { IProperty } from './properties.interface';
import { PROPERTY_STATUS, propertySearchableFields, STATUS } from './properties.constants';
import { Property } from './properties.models';
import { Types } from 'mongoose';
import { FilterQuery, PipelineStage } from 'mongoose';
import { PropertySearchQuery, toArray } from './properties.utils';
import { PropertyView } from '../PropertyView/PropertyView.model';

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


const getAllPropertiesForWeb = async (query: PropertySearchQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const counties = toArray(query.county);
  const propertyTypes = toArray(query.propertyType);
  const statuses = toArray(query.status) || [STATUS.active, STATUS.under_contact];

  const matchStage: Record<string, unknown> = {
    status: { $in: statuses },
  };

  if (counties?.length) {
    matchStage.county = { $in: counties };
  }

  if (propertyTypes?.length) {
    matchStage.propertyType = { $in: propertyTypes };
  }

  if (query.minPrice || query.maxPrice) {
    matchStage.listingPrice = {};
    if (query.minPrice) {
      (matchStage.listingPrice as Record<string, number>).$gte = Number(query.minPrice);
    }
    if (query.maxPrice) {
      (matchStage.listingPrice as Record<string, number>).$lte = Number(query.maxPrice);
    }
  }

  if (query.searchTerm?.trim()) {
    const regex = new RegExp(query.searchTerm.trim(), 'i');
    matchStage.$or = [
      { streetAddress: regex },
      { city: regex },
      { state: regex },
      { zipCode: regex },
      { county: regex },
    ];
  }

  const hasGeo = query.lat && query.lng;

  if (hasGeo) {
    const pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [Number(query.lng), Number(query.lat)],
          },
          distanceField: 'distance',
          spherical: true,
          query: matchStage,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await Property.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return {
      data,
      meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    lowest: { listingPrice: 1 },
    highest: { listingPrice: -1 },
  };
  const sort = sortMap[query.sortBy || 'newest'];

  const [data, total] = await Promise.all([
    Property.find(matchStage).sort(sort).skip(skip).limit(limit),
    Property.countDocuments(matchStage),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};



const getPriceDroppedProperties = async (query: Record<string, unknown>) => {
  const filter: FilterQuery<IProperty> = {
    oldListingPrice: { $ne: null },
    status: { $in: [STATUS.active, STATUS.under_contact] },
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

const increaseViewCount = async (id: string) => {
  const result = await Property.findByIdAndUpdate(id, { $inc: { totalViews: 1 } }, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  PropertyView.create({
    property: id,
    seller: result.seller,
  }).catch((err) => {
    console.error('Failed to log property view:', err);
  });

  return result;
}

const increaseRSVPCount = async (id: string) => {
  const result = await Property.findByIdAndUpdate(id, { $inc: { totalRsvp: 1 } }, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }
  return result;
}

export const propertyService = {
  createProperty,
  getAllProperties,
  getAllPropertiesForWeb,
  getPriceDroppedProperties,
  getMyListingProperties,
  getPropertyById,
  getPropertiesBySeller,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
  increaseViewCount,
  increaseRSVPCount
};