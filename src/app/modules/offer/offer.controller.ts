import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { offerService } from './offer.service';

const createOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.createOffer(
    req.user.userId,
    req.body.property,
    req.body.terms,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer submitted successfully',
    data: result,
  });
});

const counterOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.counterOffer(
    req.params.id,
    req.user.userId,
    req.body.terms,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Counter offer sent successfully',
    data: result,
  });
});

const getAllOffers = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.getAllOffers(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offers fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getMyOffers = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.getMyOffers(req.user.userId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My offers fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getReceivedOffers = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.getReceivedOffers(
    req.user.userId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Received offers fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getOfferById = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.getOfferById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer fetched successfully',
    data: result,
  });
});

const updateOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.updateOffer(
    req.params.id,
    req.user.userId,
    req.body.terms,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer updated successfully',
    data: result,
  });
});

const deleteOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.deleteOffer(req.params.id, req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer deleted successfully',
    data: result,
  });
});

const acceptOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.acceptOffer(req.params.id, req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer accepted successfully',
    data: result,
  });
});

const rejectOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.rejectOffer(req.params.id, req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer rejected successfully',
    data: result,
  });
});

const withdrawOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await offerService.withdrawOffer(req.params.id, req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer withdrawn successfully',
    data: result,
  });
});

export const offerController = {
  createOffer,
  counterOffer,
  getAllOffers,
  getMyOffers,
  getReceivedOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
};