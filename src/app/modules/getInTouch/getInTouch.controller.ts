
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { getInTouchService } from './getInTouch.service';
import sendResponse from '../../utils/sendResponse';


const createGetInTouch = catchAsync(async (req: Request, res: Response) => {
  const result = await getInTouchService.createGetInTouch(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'GetInTouch created successfully',
    data: result,
  });

});

const getAllGetInTouch = catchAsync(async (req: Request, res: Response) => {

  const result = await getInTouchService.getAllGetInTouch(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All getInTouch fetched successfully',
    data: result,
  });

});

const getGetInTouchById = catchAsync(async (req: Request, res: Response) => {
  const result = await getInTouchService.getGetInTouchById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'GetInTouch fetched successfully',
    data: result,
  });

});
const updateGetInTouch = catchAsync(async (req: Request, res: Response) => {
  const result = await getInTouchService.updateGetInTouch(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'GetInTouch updated successfully',
    data: result,
  });

});


const deleteGetInTouch = catchAsync(async (req: Request, res: Response) => {
  const result = await getInTouchService.deleteGetInTouch(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'GetInTouch deleted successfully',
    data: result,
  });

});

export const getInTouchController = {
  createGetInTouch,
  getAllGetInTouch,
  getGetInTouchById,
  updateGetInTouch,
  deleteGetInTouch,
};