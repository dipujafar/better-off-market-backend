
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { favoriteService } from './favorite.service';
import sendResponse from '../../utils/sendResponse';

const createFavorite = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req?.user?.userId;
  const result = await favoriteService.createFavorite(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Favorite created successfully',
    data: result,
  });

});

const getAllFavorite = catchAsync(async (req: Request, res: Response) => {
  req.query.user = req?.user?.userId;

  const result = await favoriteService.getAllFavorite(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All favorite fetched successfully',
    data: result,
  });

});

const getFavoriteById = catchAsync(async (req: Request, res: Response) => {
  const result = await favoriteService.getFavoriteById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Favorite fetched successfully',
    data: result,
  });

});
const updateFavorite = catchAsync(async (req: Request, res: Response) => {
  const result = await favoriteService.updateFavorite(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Favorite updated successfully',
    data: result,
  });

});


const deleteFavorite = catchAsync(async (req: Request, res: Response) => {
  const result = await favoriteService.deleteFavorite(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Favorite deleted successfully',
    data: result,
  });

});

export const favoriteController = {
  createFavorite,
  getAllFavorite,
  getFavoriteById,
  updateFavorite,
  deleteFavorite,
};