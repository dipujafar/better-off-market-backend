import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { statsService } from './stats.service';

const getPlatformStats = catchAsync(async (req: Request, res: Response) => {
    const result = await statsService.getPlatformStats();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Platform stats fetched successfully',
        data: result,
    });
});

const getUserOverview = catchAsync(async (req: Request, res: Response) => {
    const result = await statsService.getUserOverview(
        req.query.year as string | undefined,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User overview fetched successfully',
        data: result,
    });
});


export const statsController = { getPlatformStats, getUserOverview };