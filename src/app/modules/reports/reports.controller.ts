
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reportsService } from './reports.service';
import sendResponse from '../../utils/sendResponse';


const createReports = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req?.user?.userId;
  const result = await reportsService.createReports(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Reports created successfully',
    data: result,
  });

});

const getAllReports = catchAsync(async (req: Request, res: Response) => {

  const result = await reportsService.getAllReports(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All reports fetched successfully',
    data: result,
  });

});

const getReportsById = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.getReportsById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reports fetched successfully',
    data: result,
  });

});
const updateReports = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.updateReports(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reports updated successfully',
    data: result,
  });

});


const deleteReports = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.deleteReports(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reports deleted successfully',
    data: result,
  });

});

export const reportsController = {
  createReports,
  getAllReports,
  getReportsById,
  updateReports,
  deleteReports,
};