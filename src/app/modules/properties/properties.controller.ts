import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { propertyService } from './properties.service';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  req.body.seller = req.user?.userId;
  const result = await propertyService.createProperty(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property created successfully',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getAllProperties(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getAllPropertiesForWeb = catchAsync(async (req: Request, res: Response) => {

  const result = await propertyService.getAllPropertiesForWeb(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties fetched successfully',
    data: result.data,
    meta: result.meta,
  });
})

const getPriceDroppedProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getPriceDroppedProperties(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Price-dropped properties fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getMyListingProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getMyListingProperties(
    req.user.userId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My listings fetched successfully',
    data: {
      properties: result.data,
      statusCounts: result.statusCounts,
    },
    meta: result.meta,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getPropertyById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property fetched successfully',
    data: result,
  });
});

const getPropertiesBySeller = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getPropertiesBySeller(
    req.params.sellerId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Seller properties fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.updateProperty(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property updated successfully',
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.deleteProperty(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property deleted successfully',
    data: result,
  });
});

// ================================================ admin controller =====================================

const approveProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.approveProperty(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property approved successfully',
    data: result,
  });
});

const rejectProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.rejectProperty(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property rejected successfully',
    data: result,
  });
});

export const propertyController = {
  createProperty,
  getAllProperties,
  getAllPropertiesForWeb,
  getPriceDroppedProperties,
  getMyListingProperties,
  getPropertyById,
  getPropertiesBySeller,
  updateProperty,
  deleteProperty,

  // admin
  approveProperty,
  rejectProperty,
};