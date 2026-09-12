import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import { dashboardService } from "./dashboard.service";
import e, { Request, Response } from "express";

const getAdminProfileAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await dashboardService.getAdminProfileAnalytics();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin dashboard data fetched successfully',
        data: result,
    });
});

export const dashboardController = {
    getAdminProfileAnalytics
}